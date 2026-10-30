import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import type { Game } from '../data/games'
import { GameArt } from './GameArt'

const statusLabel: Record<Game['status'], string> = {
  demo: 'Demo',
  'early-access': '搶先體驗',
  released: '已發行',
  'coming-soon': '即將推出',
}

export function GameCard({ game }: { game: Game }) {
  const reduced = useReducedMotion()

  return (
    <motion.article
      layout={!reduced}
      whileHover={reduced ? undefined : { y: -6 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      className="group relative"
    >
      <Link
        to={`/games/${game.slug}`}
        className="block overflow-hidden rounded-2xl border border-white/10 bg-panel/60 shadow-lg shadow-black/30 transition-colors hover:border-gold/40"
      >
        <div className="relative overflow-hidden">
          <GameArt game={game} className="rounded-none" />
          <div className="pointer-events-none absolute inset-0 bg-teal/0 opacity-0 transition-opacity duration-300 group-hover:bg-gradient-to-t group-hover:from-black/40 group-hover:opacity-100" />
          <span className="absolute top-3 left-3 rounded-full bg-ink/70 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-gold backdrop-blur">
            {statusLabel[game.status]}
          </span>
        </div>
        <div className="space-y-2 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display text-lg font-bold text-paper group-hover:text-gold transition-colors">
                {game.titleZh}
              </h3>
              <p className="font-en text-xs text-mist">{game.titleEn}</p>
            </div>
            <span className="shrink-0 rounded-md border border-white/10 px-2 py-0.5 font-en text-[10px] text-teal">
              {game.dimension}
            </span>
          </div>
          <p className="line-clamp-2 text-sm text-fog/90">{game.taglineZh}</p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {game.genres.map((g) => (
              <span
                key={g}
                className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-mist"
              >
                {g}
              </span>
            ))}
          </div>
          <p className="pt-2 font-en text-xs font-semibold text-gold/80 opacity-0 transition-opacity group-hover:opacity-100">
            查看詳情 →
          </p>
        </div>
      </Link>
    </motion.article>
  )
}
