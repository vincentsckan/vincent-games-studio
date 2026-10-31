import { Link } from 'react-router-dom'
import { CtaButton } from './CtaButton'
import { studio } from '../data/games'

/** Warm hero: friendly invite to play + clear path to the games catalog. */
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-white/8">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse 65% 55% at 75% 35%, #1a3a5c40 0%, transparent 55%),
            linear-gradient(180deg, #08080f 0%, #10101a 100%)
          `,
        }}
      />

      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:gap-12 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16 lg:py-24">
        <div>
          <p className="mb-3 text-sm font-semibold tracking-wide text-teal">香港獨立遊戲 · 撳一下就玩</p>
          <h1 className="font-display text-4xl font-extrabold leading-[1.15] tracking-tight text-paper text-balance sm:text-5xl lg:text-[3.25rem]">
            {studio.taglineZh}
            <span className="mt-2 block font-en text-xl font-semibold text-mist/90 sm:text-2xl">
              {studio.studioEn}
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-mist">
            屋邨走廊、天台夜色、霓虹巷仔、茶餐廳節奏——揀一款，即刻開波。
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <CtaButton to="/games" variant="primary" className="w-full sm:w-auto">
              即刻試玩
            </CtaButton>
            <CtaButton to="/about" variant="ghost" className="w-full sm:w-auto">
              認識我哋
            </CtaButton>
          </div>
        </div>

        <Link
          to="/games"
          className="group relative mx-auto block w-full max-w-md focus-visible:outline-none lg:max-w-none"
        >
          <div
            className="overflow-hidden rounded-2xl border border-white/12 shadow-2xl shadow-black/40 aspect-[4/5] transition-colors group-hover:border-gold/40 sm:aspect-[3/4]"
            style={{
              background: 'linear-gradient(145deg, #0a1628, #1a3a5c 50%, #0d9488)',
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
              <circle cx="320" cy="90" r="36" fill="#f0c14a" opacity="0.75" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/15" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-7">
              <span className="rounded-full bg-ink/70 px-3 py-1.5 text-xs font-semibold text-gold backdrop-blur">
                多款免費試玩
              </span>
              <p className="mt-3 font-display text-2xl font-bold text-white">嚟睇吓我哋嘅遊戲</p>
              <p className="mt-1 text-sm leading-relaxed text-white/75">
                平台 · 街機 · 限時 · 氣氛探索——全部喺瀏覽器即玩
              </p>
              <p className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-gold">
                打開遊戲目錄 →
              </p>
            </div>
          </div>
        </Link>
      </div>
    </section>
  )
}
