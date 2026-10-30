import { Reveal } from '../components/Reveal'
import { CtaButton } from '../components/CtaButton'
import { studio, games } from '../data/games'

export function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <Reveal>
        <p className="font-en text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          About
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold text-paper sm:text-5xl">
          {studio.nameZh}
        </h1>
        <p className="mt-2 font-en text-2xl text-fog">{studio.nameEn}</p>
        <p className="mt-2 text-sm text-mist">{studio.studioZh} · {studio.location}</p>
      </Reveal>

      <Reveal delay={0.05} className="mt-10">
        <div
          className="mb-10 aspect-[21/9] overflow-hidden rounded-2xl border border-white/10"
          style={{
            background:
              'linear-gradient(135deg, #0a1628 0%, #1a3a5c 40%, #4c1d95 75%, #07070c 100%)',
          }}
          aria-hidden
        >
          <svg className="h-full w-full opacity-50" viewBox="0 0 800 280" preserveAspectRatio="xMidYMid slice">
            <circle cx="640" cy="80" r="50" fill="#f0c14a" opacity="0.35" />
            <path
              d="M0 200 Q200 140 400 180 T800 160"
              stroke="#5eead4"
              strokeWidth="1.5"
              fill="none"
              opacity="0.4"
            />
            <path
              d="M0 220 Q250 170 500 200 T800 190"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="1"
              fill="none"
            />
          </svg>
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        <div className="prose-invert space-y-6 text-fog leading-relaxed">
          {studio.aboutZh.split('\n\n').map((para) => (
            <p key={para.slice(0, 24)}>{para}</p>
          ))}
          <div className="rounded-xl border border-white/10 bg-panel/40 p-5">
            <p className="font-en text-sm leading-relaxed text-mist">{studio.aboutEn}</p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.1} className="mt-14">
        <h2 className="font-display text-2xl font-bold text-paper">目前作品線</h2>
        <ul className="mt-4 space-y-3">
          {games.map((g) => (
            <li
              key={g.id}
              className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3"
            >
              <span>
                <span className="font-semibold text-paper">{g.titleZh}</span>
                <span className="ml-2 font-en text-xs text-mist">{g.titleEn}</span>
              </span>
              <span className="font-en text-xs text-teal">
                {g.dimension} · {g.year}
              </span>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal delay={0.12} className="mt-12 flex flex-wrap gap-3">
        <CtaButton to="/games" variant="primary">
          瀏覽遊戲
        </CtaButton>
        <CtaButton to="/contact" variant="ghost">
          聯絡 / Press Kit
        </CtaButton>
      </Reveal>
    </div>
  )
}
