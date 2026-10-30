import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { getSupabase, isSupabaseConfigured } from '../../lib/supabase'

export function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setSession(null)
      return
    }
    const sb = getSupabase()
    if (!sb) {
      setSession(null)
      return
    }
    let mounted = true
    void sb.auth.getSession().then(({ data }) => {
      if (mounted) setSession(data.session)
    })
    const { data: sub } = sb.auth.onAuthStateChange((_event, next) => {
      setSession(next)
    })
    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  if (!isSupabaseConfigured) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold text-paper">Supabase 未設定</h1>
        <p className="mt-3 text-sm text-mist">
          請複製 <code className="text-teal">.env.example</code> 為{' '}
          <code className="text-teal">.env.local</code>，填入{' '}
          <code className="text-gold">VITE_SUPABASE_URL</code> 與{' '}
          <code className="text-gold">VITE_SUPABASE_ANON_KEY</code>，並執行 migration。
        </p>
      </div>
    )
  }

  if (session === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-mist">
        驗證中…
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
