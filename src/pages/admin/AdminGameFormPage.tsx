import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  getSupabase,
  type DbGame,
  type StoreLinks,
} from '../../lib/supabase'
import {
  adminBtnPrimary,
  adminBtnSecondary,
  fieldClass,
  labelClass,
  LoadingBlock,
} from '../../components/ui/States'

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
  if (!sb) throw new Error('尚未設定 Supabase')
  const ext = file.name.split('.').pop() || 'bin'
  const path = `${slug || 'untitled'}/${Date.now()}.${ext}`
  const { error } = await sb.storage.from(bucket).upload(path, file, {
    upsert: true,
    cacheControl: '3600',
  })
  if (error) throw error
  return path
}

const fileInputClass =
  'mt-2 block w-full cursor-pointer rounded-xl border border-dashed border-white/20 bg-ink-2 px-4 py-4 text-sm text-fog file:mr-4 file:rounded-lg file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-paper hover:border-teal/40'

export function AdminGameFormPage() {
  const { id } = useParams<{ id: string }>()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>(emptyForm)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedOk, setSavedOk] = useState(false)
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
          setError(qErr?.message ?? '找不到遊戲')
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
    setSavedOk(false)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSavedOk(false)
    setSaving(true)
    const sb = getSupabase()
    if (!sb) {
      setError('尚未設定 Supabase')
      setSaving(false)
      return
    }

    try {
      let slug = form.slug.trim() || slugify(form.title)
      if (!slug) throw new Error('請填寫網址代稱（Slug）')

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
        setSavedOk(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <LoadingBlock label="載入表單…" />
  }

  return (
    <div>
      <Link
        to="/admin"
        className="inline-flex min-h-11 items-center text-base text-mist hover:text-gold"
      >
        ← 返回列表
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold">
        {isNew ? '新增遊戲' : '編輯遊戲'}
      </h1>
      <p className="mt-2 text-base text-mist">
        填寫資料 → 上傳檔案 → 儲存。勾選「發佈」後會出現在公開網站。
      </p>

      <form onSubmit={(e) => void onSubmit(e)} className="mt-10 space-y-7">
        <section className="space-y-6 rounded-2xl border border-white/10 bg-ink-2/40 p-5 sm:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gold">基本資料</h2>

          <label className="block">
            <span className={labelClass}>標題 *</span>
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
                setSavedOk(false)
              }}
              className={fieldClass}
              placeholder="例如：霧港燈影"
            />
          </label>

          <label className="block">
            <span className={labelClass}>網址代稱（Slug）*</span>
            <input
              required
              value={form.slug}
              onChange={(e) => setField('slug', e.target.value)}
              className={`${fieldClass} font-en`}
              placeholder="mist-harbor-lights"
            />
          </label>

          <label className="block">
            <span className={labelClass}>標語</span>
            <input
              value={form.tagline}
              onChange={(e) => setField('tagline', e.target.value)}
              className={fieldClass}
              placeholder="一句吸引玩家的話"
            />
          </label>

          <label className="block">
            <span className={labelClass}>簡介</span>
            <textarea
              rows={6}
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              className={fieldClass}
              placeholder="遊戲故事與賣點…"
            />
          </label>

          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block">
              <span className={labelClass}>類型</span>
              <select
                value={form.type}
                onChange={(e) => setField('type', e.target.value as '2D' | '3D')}
                className={fieldClass}
              >
                <option value="2D">2D</option>
                <option value="3D">3D</option>
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>排序（數字愈小愈前）</span>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setField('sort_order', Number(e.target.value))}
                className={fieldClass}
              />
            </label>
          </div>
        </section>

        <section className="space-y-6 rounded-2xl border border-white/10 bg-ink-2/40 p-5 sm:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gold">價格與商店連結</h2>

          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block">
              <span className={labelClass}>價格（分／cents）</span>
              <input
                type="number"
                min={0}
                value={form.price_cents}
                onChange={(e) => setField('price_cents', Number(e.target.value))}
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className={labelClass}>貨幣</span>
              <input
                value={form.currency}
                onChange={(e) => setField('currency', e.target.value)}
                className={fieldClass}
              />
            </label>
          </div>

          <label className="block">
            <span className={labelClass}>預告片網址</span>
            <input
              type="url"
              value={form.trailer_url}
              onChange={(e) => setField('trailer_url', e.target.value)}
              className={fieldClass}
              placeholder="https://"
            />
          </label>

          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block">
              <span className={labelClass}>Steam 網址</span>
              <input
                type="url"
                value={form.steam}
                onChange={(e) => setField('steam', e.target.value)}
                className={fieldClass}
                placeholder="https://"
              />
            </label>
            <label className="block">
              <span className={labelClass}>itch.io 網址</span>
              <input
                type="url"
                value={form.itch}
                onChange={(e) => setField('itch', e.target.value)}
                className={fieldClass}
                placeholder="https://"
              />
            </label>
          </div>
        </section>

        <section className="space-y-6 rounded-2xl border border-white/10 bg-ink-2/40 p-5 sm:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gold">上傳</h2>
          <p className="text-sm text-mist">選擇檔案後按下方「儲存」才會上傳到 Storage。</p>

          <label className="block">
            <span className={labelClass}>封面圖片</span>
            {form.cover_path && (
              <p className="mt-1 break-all font-en text-xs text-teal/80">{form.cover_path}</p>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                setCoverFile(e.target.files?.[0] ?? null)
                setSavedOk(false)
              }}
              className={fileInputClass}
            />
          </label>

          <label className="block">
            <span className={labelClass}>試玩檔</span>
            {form.demo_path && (
              <p className="mt-1 break-all font-en text-xs text-teal/80">{form.demo_path}</p>
            )}
            <input
              type="file"
              onChange={(e) => {
                setDemoFile(e.target.files?.[0] ?? null)
                setSavedOk(false)
              }}
              className={fileInputClass}
            />
          </label>

          <label className="block">
            <span className={labelClass}>建置檔（完整版）</span>
            {form.build_path && (
              <p className="mt-1 break-all font-en text-xs text-teal/80">{form.build_path}</p>
            )}
            <input
              type="file"
              onChange={(e) => {
                setBuildFile(e.target.files?.[0] ?? null)
                setSavedOk(false)
              }}
              className={fileInputClass}
            />
          </label>
        </section>

        <label className="flex min-h-14 cursor-pointer items-center gap-4 rounded-2xl border border-white/10 bg-ink-2/40 px-5 py-4">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setField('published', e.target.checked)}
            className="h-5 w-5 rounded border-white/20"
          />
          <span>
            <span className="block text-base font-semibold text-paper">發佈到公開網站</span>
            <span className="text-sm text-mist">勾選後訪客可於遊戲目錄看到此作品</span>
          </span>
        </label>

        {error && (
          <p className="rounded-xl border border-rose/40 bg-rose/10 px-4 py-3 text-sm text-rose">
            {error}
          </p>
        )}
        {savedOk && (
          <p className="rounded-xl border border-teal/40 bg-teal/10 px-4 py-3 text-sm text-teal">
            已儲存。
          </p>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          <button type="submit" disabled={saving} className={adminBtnPrimary}>
            {saving ? '儲存中…' : '儲存'}
          </button>
          <Link to="/admin" className={adminBtnSecondary}>
            取消
          </Link>
        </div>
      </form>
    </div>
  )
}
