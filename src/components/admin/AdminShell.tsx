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
      <header className="border-b border-white/10 bg-ink-2/90">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="font-display text-sm font-bold text-gold">
              Admin
            </Link>
            <Link to="/" className="text-xs text-mist hover:text-paper">
              ← 公開站 Public
            </Link>
          </div>
          <button
            type="button"
            onClick={() => void signOut()}
            className="rounded-full border border-white/15 px-3 py-1 text-xs text-fog hover:bg-white/5"
          >
            登出 Sign out
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
