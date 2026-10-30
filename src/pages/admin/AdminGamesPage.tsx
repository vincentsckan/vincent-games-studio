import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getSupabase, type DbGame } from '../../lib/supabase'

export function AdminGamesPage() {
  const [rows, setRows] = useState<DbGame[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const sb = getSupabase()
    if (!sb) {
      setError('Supabase not configured')
      setLoading(false)
      return
    }
    const { data, error: qErr } = await sb
      .from('games')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
    if (qErr) {
      setError(qErr.message)
      setRows([])
    } else {
      setRows((data as DbGame[]) ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function togglePublished(row: DbGame) {
    const sb = getSupabase()
    if (!sb) return
    const { error: uErr } = await sb
      .from('games')
      .update({ published: !row.published })
      .eq('id', row.id)
    if (uErr) {
      setError(uErr.message)
      return
    }
    void load()
  }

  async function removeGame(row: DbGame) {
    if (!confirm(`刪除「${row.title}」？此操作無法復原。`)) return
    const sb = getSupabase()
    if (!sb) return
    const { error: dErr } = await sb.from('games').delete().eq('id', row.id)
    if (dErr) {
      setError(dErr.message)
      return
    }
    void load()
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">遊戲 Games</h1>
          <p className="mt-1 text-sm text-mist">建立、編輯、上傳封面／試玩／建置檔。</p>
        </div>
        <Link
          to="/admin/games/new"
          className="rounded-full bg-gold px-4 py-2 text-sm font-bold text-ink hover:bg-gold-dim"
        >
          + 新增 New
        </Link>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-rose/40 bg-rose/10 px-3 py-2 text-sm text-rose">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-10 text-mist">載入中…</p>
      ) : rows.length === 0 ? (
        <p className="mt-10 text-mist">尚無遊戲。點「新增」建立第一筆。</p>
      ) : (
        <ul className="mt-8 divide-y divide-white/10 rounded-2xl border border-white/10">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5"
            >
              <div className="min-w-0">
                <p className="font-semibold text-paper">{row.title}</p>
                <p className="font-en text-xs text-mist">
                  /{row.slug} · {row.type} · sort {row.sort_order} ·{' '}
                  {row.published ? (
                    <span className="text-teal">published</span>
                  ) : (
                    <span className="text-gold">draft</span>
                  )}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void togglePublished(row)}
                  className="rounded-full border border-white/15 px-3 py-1 text-xs hover:bg-white/5"
                >
                  {row.published ? '下架 Unpublish' : '上架 Publish'}
                </button>
                <Link
                  to={`/admin/games/${row.id}`}
                  className="rounded-full border border-teal/40 px-3 py-1 text-xs text-teal hover:bg-teal/10"
                >
                  編輯 Edit
                </Link>
                <button
                  type="button"
                  onClick={() => void removeGame(row)}
                  className="rounded-full border border-rose/40 px-3 py-1 text-xs text-rose hover:bg-rose/10"
                >
                  刪除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
