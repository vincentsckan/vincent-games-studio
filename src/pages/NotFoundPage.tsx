import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="font-en text-xs tracking-[0.3em] text-mist">404</p>
      <h1 className="mt-4 font-display text-3xl font-bold text-paper">頁面不存在</h1>
      <p className="mt-2 font-en text-sm text-mist">This page drifted into the fog.</p>
      <Link
        to="/"
        className="mt-8 rounded-full bg-gold px-5 py-2.5 text-sm font-bold text-ink hover:bg-gold-dim"
      >
        返回首頁
      </Link>
    </div>
  )
}
