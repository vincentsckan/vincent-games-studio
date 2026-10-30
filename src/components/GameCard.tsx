import { Link } from 'react-router-dom'
import type { Game } from '../data/games'
import { GameArt } from './GameArt'

const statusLabel: Record<Game['status'], string> = {
  demo: '可試玩',
  'early-access': '搶先體驗',
  released: '已發行',
  'coming-soon': '即將推出',
}

export function GameCard({ game }: { game: Game }) {
  return (
    <article className="h-full">
      <Link
        to={`/games/${game.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-panel/50 transition-colors hover:border-gold/35 focus-visible:border-teal/50"
      >
        <div className="relative overflow-hidden">
          <GameArt game={game} className="rounded-none" />
          <span className="absolute top-3 left-3 rounded-full bg-ink/80 px-3 py-1.5 text-xs font-semibold text-gold backdrop-blur">
            {statusLabel[game.status]}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-2 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-display text-lg font-bold text-paper group-hover:text-gold">
                {game.titleZh}
              </h3>
              <p className="mt-0.5 font-en text-xs text-mist">{game.titleEn}</p>
            </div>
            <span className="shrink-0 rounded-md border border-white/12 px-2 py-1 font-en text-xs text-teal">
              {game.dimension}
            </span>
          </div>
          <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-fog">{game.taglineZh}</p>
          <p className="pt-2 text-sm font-semibold text-gold">查看詳情 →</p>
        </div>
      </Link>
    </article>
  )
}
