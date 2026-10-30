import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { FilterChips, type FilterValue } from '../components/FilterChips'
import { GameCard } from '../components/GameCard'
import { Reveal } from '../components/Reveal'
import { filterGames } from '../data/games'

export function GamesPage() {
  const [filter, setFilter] = useState<FilterValue>('all')
  const reduced = useReducedMotion()
  const list = useMemo(() => filterGames(filter), [filter])

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <Reveal>
        <p className="font-en text-xs font-semibold uppercase tracking-[0.2em] text-teal">
          Catalogue
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold text-paper sm:text-5xl">
          遊戲
          <span className="ml-3 font-en text-2xl font-semibold text-mist sm:text-3xl">Games</span>
        </h1>
        <p className="mt-4 max-w-2xl text-fog">
          以維度篩選作品。點擊卡片進入詳情——試玩、下載、Steam Wishlist、itch.io。
        </p>
      </Reveal>

      <div className="mt-8">
        <FilterChips value={filter} onChange={setFilter} />
      </div>

      <motion.ul
        layout={!reduced}
        className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <AnimatePresence mode="popLayout">
          {list.map((g) => (
            <motion.li
              key={g.id}
              layout={!reduced}
              initial={reduced ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduced ? undefined : { opacity: 0, scale: 0.96 }}
              transition={{ duration: reduced ? 0 : 0.3 }}
            >
              <GameCard game={g} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      {list.length === 0 && (
        <p className="mt-16 text-center text-mist">此篩選下暫無作品。</p>
      )}
    </div>
  )
}
