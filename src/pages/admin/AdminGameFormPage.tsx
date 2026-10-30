import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  getSupabase,
  type DbGame,
  type StoreLinks,
} from '../../lib/supabase'

type FormState = {
  slug: string
  title: string
  tagline: string
  description: string
  type: '2D' | '3D'
  trailer_url: string
  price_cents: number
  currency: string
  steam: string
  itch: string
  published: boolean
  sort_order: number
  cover_path: string
  demo_path: string
  build_path: string
}

const emptyForm: FormState = {
  slug: '',
  title: '',
  tagline: '',
  description: '',
  type: '2D',
  trailer_url: '',
  price_cents: 0,
  currency: 'HKD',
  steam: '',
  itch: '',
  published: false,
  sort_order: 0,
  cover_path: '',
  demo_path: '',
  build_path: '',
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

async function uploadFile(
  bucket: 'covers' | 'demos' | 'builds',
  slug: string,
  file: File,
): Promise<string> {
  const sb = getSupabase()
  if (!sb) throw new Error('Supabase not configured')
  const ext = file.name.split('.').pop() || 'bin'
  const path = `${slug || 'untitled'}/${Date.now()}.${ext}`
  const { error } = await sb.storage.from(bucket).upload(path, file, {
    upsert: true,
    cacheControl: '3600',
  })
  if (error) throw error
  return path
}

export function AdminGameFormPage() {
  const { id } = useParams<{ id: string }>()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>(emptyForm)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [demoFile, setDemoFile] = useState<File | null>(null)
  const [buildFile, setBuildFile] = useState<File | null>(null)

  useEffect(() => {
    if (isNew) return
    const sb = getSupabase()
    if (!sb || !id) return
    let cancelled = false
    void sb
      .from('games')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error: qErr }) => {
        if (cancelled) return
        if (qErr || !data) {
          setError(qErr?.message ?? 'Game not found')
          setLoading(false)
          return
        }
        const row = data as DbGame
        const links = (row.store_links ?? {}) as StoreLinks
        setForm({
          slug: row.slug,
          title: row.title,
          tagline: row.tagline ?? '',
          description: row.description ?? '',
          type: row.type,
          trailer_url: row.trailer_url ?? '',
          price_cents: row.price_cents,
          currency: row.currency,
          steam: links.steam ?? '',
          itch: links.itch ?? '',
          published: row.published,
          sort_order: row.sort_order,
          cover_path: row.cover_path ?? '',
          demo_path: row.demo_path ?? '',
          build_path: row.build_path ?? '',
        })
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id, isNew])

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    const sb = getSupabase()
    if (!sb) {
      setError('Supabase not configured')
      setSaving(false)
      return
    }

    try {
      let slug = form.slug.trim() || slugify(form.title)
      if (!slug) throw new Error('Slug is required')

      let cover_path = form.cover_path || null
      let demo_path = form.demo_path || null
      let build_path = form.build_path || null

      if (coverFile) cover_path = await uploadFile('covers', slug, coverFile)
      if (demoFile) demo_path = await uploadFile('demos', slug, demoFile)
      if (buildFile) build_path = await uploadFile('builds', slug, buildFile)

      const store_links: StoreLinks = {}
      if (form.steam.trim()) store_links.steam = form.steam.trim()
      if (form.itch.trim()) store_links.itch = form.itch.trim()

      const payload = {
        slug,
        title: form.title.trim(),
        tagline: form.tagline.trim() || null,
        description: form.description.trim() || null,
        type: form.type,
        trailer_url: form.trailer_url.trim() || null,
        price_cents: Number(form.price_cents) || 0,
        currency: form.currency.trim() || 'HKD',
        store_links,
        published: form.published,
        sort_order: Number(form.sort_order) || 0,
        cover_path,
        demo_path,
        build_path,
      }

      if (isNew) {
        const { data, error: iErr } = await sb
          .from('games')
          .insert(payload)
          .select('id')
          .single()
        if (iErr) throw iErr
        navigate(`/admin/games/${(data as { id: string }).id}`, { replace: true })
      } else {
        const { error: uErr } = await sb.from('games').update(payload).eq('id', id!)
        if (uErr) throw uErr
        setForm((f) => ({
          ...f,
          slug,
          cover_path: cover_path ?? '',
          demo_path: demo_path ?? '',
          build_path: build_path ?? '',
        }))
        setCoverFile(null)
        setDemoFile(null)
        setBuildFile(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-mist">載入中…</p>
  }

  return (
    <div>
      <Link to="/admin" className="text-sm text-mist hover:text-gold">
        ← 列表 List
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold">
        {isNew ? '新增遊戲 New game' : '編輯遊戲 Edit game'}
      </h1>

      <form onSubmit={(e) => void onSubmit(e)} className="mt-8 max-w-2xl space-y-5">
        <label className="block">
          <span className="text-xs text-mist">Title *</span>
          <input
            required
            value={form.title}
            onChange={(e) => {
              const title = e.target.value
              setForm((f) => ({
                ...f,
                title,
                slug: isNew && !f.slug ? slugify(title) : f.slug,
              }))
            }}
            className="mt-1 w-full rounded-xl border border-white/10 bg-ink-2 px-3 py-2 text-sm outline-none focus:border-teal/50"
          />
        </label>

        <label className="block">
          <span className="text-xs text-mist">Slug *</span>
          <input
            required
            value={form.slug}
            onChange={(e) => setField('slug', e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-ink-2 px-3 py-2 font-en text-sm outline-none focus:border-teal/50"
          />
        </label>

        <label className="block">
          <span className="text-xs text-mist">Tagline</span>
          <input
            value={form.tagline}
            onChange={(e) => setField('tagline', e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-ink-2 px-3 py-2 text-sm outline-none focus:border-teal/50"
          />
        </label>

        <label className="block">
          <span className="text-xs text-mist">Description</span>
          <textarea
            rows={5}
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-ink-2 px-3 py-2 text-sm outline-none focus:border-teal/50"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs text-mist">Type</span>
            <select
              value={form.type}
              onChange={(e) => setField('type', e.target.value as '2D' | '3D')}
              className="mt-1 w-full rounded-xl border border-white/10 bg-ink-2 px-3 py-2 text-sm outline-none focus:border-teal/50"
            >
              <option value="2D">2D</option>
              <option value="3D">3D</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs text-mist">Sort order</span>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => setField('sort_order', Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-white/10 bg-ink-2 px-3 py-2 text-sm outline-none focus:border-teal/50"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs text-mist">Price (cents)</span>
            <input
              type="number"
              min={0}
              value={form.price_cents}
              onChange={(e) => setField('price_cents', Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-white/10 bg-ink-2 px-3 py-2 text-sm outline-none focus:border-teal/50"
            />
          </label>
          <label className="block">
            <span className="text-xs text-mist">Currency</span>
            <input
              value={form.currency}
              onChange={(e) => setField('currency', e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-ink-2 px-3 py-2 text-sm outline-none focus:border-teal/50"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-xs text-mist">Trailer URL</span>
          <input
            type="url"
            value={form.trailer_url}
            onChange={(e) => setField('trailer_url', e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-ink-2 px-3 py-2 text-sm outline-none focus:border-teal/50"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs text-mist">Steam URL</span>
            <input
              type="url"
              value={form.steam}
              onChange={(e) => setField('steam', e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-ink-2 px-3 py-2 text-sm outline-none focus:border-teal/50"
            />
          </label>
          <label className="block">
            <span className="text-xs text-mist">itch.io URL</span>
            <input
              type="url"
              value={form.itch}
              onChange={(e) => setField('itch', e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-ink-2 px-3 py-2 text-sm outline-none focus:border-teal/50"
            />
          </label>
        </div>

        <fieldset className="space-y-3 rounded-2xl border border-white/10 p-4">
          <legend className="px-1 text-xs font-semibold text-gold">Uploads / Storage</legend>
          <label className="block text-sm">
            <span className="text-mist">Cover (covers bucket)</span>
            {form.cover_path && (
              <p className="font-en text-[11px] text-teal/80">{form.cover_path}</p>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full text-xs text-fog"
            />
          </label>
          <label className="block text-sm">
            <span className="text-mist">Demo (demos bucket)</span>
            {form.demo_path && (
              <p className="font-en text-[11px] text-teal/80">{form.demo_path}</p>
            )}
            <input
              type="file"
              onChange={(e) => setDemoFile(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full text-xs text-fog"
            />
          </label>
          <label className="block text-sm">
            <span className="text-mist">Build (builds bucket)</span>
            {form.build_path && (
              <p className="font-en text-[11px] text-teal/80">{form.build_path}</p>
            )}
            <input
              type="file"
              onChange={(e) => setBuildFile(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full text-xs text-fog"
            />
          </label>
        </fieldset>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setField('published', e.target.checked)}
            className="rounded border-white/20"
          />
          Published（公開可見）
        </label>

        {error && (
          <p className="rounded-lg border border-rose/40 bg-rose/10 px-3 py-2 text-sm text-rose">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-gold px-5 py-2.5 text-sm font-bold text-ink hover:bg-gold-dim disabled:opacity-60"
          >
            {saving ? '儲存中…' : '儲存 Save'}
          </button>
          <Link
            to="/admin"
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-fog hover:bg-white/5"
          >
            取消
          </Link>
        </div>
      </form>
    </div>
  )
}
