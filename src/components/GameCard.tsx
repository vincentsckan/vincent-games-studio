import { Link } from 'react-router-dom'
import type { Game } from '../data/games'
import { isExternalPlayHref, resolvePlayHref } from '../lib/demoPlay'
import { GameArt } from './GameArt'

const statusLabel: Record<Game['status'], string> = {
  demo: '可試玩',
  'early-access': '搶先體驗',
  released: '已發行',
  'coming-soon': '即將推出',
}

export function GameCard({ game }: { game: Game }) {
  const playHref = resolvePlayHref(game.links.play)
  const openTab = isExternalPlayHref(playHref)

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-panel/50 transition-colors hover:border-gold/35">
      <Link
        to={`/games/${game.slug}`}
        className="group relative block focus-visible:outline-none"
      >
        <div className="relative overflow-hidden">
          <GameArt game={game} variant="card" showCaption={false} className="rounded-none" />
          <span className="absolute top-3 left-3 rounded-full bg-ink/80 px-3 py-1.5 text-xs font-semibold text-gold backdrop-blur">
            {statusLabel[game.status]}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-start justify-between gap-3">
          <Link to={`/games/${game.slug}`} className="min-w-0 group">
            <h3 className="font-display text-lg font-bold text-paper group-hover:text-gold">
              {game.titleZh}
            </h3>
            <p className="mt-0.5 font-en text-xs text-mist">{game.titleEn}</p>
          </Link>
          <span className="shrink-0 rounded-md border border-white/12 px-2 py-1 font-en text-xs text-teal">
            {game.dimension}
          </span>
        </div>
        <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-fog">{game.taglineZh}</p>
        {game.genres.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5" aria-label="類型">
            {game.genres.slice(0, 3).map((g) => (
              <li
                key={g}
                className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[11px] text-mist"
              >
                {g}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-2 pt-1">
          {playHref ? (
            <a
              href={playHref}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-gold px-5 text-sm font-bold text-ink hover:bg-gold-dim"
              {...(openTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              立即試玩
            </a>
          ) : null}
          <Link
            to={`/games/${game.slug}`}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 text-sm font-semibold text-paper hover:bg-white/10"
          >
            了解更多
          </Link>
        </div>
      </div>
    </article>
  )
}
