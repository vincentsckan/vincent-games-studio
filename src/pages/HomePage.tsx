import { Link } from 'react-router-dom'
import { Hero } from '../components/Hero'
import { GameCard } from '../components/GameCard'
import { Reveal, RevealGroup, RevealItem } from '../components/Reveal'
import { CtaButton } from '../components/CtaButton'
import { games, studio } from '../data/games'

export function HomePage() {
  return (
    <>
      <Hero />

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Reveal className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-en text-xs font-semibold uppercase tracking-[0.2em] text-teal">
              Games
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-paper sm:text-4xl">
              作品精選
            </h2>
            <p className="mt-2 max-w-lg text-sm text-mist">
              2D 與 3D 交織的獨立作品。全部為 Demo 佔位內容，可替換成真實遊戲資料。
            </p>
          </div>
          <CtaButton to="/games" variant="ghost">
            查看全部 →
          </CtaButton>
        </Reveal>

        <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" as="ul">
          {games.map((g) => (
            <RevealItem key={g.id} as="li">
              <GameCard game={g} />
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <section className="border-y border-white/5 bg-ink-2/80">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 md:grid-cols-2 md:items-center">
          <Reveal>
            <p className="font-en text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              About
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-paper">
              {studio.nameZh}
              <span className="mt-1 block font-en text-xl text-fog">{studio.nameEn}</span>
            </h2>
            <p className="mt-4 text-fog leading-relaxed whitespace-pre-line">
              {studio.aboutZh.split('\n\n')[0]}
            </p>
            <div className="mt-6">
              <CtaButton to="/about" variant="secondary">
                認識開發者 →
              </CtaButton>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-white/10 bg-panel/50 p-8">
              <blockquote className="font-display text-xl font-semibold leading-relaxed text-paper text-balance sm:text-2xl">
                「讓玩家願意停下來，再按一次『再玩一次』。」
              </blockquote>
              <p className="mt-4 font-en text-sm text-mist">
                — {studio.nameEn}, {studio.location}
              </p>
              <Link
                to="/contact"
                className="mt-8 inline-block text-sm font-semibold text-teal hover:text-teal-dim"
              >
                媒體 / 合作洽詢 →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
