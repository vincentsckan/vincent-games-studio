import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { getSupabase, isSupabaseConfigured } from '../../lib/supabase'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from =
    (location.state as { from?: string } | null)?.from &&
    typeof (location.state as { from?: string }).from === 'string'
      ? (location.state as { from: string }).from
      : '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasSession, setHasSession] = useState<boolean | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setHasSession(false)
      return
    }
    const sb = getSupabase()
    if (!sb) {
      setHasSession(false)
      return
    }
    void sb.auth.getSession().then(({ data }) => {
      setHasSession(Boolean(data.session))
    })
  }, [])

  if (!isSupabaseConfigured) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Admin 登入</h1>
        <p className="mt-4 text-sm text-mist">
          尚未設定 Supabase。請見 README「Phase 1 · Supabase」步驟。
        </p>
        <Link to="/" className="mt-8 inline-block text-teal hover:underline">
          ← 回首頁
        </Link>
      </div>
    )
  }

  if (hasSession) {
    return <Navigate to={from} replace />
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const sb = getSupabase()
    if (!sb) {
      setError('Supabase client unavailable')
      setLoading(false)
      return
    }
    const { error: authError } = await sb.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (authError) {
      setError(authError.message)
      return
    }
    navigate(from, { replace: true })
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-16">
      <p className="font-en text-xs font-semibold uppercase tracking-[0.2em] text-teal">
        Admin
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold text-paper">登入 Login</h1>
      <p className="mt-2 text-sm text-mist">
        使用 Supabase Auth（Email / Password）。請在 Dashboard 建立管理員帳號。
      </p>

      <form onSubmit={(e) => void onSubmit(e)} className="mt-8 space-y-4">
        <label className="block">
          <span className="text-xs text-mist">Email</span>
          <input
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-ink-2 px-3 py-2.5 text-sm text-paper outline-none focus:border-teal/50"
          />
        </label>
        <label className="block">
          <span className="text-xs text-mist">Password</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-ink-2 px-3 py-2.5 text-sm text-paper outline-none focus:border-teal/50"
          />
        </label>
        {error && (
          <p className="rounded-lg border border-rose/40 bg-rose/10 px-3 py-2 text-sm text-rose">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-gold py-2.5 text-sm font-bold text-ink hover:bg-gold-dim disabled:opacity-60"
        >
          {loading ? '登入中…' : '登入 Sign in'}
        </button>
      </form>

      <Link to="/" className="mt-8 text-center text-sm text-mist hover:text-gold">
        ← 公開網站
      </Link>
    </div>
  )
}
