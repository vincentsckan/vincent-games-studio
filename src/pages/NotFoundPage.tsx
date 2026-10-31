import { Link } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'

export function NotFoundPage() {
  usePageMeta({
    title: '頁面不存在｜Vincent Games Studio',
    description: '搵唔到呢頁——返去首頁或者遊戲目錄繼續玩。',
  })

  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold tracking-widest text-mist">404</p>
      <h1 className="mt-4 font-display text-3xl font-bold text-paper">頁面不存在</h1>
      <p className="mt-3 text-base text-mist">呢個連結可能過期，或者打錯地址。</p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          className="inline-flex min-h-12 items-center rounded-full bg-gold px-6 text-base font-bold text-ink hover:bg-gold-dim"
        >
          返回首頁
        </Link>
        <Link
          to="/games"
          className="inline-flex min-h-12 items-center rounded-full border border-white/15 px-6 text-base font-semibold text-fog hover:bg-white/5"
        >
          瀏覽遊戲
        </Link>
      </div>
    </div>
  )
}
