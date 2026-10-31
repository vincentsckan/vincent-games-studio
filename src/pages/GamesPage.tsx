import { useMemo, useState } from 'react'
import { FilterChips, type FilterValue } from '../components/FilterChips'
import { GameCard } from '../components/GameCard'
import { EmptyState, LoadingGrid, PageHeading } from '../components/ui/States'
import { useCatalogGames } from '../hooks/useCatalogGames'
import { filterCatalog } from '../lib/gamesCatalog'
import { usePageMeta } from '../hooks/usePageMeta'

export function GamesPage() {
  usePageMeta({
    title: '遊戲目錄｜Vincent Games Studio',
    description: '瀏覽 Vincent Games Studio 遊戲目錄。2D／3D 篩選，瀏覽器即開試玩。',
    image: 'og-default.jpg',
  })
  const [filter, setFilter] = useState<FilterValue>('all')
  const { games, loading, error } = useCatalogGames()
  const list = useMemo(() => filterCatalog(games, filter), [games, filter])

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
      <PageHeading
        eyebrow="遊戲目錄"
        title="嚟玩吓"
        subtitle="用 2D／3D 篩選。入詳情睇介紹，或者直接試玩——瀏覽器開到就玩。"
      />

      <div className="mt-8">
        <FilterChips value={filter} onChange={setFilter} />
      </div>

      <div className="mt-10">
        {loading ? (
          <LoadingGrid count={6} />
        ) : error ? (
          <EmptyState
            title="暫時載唔到目錄"
            description="暫時連唔上目錄。試吓稍後再嚟，或者返回首頁。"
            actionLabel="返回首頁"
            actionTo="/"
          />
        ) : list.length === 0 ? (
          filter !== 'all' ? (
            <EmptyState
              title="呢個篩選暫時未有作品"
              description="試吓切換「全部」，或者過陣再嚟睇。"
            >
              <button
                type="button"
                onClick={() => setFilter('all')}
                className="mt-8 inline-flex min-h-12 items-center rounded-full bg-gold px-6 text-base font-bold text-ink hover:bg-gold-dim"
              >
                顯示全部遊戲
              </button>
            </EmptyState>
          ) : (
            <EmptyState
              title="暫時未有公開作品"
              description="新遊戲發佈之後會出現喺呢度。歡迎先逛吓首頁。"
              actionLabel="返回首頁"
              actionTo="/"
            />
          )
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
