import { GameCard } from '../components/GameCard'
import { CtaButton } from '../components/CtaButton'
import { Hero } from '../components/Hero'
import { EmptyState, LoadingGrid } from '../components/ui/States'
import { studio } from '../data/games'
import { useCatalogGames } from '../hooks/useCatalogGames'

export function HomePage() {
  const { games, loading, error } = useCatalogGames()
  const featured = games.slice(0, 4)

  return (
    <>
      <Hero />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-teal">作品</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-paper sm:text-4xl">
              精選遊戲
            </h2>
            <p className="mt-2 max-w-lg text-base text-mist">
              2D 與 3D 獨立作品。點卡片進入詳情，再試玩或下載。
            </p>
          </div>
          <CtaButton to="/games" variant="ghost">
            查看全部
          </CtaButton>
        </div>

        {loading ? (
          <LoadingGrid count={4} cols="sm:grid-cols-2 lg:grid-cols-4" />
        ) : error ? (
          <EmptyState
            title="暫時無法載入作品"
            description={error}
            actionLabel="重新整理頁面"
            actionTo="/"
          />
        ) : featured.length === 0 ? (
          <EmptyState
            title="尚未有公開作品"
            description="遊戲上架後會出現在這裡。"
            actionLabel="關於工作室"
            actionTo="/about"
          />
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((g) => (
              <li key={g.id}>
                <GameCard game={g} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="border-y border-white/8 bg-ink-2/80">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:items-center sm:py-20">
          <div>
            <p className="text-sm font-semibold text-gold">關於</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-paper">
              {studio.nameZh}
            </h2>
            <p className="mt-1 font-en text-lg text-mist">{studio.nameEn}</p>
            <p className="mt-4 text-base leading-relaxed text-fog">
              {studio.aboutZh.split('\n\n')[0]}
            </p>
            <div className="mt-8">
              <CtaButton to="/about" variant="secondary">
                認識開發者
              </CtaButton>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-panel/50 p-8 sm:p-10">
            <blockquote className="font-display text-xl font-semibold leading-relaxed text-paper text-balance sm:text-2xl">
              「讓玩家願意停下來，再按一次『再玩一次』。」
            </blockquote>
            <p className="mt-4 text-sm text-mist">
              — {studio.nameZh} · {studio.location}
            </p>
            <CtaButton to="/contact" variant="ghost" className="mt-8">
              媒體／合作洽詢
            </CtaButton>
          </div>
        </div>
      </section>
    </>
  )
}
