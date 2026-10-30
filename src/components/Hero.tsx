import { Link } from 'react-router-dom'
import { CtaButton } from './CtaButton'
import { studio, games } from '../data/games'

/** Calm hero: one clear path home → games, no staggered motion gimmicks. */
export function Hero() {
  const featured = games[0]

  return (
    <section className="relative isolate overflow-hidden border-b border-white/8">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse 65% 55% at 75% 35%, ${featured.palette.via}40 0%, transparent 55%),
            linear-gradient(180deg, #08080f 0%, #10101a 100%)
          `,
        }}
      />

      <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16 lg:py-24">
        <div>
          <p className="mb-3 text-sm font-semibold text-teal">香港獨立遊戲</p>
          <h1 className="font-display text-4xl font-extrabold leading-[1.15] tracking-tight text-paper text-balance sm:text-5xl lg:text-[3.25rem]">
            {studio.nameZh}
            <span className="mt-2 block font-en text-xl font-semibold text-mist sm:text-2xl">
              {studio.nameEn}
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-fog">
            {studio.taglineZh}
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <CtaButton to="/games" variant="primary">
              瀏覽遊戲
            </CtaButton>
            <CtaButton to={`/games/${featured.slug}`} variant="ghost">
              精選：{featured.titleZh}
            </CtaButton>
          </div>
        </div>

        <Link
          to={`/games/${featured.slug}`}
          className="group relative mx-auto block w-full max-w-md focus-visible:outline-none lg:max-w-none"
        >
          <div
            className="overflow-hidden rounded-2xl border border-white/12 shadow-2xl shadow-black/40 aspect-[4/5] transition-colors group-hover:border-gold/40"
            style={{
              background: `linear-gradient(145deg, ${featured.palette.from}, ${featured.palette.via} 50%, ${featured.palette.to})`,
            }}
          >
            <svg className="absolute inset-0 h-full w-full opacity-60" viewBox="0 0 400 500" aria-hidden>
              <ellipse cx="200" cy="380" rx="180" ry="40" fill="rgba(0,0,0,0.35)" />
              {[80, 140, 200, 260, 320].map((x, i) => (
                <rect
                  key={x}
                  x={x - 12}
                  y={220 - i * 8}
                  width="24"
                  height={160 + i * 8}
                  fill="rgba(0,0,0,0.35)"
                  rx="2"
                />
              ))}
              <circle cx="320" cy="90" r="36" fill={featured.palette.accent} opacity="0.75" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/15" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-7">
              <span className="rounded-full bg-ink/70 px-3 py-1 text-xs font-semibold text-gold backdrop-blur">
                精選作品
              </span>
              <p className="mt-3 font-display text-2xl font-bold text-white">{featured.titleZh}</p>
              <p className="mt-1 text-sm text-white/75">{featured.taglineZh}</p>
              <p className="mt-4 text-sm font-semibold text-gold">查看詳情 →</p>
            </div>
          </div>
        </Link>
      </div>
    </section>
  )
}
