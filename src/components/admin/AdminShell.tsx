import { Link, Outlet, useNavigate } from 'react-router-dom'
import { getSupabase } from '../../lib/supabase'

export function AdminShell() {
  const navigate = useNavigate()

  async function signOut() {
    const sb = getSupabase()
    if (sb) await sb.auth.signOut()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-dvh bg-ink text-paper">
      <header className="border-b border-white/10 bg-ink-2">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="font-display text-base font-bold text-gold">
              管理後台
            </Link>
            <Link
              to="/"
              className="inline-flex min-h-10 items-center text-sm text-mist hover:text-paper"
            >
              ← 公開網站
            </Link>
          </div>
          <button
            type="button"
            onClick={() => void signOut()}
            className="inline-flex min-h-11 items-center rounded-xl border border-white/15 px-4 text-sm font-semibold text-fog hover:bg-white/5"
          >
            登出
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
