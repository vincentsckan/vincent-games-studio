import { GameCard } from '../components/GameCard'
import { CtaButton } from '../components/CtaButton'
import { Hero } from '../components/Hero'
import { StreetMap } from '../components/StreetMap'
import { TonightPick } from '../components/TonightPick'
import { EmptyState, LoadingGrid } from '../components/ui/States'
import { studio } from '../data/games'
import { useCatalogGames } from '../hooks/useCatalogGames'
import { usePageMeta } from '../hooks/usePageMeta'

export function HomePage() {
  usePageMeta({
    title: 'Vincent Games Studio｜香港獨立遊戲',
    description:
      '歡迎嚟玩。氣氛、手感、再玩一次——香港獨立遊戲工作室。免費試玩，唔使安裝。',
    image: 'og-default.jpg',
  })
  const { games, loading, error } = useCatalogGames()
  const featured = games.slice(0, 4)

  return (
    <>
      <Hero />

      <TonightPick games={games} loading={loading} />

      {!loading && !error && games.length > 0 ? <StreetMap games={games} /> : null}

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="text-sm font-semibold tracking-wide text-teal">作品</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-paper sm:text-4xl">
              精選遊戲
            </h2>
            <p className="mt-3 text-base leading-relaxed text-mist">
              想即刻玩？撳卡片入去，或者直接「試玩」。免費、唔使安裝。
            </p>
          </div>
          <CtaButton to="/games" variant="ghost" className="self-start sm:self-auto">
            查看全部
          </CtaButton>
        </div>

        {loading ? (
          <LoadingGrid count={4} cols="sm:grid-cols-2 lg:grid-cols-4" />
        ) : error ? (
          <EmptyState
            title="暫時載唔到作品"
            description="可能係網絡慢咗——試吓重新整理，或者稍後再嚟。"
            actionLabel="返回首頁"
            actionTo="/"
          />
        ) : featured.length === 0 ? (
          <EmptyState
            title="暫時未有公開作品"
            description="新遊戲上架之後會出現喺呢度。歡迎先認識吓工作室。"
            actionLabel="關於工作室"
            actionTo="/about"
          />
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((g) => (
              <li key={g.id}>
                <GameCard game={g} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="border-y border-white/8 bg-ink-2/80">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:items-center sm:py-20">
          <div className="max-w-xl">
            <p className="text-sm font-semibold tracking-wide text-gold">關於</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-paper">
              {studio.studioZh}
            </h2>
            <p className="mt-1 font-en text-base text-mist">{studio.location}</p>
            <p className="mt-4 text-base leading-relaxed text-fog">
              {studio.aboutZh.split('\n\n')[0]}
            </p>
            <div className="mt-8">
              <CtaButton to="/about" variant="secondary">
                認識我哋
              </CtaButton>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-panel/50 p-7 sm:p-10">
            <blockquote className="font-display text-xl font-semibold leading-relaxed text-paper text-balance sm:text-2xl">
              「等你願意停低，再撳一次『再玩一次』。」
            </blockquote>
            <p className="mt-4 text-sm text-mist">
              — {studio.studioZh} · {studio.location}
            </p>
            <CtaButton to="/contact" variant="ghost" className="mt-8">
              想合作／採訪？聯絡我哋
            </CtaButton>
          </div>
        </div>
      </section>
    </>
  )
}
