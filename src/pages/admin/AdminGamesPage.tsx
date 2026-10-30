import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getSupabase, type DbGame } from '../../lib/supabase'
import {
  adminBtnGhost,
  adminBtnPrimary,
  EmptyState,
  LoadingBlock,
} from '../../components/ui/States'

export function AdminGamesPage() {
  const [rows, setRows] = useState<DbGame[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const sb = getSupabase()
    if (!sb) {
      setError('尚未設定 Supabase')
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">遊戲管理</h1>
          <p className="mt-2 text-base text-mist">建立、編輯、上傳封面／試玩／建置檔，再發佈到公開站。</p>
        </div>
        <Link to="/admin/games/new" className={adminBtnPrimary}>
          ＋ 新增遊戲
        </Link>
      </div>

      {error && (
        <p className="mt-6 rounded-xl border border-rose/40 bg-rose/10 px-4 py-3 text-sm text-rose">
          {error}
        </p>
      )}

      {loading ? (
        <LoadingBlock label="載入遊戲列表…" />
      ) : rows.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="尚未有遊戲"
            description="按「新增遊戲」建立第一筆，儲存後可再上傳檔案並發佈。"
            actionLabel="新增遊戲"
            actionTo="/admin/games/new"
          />
        </div>
      ) : (
        <ul className="mt-10 space-y-4">
          {rows.map((row) => (
            <li
              key={row.id}
              className="rounded-2xl border border-white/10 bg-ink-2/60 p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-lg font-semibold text-paper">{row.title}</p>
                  <p className="mt-1 font-en text-sm text-mist">
                    /{row.slug} · {row.type} · 排序 {row.sort_order}
                  </p>
                  <p className="mt-2">
                    {row.published ? (
                      <span className="rounded-full bg-teal/15 px-3 py-1 text-sm font-semibold text-teal">
                        已發佈
                      </span>
                    ) : (
                      <span className="rounded-full bg-gold/15 px-3 py-1 text-sm font-semibold text-gold">
                        草稿
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void togglePublished(row)}
                    className={adminBtnGhost}
                  >
                    {row.published ? '下架' : '發佈'}
                  </button>
                  <Link to={`/admin/games/${row.id}`} className={adminBtnGhost}>
                    編輯
                  </Link>
                  <button
                    type="button"
                    onClick={() => void removeGame(row)}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-rose/40 px-4 text-sm font-semibold text-rose hover:bg-rose/10"
                  >
                    刪除
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
