import { motion, useReducedMotion } from 'framer-motion'
import { CtaButton } from './CtaButton'
import { studio, games } from '../data/games'

export function Hero() {
  const reduced = useReducedMotion()
  const featured = games[0]

  return (
    <section className="relative isolate flex min-h-[calc(100dvh-4rem)] items-center overflow-hidden grain">
      {/* Cinematic gradient backdrop */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse 70% 60% at 70% 40%, ${featured.palette.via}66 0%, transparent 55%),
            radial-gradient(ellipse 50% 50% at 20% 70%, ${featured.palette.to}44 0%, transparent 50%),
            linear-gradient(180deg, #07070c 0%, #0e0e16 60%, #07070c 100%)
          `,
        }}
      />
      <div className="absolute inset-0 -z-10 opacity-30">
        <svg className="h-full w-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1440 900">
          <defs>
            <linearGradient id="heroLine" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#5eead4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f0c14a" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <path
            d="M0 600 Q360 480 720 560 T1440 500"
            stroke="url(#heroLine)"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M0 650 Q400 520 800 600 T1440 540"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
            fill="none"
          />
          <circle cx="1100" cy="220" r="120" fill="#f0c14a" opacity="0.08" />
          <circle cx="1100" cy="220" r="60" fill="#f0c14a" opacity="0.12" />
        </svg>
      </div>

      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16 lg:py-24">
        <div>
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0 : 0.45 }}
            className="mb-4 font-en text-xs font-semibold uppercase tracking-[0.25em] text-teal"
          >
            Indie Games · Hong Kong
          </motion.p>
          <motion.h1
            initial={reduced ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0 : 0.55, delay: reduced ? 0 : 0.05 }}
            className="font-display text-4xl font-extrabold leading-[1.15] tracking-tight text-paper text-balance sm:text-5xl lg:text-6xl"
          >
            {studio.nameZh}
            <span className="mt-2 block font-en text-2xl font-semibold text-fog sm:text-3xl lg:text-4xl">
              {studio.nameEn}
            </span>
          </motion.h1>
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0 : 0.55, delay: reduced ? 0 : 0.12 }}
            className="mt-6 max-w-xl text-base text-fog sm:text-lg"
          >
            {studio.taglineZh}
            <span className="mt-2 block font-en text-sm text-mist">{studio.taglineEn}</span>
          </motion.p>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : 0.2 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <CtaButton to="/games" variant="primary">
              試玩 Try
            </CtaButton>
            <CtaButton href={featured.links.download ?? '/games'} variant="secondary">
              下載 Download
            </CtaButton>
            <CtaButton href={featured.links.steam ?? '/games'} variant="ghost" external>
              購買 / Wishlist
            </CtaButton>
          </motion.div>

          <motion.p
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduced ? 0 : 0.35, duration: reduced ? 0 : 0.4 }}
            className="mt-8 font-en text-xs text-mist/70"
          >
            Featured · {featured.titleZh} / {featured.titleEn}
          </motion.p>
        </div>

        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 0.94, rotate: -1 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: reduced ? 0 : 0.7, delay: reduced ? 0 : 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          <div
            className="absolute -inset-4 rounded-[2rem] opacity-60 blur-2xl"
            style={{
              background: `linear-gradient(135deg, ${featured.palette.accent}44, ${featured.palette.to}33)`,
            }}
          />
          <div
            className="relative overflow-hidden rounded-[1.75rem] border border-white/15 shadow-2xl shadow-black/50 aspect-[4/5]"
            style={{
              background: `linear-gradient(145deg, ${featured.palette.from}, ${featured.palette.via} 50%, ${featured.palette.to})`,
            }}
          >
            <svg className="absolute inset-0 h-full w-full opacity-70" viewBox="0 0 400 500">
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
              <path
                d="M40 300 Q120 260 200 300 T360 300"
                stroke={featured.palette.accent}
                strokeWidth="2"
                fill="none"
                opacity="0.5"
              />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="font-display text-2xl font-bold text-white">{featured.titleZh}</p>
              <p className="font-en text-sm text-white/60">{featured.titleEn}</p>
              <p className="mt-2 text-sm text-white/75">{featured.taglineZh}</p>
              <div className="mt-4">
                <CtaButton to={`/games/${featured.slug}`} variant="primary" className="text-xs sm:text-sm">
                  了解更多 →
                </CtaButton>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
