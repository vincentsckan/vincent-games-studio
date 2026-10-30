import { useMemo, useState } from 'react'
import { FilterChips, type FilterValue } from '../components/FilterChips'
import { GameCard } from '../components/GameCard'
import { EmptyState, LoadingGrid, PageHeading } from '../components/ui/States'
import { useCatalogGames } from '../hooks/useCatalogGames'
import { filterCatalog } from '../lib/gamesCatalog'

export function GamesPage() {
  const [filter, setFilter] = useState<FilterValue>('all')
  const { games, loading, error } = useCatalogGames()
  const list = useMemo(() => filterCatalog(games, filter), [games, filter])

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <PageHeading
        eyebrow="遊戲目錄"
        title="遊戲"
        subtitle="以 2D／3D 篩選。點卡片進入詳情——試玩、下載、Steam Wishlist、itch.io。"
      />

      <div className="mt-8">
        <FilterChips value={filter} onChange={setFilter} />
      </div>

      <div className="mt-10">
        {loading ? (
          <LoadingGrid count={6} />
        ) : error ? (
          <EmptyState
            title="載入失敗"
            description={error}
            actionLabel="返回首頁"
            actionTo="/"
          />
        ) : list.length === 0 ? (
          filter !== 'all' ? (
            <EmptyState title="此篩選下暫無作品" description="試吓切換「全部」，或稍後再來。">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className="mt-8 inline-flex min-h-12 items-center rounded-full bg-gold px-6 text-base font-bold text-ink hover:bg-gold-dim"
              >
                顯示全部
              </button>
            </EmptyState>
          ) : (
            <EmptyState
              title="尚未有公開作品"
              description="遊戲發佈後會出現在這裡。"
              actionLabel="返回首頁"
              actionTo="/"
            />
          )
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((g) => (
              <li key={g.id}>
                <GameCard game={g} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
