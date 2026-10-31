import { Link, useParams } from 'react-router-dom'
import { GameArt, GalleryFrame } from '../components/GameArt'
import { GameCtaRow } from '../components/CtaButton'
import { EmptyState, LoadingBlock } from '../components/ui/States'
import { useCatalogGame } from '../hooks/useCatalogGames'
import { usePageMeta } from '../hooks/usePageMeta'

const statusLabel: Record<string, string> = {
  demo: '可試玩',
  'early-access': '搶先體驗',
  released: '已發行',
  'coming-soon': '即將推出',
}

function GameDetailMeta({
  titleZh,
  taglineZh,
  slug,
}: {
  titleZh?: string
  taglineZh?: string
  slug?: string
}) {
  const title = titleZh ? `${titleZh}｜Vincent Games Studio` : '遊戲詳情｜Vincent Games Studio'
  const description =
    taglineZh ??
    '瀏覽 Vincent Games Studio 遊戲詳情，試玩、下載、Wishlist。'
  const image = slug ? `og/${slug}.jpg` : 'og-default.jpg'
  usePageMeta({ title, description, image })
  return null
}

export function GameDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { game, loading, error } = useCatalogGame(slug)

  if (loading) {
    return (
      <>
        <GameDetailMeta slug={slug} />
        <LoadingBlock label="載入遊戲詳情…" />
      </>
    )
  }

  if (!game) {
    return (
      <div className="px-4 py-20">
        <GameDetailMeta slug={slug} />
        <EmptyState
          title="找不到這款遊戲"
          description={error ?? '連結可能已失效，或作品尚未公開。'}
          actionLabel="返回遊戲列表"
          actionTo="/games"
        />
      </div>
    )
  }

  const galleryLabels = [
    `${game.titleZh} — 氛圍`,
    `${game.titleZh} — 玩法`,
    `${game.titleZh} — 細節`,
    `${game.titleZh} — 世界`,
  ]

  return (
    <article>
      <GameDetailMeta titleZh={game.titleZh} taglineZh={game.taglineZh} slug={game.slug} />
      <header className="relative overflow-hidden border-b border-white/8">
        <div
          className="absolute inset-0 -z-10 opacity-80"
          style={{
            background: `radial-gradient(ellipse 80% 70% at 80% 20%, ${game.palette.via}45, transparent 55%), linear-gradient(180deg, ${game.palette.from}, #08080f 85%)`,
          }}
        />
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:py-16">
          <div>
            <Link
              to="/games"
              className="mb-6 inline-flex min-h-11 items-center text-base text-mist hover:text-gold"
            >
              ← 遊戲列表
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold">
                {statusLabel[game.status] ?? game.status}
              </span>
              <span className="rounded-full border border-teal/30 bg-teal/10 px-3 py-1.5 font-en text-xs text-teal">
                {game.dimension}
              </span>
              <span className="text-sm text-mist">{game.year}</span>
            </div>
            <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-paper sm:text-5xl">
              {game.titleZh}
            </h1>
            <p className="mt-1 font-en text-lg text-mist">{game.titleEn}</p>
            <p className="mt-4 text-lg text-paper/90 text-balance">{game.taglineZh}</p>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-fog">{game.hookZh}</p>
            <GameCtaRow links={game.links} className="mt-8" />
          </div>
          <GameArt
            game={game}
            className="mx-auto max-w-md shadow-2xl shadow-black/50 lg:max-w-none"
          />
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <p className="text-sm font-semibold text-teal">遊玩體驗</p>
        <h2 className="mt-2 font-display text-2xl font-bold text-paper sm:text-3xl">玩法介紹</h2>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-fog">{game.gameplayZh}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {game.genres.map((g) => (
            <span key={g} className="rounded-lg bg-white/5 px-3 py-1.5 text-sm text-fog">
              {g}
            </span>
          ))}
        </div>
      </section>

      {game.features.length > 0 && (
        <section className="border-y border-white/8 bg-ink-2/60">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <p className="text-sm font-semibold text-gold">特色</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-paper sm:text-3xl">遊戲亮點</h2>
            <ul className="mt-10 grid gap-5 md:grid-cols-3">
              {game.features.map((f) => (
                <li
                  key={f.titleEn}
                  className="rounded-2xl border border-white/10 bg-panel/40 p-6"
                >
                  <div
                    className="mb-4 h-1 w-12 rounded-full"
                    style={{ background: game.palette.accent }}
                  />
                  <h3 className="font-display text-lg font-bold text-paper">{f.titleZh}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-fog">{f.bodyZh}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <p className="text-sm font-semibold text-teal">截圖</p>
        <h2 className="mt-2 font-display text-2xl font-bold text-paper sm:text-3xl">畫面預覽</h2>
        <p className="mt-2 text-sm text-mist">佔位畫面 — 之後會替換成真實截圖。</p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {galleryLabels.map((label, i) => (
            <li key={label}>
              <GalleryFrame game={game} index={i} label={label} />
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-white/8 bg-ink-2">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6">
          <h2 className="font-display text-3xl font-bold text-paper sm:text-4xl">準備好了嗎？</h2>
          <p className="mx-auto mt-3 max-w-md text-mist">試玩 · 下載 · Wishlist · itch.io</p>
          <GameCtaRow links={game.links} className="mt-8 justify-center" />
          <p className="mt-10">
            <Link to="/games" className="inline-flex min-h-11 items-center text-base text-fog hover:text-gold">
              ← 瀏覽其他作品
            </Link>
          </p>
        </div>
      </section>
    </article>
  )
}
