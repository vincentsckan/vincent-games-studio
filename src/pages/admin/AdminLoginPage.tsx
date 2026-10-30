import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { getSupabase, isSupabaseConfigured } from '../../lib/supabase'
import { adminBtnPrimary, fieldClass, labelClass } from '../../components/ui/States'

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
      <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-bold">管理登入</h1>
        <p className="mt-4 text-base leading-relaxed text-mist">
          尚未設定 Supabase。請見 README「Phase 1 · Supabase」步驟，填入{' '}
          <code className="text-teal">VITE_SUPABASE_*</code>。
        </p>
        <Link
          to="/"
          className="mt-10 inline-flex min-h-12 items-center justify-center text-base text-teal hover:underline"
        >
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
      setError('無法連接 Supabase')
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
      <p className="text-sm font-semibold text-teal">管理後台</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-paper">登入</h1>
      <p className="mt-3 text-base text-mist">
        使用 Supabase 電郵／密碼登入。請先在 Dashboard 建立管理員帳號。
      </p>

      <form onSubmit={(e) => void onSubmit(e)} className="mt-10 space-y-6">
        <label className="block">
          <span className={labelClass}>電郵</span>
          <input
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={fieldClass}
          />
        </label>
        <label className="block">
          <span className={labelClass}>密碼</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={fieldClass}
          />
        </label>
        {error && (
          <p className="rounded-xl border border-rose/40 bg-rose/10 px-4 py-3 text-sm text-rose">
            {error}
          </p>
        )}
        <button type="submit" disabled={loading} className={`w-full ${adminBtnPrimary}`}>
          {loading ? '登入中…' : '登入'}
        </button>
      </form>

      <Link
        to="/"
        className="mt-10 text-center text-base text-mist hover:text-gold"
      >
        ← 公開網站
      </Link>
    </div>
  )
}
