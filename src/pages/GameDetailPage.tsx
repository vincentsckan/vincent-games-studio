import { Link, useParams } from 'react-router-dom'
import { GameArt, GalleryFrame } from '../components/GameArt'
import { GameCtaRow } from '../components/CtaButton'
import { Reveal, RevealGroup, RevealItem } from '../components/Reveal'
import { useCatalogGame } from '../hooks/useCatalogGames'

const statusLabel: Record<string, string> = {
  demo: '可試玩 Demo',
  'early-access': '搶先體驗 Early Access',
  released: '已發行 Released',
  'coming-soon': '即將推出 Coming Soon',
}

export function GameDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { game, loading } = useCatalogGame(slug)

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center text-mist">載入中…</div>
    )
  }

  if (!game) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold text-paper">找不到這款遊戲</h1>
        <p className="mt-2 text-mist">Game not found.</p>
        <Link to="/games" className="mt-8 inline-block text-teal hover:underline">
          ← 返回遊戲列表
        </Link>
      </div>
    )
  }

  const galleryLabels = [
    `${game.titleZh} — 氛圍截圖 Atmosphere`,
    `${game.titleZh} — 玩法 Gameplay`,
    `${game.titleZh} — 細節 Detail`,
    `${game.titleZh} — 世界 World`,
  ]

  return (
    <article>
      <header className="relative overflow-hidden border-b border-white/5">
        <div
          className="absolute inset-0 -z-10 opacity-80"
          style={{
            background: `radial-gradient(ellipse 80% 70% at 80% 20%, ${game.palette.via}55, transparent 55%), linear-gradient(180deg, ${game.palette.from}, #07070c 85%)`,
          }}
        />
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:py-20">
          <Reveal>
            <Link
              to="/games"
              className="mb-6 inline-flex text-sm text-mist hover:text-gold transition-colors"
            >
              ← 遊戲列表 Games
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
                {statusLabel[game.status]}
              </span>
              <span className="rounded-full border border-teal/30 bg-teal/10 px-3 py-1 font-en text-xs text-teal">
                {game.dimension}
              </span>
              <span className="font-en text-xs text-mist">{game.year}</span>
            </div>
            <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-paper sm:text-5xl">
              {game.titleZh}
            </h1>
            <p className="mt-1 font-en text-xl text-fog">{game.titleEn}</p>
            <p className="mt-4 text-lg text-paper/90 text-balance">{game.taglineZh}</p>
            <p className="mt-1 font-en text-sm text-mist">{game.taglineEn}</p>
            <p className="mt-6 max-w-xl text-fog leading-relaxed">{game.hookZh}</p>
            <p className="mt-2 max-w-xl font-en text-sm text-mist/90 leading-relaxed">
              {game.hookEn}
            </p>
            <GameCtaRow links={game.links} className="mt-8" />
          </Reveal>
          <Reveal delay={0.1}>
            <GameArt game={game} className="mx-auto max-w-md shadow-2xl shadow-black/50 lg:max-w-none" />
          </Reveal>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reveal>
          <p className="font-en text-xs font-semibold uppercase tracking-[0.2em] text-teal">
            Gameplay
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-paper">遊玩體驗</h2>
          <p className="mt-4 max-w-3xl text-fog leading-relaxed">{game.gameplayZh}</p>
          <p className="mt-2 max-w-3xl font-en text-sm text-mist leading-relaxed">
            {game.gameplayEn}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {game.genres.map((g) => (
              <span key={g} className="rounded-lg bg-white/5 px-3 py-1 text-xs text-fog">
                {g}
              </span>
            ))}
          </div>
        </Reveal>
      </section>

      {game.features.length > 0 && (
        <section className="border-y border-white/5 bg-ink-2/60">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <Reveal>
              <p className="font-en text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                Features
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold text-paper">特色</h2>
            </Reveal>
            <RevealGroup className="mt-10 grid gap-6 md:grid-cols-3">
              {game.features.map((f) => (
                <RevealItem
                  key={f.titleEn}
                  className="rounded-2xl border border-white/10 bg-panel/40 p-6"
                >
                  <div
                    className="mb-4 h-1 w-12 rounded-full"
                    style={{ background: game.palette.accent }}
                  />
                  <h3 className="font-display text-lg font-bold text-paper">{f.titleZh}</h3>
                  <p className="font-en text-xs text-mist">{f.titleEn}</p>
                  <p className="mt-3 text-sm text-fog leading-relaxed">{f.bodyZh}</p>
                  <p className="mt-2 font-en text-xs text-mist/80 leading-relaxed">{f.bodyEn}</p>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reveal>
          <p className="font-en text-xs font-semibold uppercase tracking-[0.2em] text-teal">
            Gallery
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-paper">截圖</h2>
          <p className="mt-2 text-sm text-mist">
            佔位漸層／SVG 畫面 — 之後以真實截圖替換。
          </p>
        </Reveal>
        <RevealGroup className="mt-8 grid gap-4 sm:grid-cols-2">
          {galleryLabels.map((label, i) => (
            <RevealItem key={label}>
              <GalleryFrame game={game} index={i} label={label} />
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <section className="border-t border-white/5 bg-gradient-to-b from-ink-2 to-ink">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
          <Reveal>
            <h2 className="font-display text-3xl font-bold text-paper sm:text-5xl">
              準備好了嗎？
            </h2>
            <p className="mx-auto mt-3 max-w-md font-en text-mist">
              Try · Download · Wishlist · itch.io
            </p>
            <GameCtaRow links={game.links} className="mt-8 justify-center" />
            <p className="mt-8">
              <Link to="/games" className="text-sm text-fog hover:text-gold">
                ← 瀏覽其他作品
              </Link>
            </p>
          </Reveal>
        </div>
      </section>
    </article>
  )
}
