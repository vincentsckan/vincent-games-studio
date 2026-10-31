import { Link } from 'react-router-dom'
import type { Game } from '../data/games'
import { GameArt } from './GameArt'

type ZoneDef = {
  zoneTitle: string
  blurb: string
  match: (g: Game) => boolean
  fallbackSlug: string
}

const ZONES: ZoneDef[] = [
  {
    zoneTitle: '舊邨走廊',
    blurb: '電燈忽明忽滅，找鑰匙落樓。',
    match: (g) => g.id === 'midnight-estate' || g.slug === 'midnight-estate',
    fallbackSlug: 'midnight-estate',
  },
  {
    zoneTitle: '天台夜色',
    blurb: '屋頂之間跳，捉住夜晚。',
    match: (g) => g.id === 'rooftop-cat' || g.slug === 'rooftop-cat',
    fallbackSlug: 'rooftop-cat',
  },
  {
    zoneTitle: '旺角霓虹',
    blurb: '燈海巷仔，追到心跳加速。',
    match: (g) => g.id === 'neon-chase' || g.slug === 'neon-chase',
    fallbackSlug: 'neon-chase',
  },
  {
    zoneTitle: '茶餐廳節奏',
    blurb: '叮叮聲一響，餐單搶住做。',
    match: (g) => g.id === 'tea-rush' || g.slug === 'tea-rush',
    fallbackSlug: 'tea-rush',
  },
  {
    zoneTitle: '凍肉冷庫',
    blurb: '鉤上滴血，找鑰匙逃命。',
    match: (g) => g.id === 'cold-hold' || g.slug === 'cold-hold',
    fallbackSlug: 'cold-hold',
  },
  {
    zoneTitle: '後巷夜診',
    blurb: '霓虹診所，血清換命。',
    match: (g) => g.id === 'alley-clinic' || g.slug === 'alley-clinic',
    fallbackSlug: 'alley-clinic',
  },
]

function assetUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path
  const base = import.meta.env.BASE_URL || '/'
  return `${base}${path.replace(/^\//, '')}`
}

function resolveZoneGame(games: Game[], zone: ZoneDef): Game | undefined {
  return games.find(zone.match) ?? games.find((g) => g.slug === zone.fallbackSlug)
}

/** Full-bleed cover for map cells (no fixed aspect). */
function ZoneBackdrop({ game }: { game: Game }) {
  const { palette, coverImage } = game
  return (
    <div className="absolute inset-0" aria-hidden>
      {coverImage ? (
        <img
          src={assetUrl(coverImage)}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          loading="lazy"
        />
      ) : (
        <div
          className="h-full w-full"
          style={{
            background: `linear-gradient(145deg, ${palette.from} 0%, ${palette.via} 48%, ${palette.to} 100%)`,
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/25" />
    </div>
  )
}

export function StreetMap({ games }: { games: Game[] }) {
  const zones = ZONES.map((z) => ({
    ...z,
    game: resolveZoneGame(games, z),
  })).filter((z) => z.game)

  if (zones.length === 0) return null

  return (
    <section
      id="street-map"
      className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20"
      aria-labelledby="street-map-title"
    >
      <div className="mb-8 max-w-2xl sm:mb-10">
        <p className="text-sm font-semibold tracking-wide text-rose">街景</p>
        <h2
          id="street-map-title"
          className="mt-2 font-display text-3xl font-bold text-paper sm:text-4xl"
        >
          香港街景地圖
        </h2>
        <p className="mt-3 text-base leading-relaxed text-mist">
          點一下區域，入去對應嘅遊戲世界。
        </p>
        <p className="mt-2 text-sm text-fog">滑過睇簡介 · 撳入去玩</p>
      </div>

      {/* Mobile: stacked tappable cards */}
      <ul className="grid gap-4 md:hidden">
        {zones.map(({ zoneTitle, blurb, game }) => {
          if (!game) return null
          return (
            <li key={zoneTitle}>
              <Link
                to={`/games/${game.slug}`}
                className="group flex overflow-hidden rounded-2xl border border-white/10 bg-panel/50 transition-colors hover:border-gold/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
              >
                <div className="w-28 shrink-0">
                  <GameArt game={game} variant="thumb" showCaption={false} className="rounded-none" />
                </div>
                <div className="flex flex-1 flex-col justify-center p-4">
                  <p className="text-xs font-semibold tracking-wide text-gold">{zoneTitle}</p>
                  <h3 className="mt-1 font-display text-lg font-bold text-paper group-hover:text-gold">
                    {game.titleEn}
                  </h3>
                  <p className="mt-1 text-sm leading-snug text-fog">{blurb}</p>
                  <span className="mt-2 text-xs font-semibold text-teal">睇詳情 · 試玩 →</span>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>

      {/* Desktop / tablet: stylized 2×2 street map */}
      <div
        className="relative hidden overflow-hidden rounded-3xl border border-white/10 bg-ink-3 md:block"
        role="list"
        aria-label="香港街景地圖區域"
      >
        <div
          className="pointer-events-none absolute inset-0 z-[1] opacity-30"
          aria-hidden
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />
        <div
          className="pointer-events-none absolute -top-20 right-10 z-[1] h-56 w-56 rounded-full bg-rose/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 left-8 z-[1] h-48 w-48 rounded-full bg-teal/15 blur-3xl"
          aria-hidden
        />

        <div className="relative z-[2] grid grid-cols-2 gap-px bg-white/10">
          {zones.map(({ zoneTitle, blurb, game }) => {
            if (!game) return null
            return (
              <Link
                key={zoneTitle}
                role="listitem"
                to={`/games/${game.slug}`}
                className="group relative min-h-[220px] overflow-hidden bg-ink-2 focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-teal lg:min-h-[260px]"
              >
                <ZoneBackdrop game={game} />
                <div className="relative flex h-full flex-col justify-end p-6 lg:p-8">
                  <p className="text-xs font-semibold tracking-wide text-gold">{zoneTitle}</p>
                  <h3 className="mt-1 font-display text-2xl font-bold text-paper transition-colors group-hover:text-gold">
                    {game.titleEn}
                  </h3>
                  <p className="mt-0.5 font-en text-xs text-mist/80">{game.titleZh}</p>
                  <p className="mt-3 max-w-xs text-sm leading-relaxed text-fog">
                    {blurb}
                  </p>
                  <span className="mt-4 inline-flex w-fit items-center rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-teal opacity-90 transition-colors group-hover:border-teal/40 group-hover:bg-teal/10">
                    入去睇 · 試玩
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
