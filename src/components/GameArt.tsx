import type { Game } from '../data/games'

function assetUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path
  const base = import.meta.env.BASE_URL || '/'
  return `${base}${path.replace(/^\//, '')}`
}

/** Cover image when available; otherwise CSS/SVG placeholder art. */
export function GameArt({
  game,
  className = '',
  variant = 'cover',
  showCaption = true,
}: {
  game: Game
  className?: string
  variant?: 'cover' | 'wide' | 'thumb' | 'card'
  /** When false, omit title overlay (cards show title in body). */
  showCaption?: boolean
}) {
  const { palette, coverImage } = game
  const aspect =
    variant === 'wide'
      ? 'aspect-[16/9]'
      : variant === 'thumb'
        ? 'aspect-square'
        : variant === 'card'
          ? 'aspect-[16/10]'
          : 'aspect-[4/5] sm:aspect-[3/4]'

  const caption = showCaption ? (
    <div className="absolute bottom-4 left-4 right-4">
      <p className="font-display text-sm font-bold tracking-wide text-white/90 sm:text-base">
        {game.titleZh}
      </p>
      <p className="font-en text-xs text-white/55">{game.titleEn}</p>
    </div>
  ) : null

  const dimBadge = showCaption ? (
    <span className="absolute top-3 right-3 rounded-full bg-black/40 px-2.5 py-1 font-en text-[10px] font-semibold tracking-wider text-white/80 backdrop-blur">
      {game.dimension}
    </span>
  ) : null

  if (coverImage) {
    return (
      <div className={`relative overflow-hidden rounded-2xl ${aspect} ${className}`} aria-hidden>
        <img
          src={assetUrl(coverImage)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          loading="lazy"
        />
        <div
          className={`absolute inset-0 ${
            showCaption
              ? 'bg-gradient-to-t from-black/55 via-transparent to-black/10'
              : 'bg-gradient-to-t from-black/25 via-transparent to-black/5'
          }`}
        />
        {caption}
        {dimBadge}
      </div>
    )
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${aspect} ${className}`}
      style={{
        background: `linear-gradient(145deg, ${palette.from} 0%, ${palette.via} 48%, ${palette.to} 100%)`,
      }}
      aria-hidden
    >
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
        {palette.pattern === 'harbor' && <HarborPattern accent={palette.accent} />}
        {palette.pattern === 'fault' && <FaultPattern accent={palette.accent} />}
        {palette.pattern === 'crane' && <CranePattern accent={palette.accent} />}
        {palette.pattern === 'void' && <VoidPattern accent={palette.accent} />}
      </svg>
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/15" />
      {caption}
      {dimBadge}
    </div>
  )
}

function HarborPattern({ accent }: { accent: string }) {
  return (
    <g opacity="0.55">
      <ellipse cx="200" cy="380" rx="180" ry="40" fill="rgba(0,0,0,0.35)" />
      {[80, 140, 200, 260, 320].map((x, i) => (
        <rect key={x} x={x - 12} y={220 - i * 8} width="24" height={160 + i * 8} fill="rgba(0,0,0,0.35)" rx="2" />
      ))}
      <circle cx="320" cy="90" r="36" fill={accent} opacity="0.75" />
      <path d="M40 300 Q200 240 360 310" fill="none" stroke={accent} strokeWidth="3" opacity="0.5" />
    </g>
  )
}

function FaultPattern({ accent }: { accent: string }) {
  return (
    <g opacity="0.6">
      <polygon points="0,500 0,280 120,200 200,320 280,180 400,260 400,500" fill="rgba(0,0,0,0.4)" />
      <path d="M0 220 L160 140 L240 260 L400 120" fill="none" stroke={accent} strokeWidth="4" />
      <circle cx="90" cy="100" r="8" fill={accent} />
      <circle cx="310" cy="80" r="5" fill="#fff" opacity="0.5" />
    </g>
  )
}

function CranePattern({ accent }: { accent: string }) {
  return (
    <g opacity="0.55">
      <rect x="40" y="60" width="120" height="160" fill="rgba(255,255,255,0.08)" rx="4" />
      <rect x="200" y="100" width="140" height="200" fill="rgba(255,255,255,0.06)" rx="4" />
      <path d="M80 380 L140 300 L200 360 L260 280 L320 340" fill="none" stroke={accent} strokeWidth="3" />
      <polygon points="300,120 340,160 300,200 280,160" fill={accent} opacity="0.7" />
    </g>
  )
}

function VoidPattern({ accent }: { accent: string }) {
  return (
    <g opacity="0.55">
      <circle cx="200" cy="220" r="90" fill="rgba(0,0,0,0.5)" stroke={accent} strokeWidth="2" />
      <circle cx="200" cy="220" r="40" fill={accent} opacity="0.35" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const r = (deg * Math.PI) / 180
        const x = 200 + Math.cos(r) * 140
        const y = 220 + Math.sin(r) * 140
        return <circle key={deg} cx={x} cy={y} r="3" fill="#fff" opacity="0.4" />
      })}
    </g>
  )
}

export function GalleryFrame({
  game,
  index,
  label,
  className = '',
}: {
  game: Game
  index: number
  label?: string
  className?: string
}) {
  const gradients = [
    `linear-gradient(160deg, ${game.palette.from}, ${game.palette.via})`,
    `linear-gradient(200deg, ${game.palette.via}, ${game.palette.to})`,
    `linear-gradient(120deg, ${game.palette.to}, ${game.palette.from})`,
    `radial-gradient(circle at 30% 40%, ${game.palette.accent}55, ${game.palette.from})`,
  ]
  if (game.coverImage && index === 0) {
    return (
      <div className={`relative aspect-video overflow-hidden rounded-xl ${className}`}>
        <img src={assetUrl(game.coverImage)} alt="" className="h-full w-full object-cover" loading="lazy" />
        {label && (
          <span className="absolute bottom-3 left-3 rounded-md bg-black/50 px-2 py-1 font-en text-[10px] text-white/80 backdrop-blur">
            {label}
          </span>
        )}
      </div>
    )
  }
  return (
    <div
      className={`relative aspect-video overflow-hidden rounded-xl ${className}`}
      style={{ background: gradients[index % gradients.length] }}
      aria-hidden
    >
      <svg className="absolute inset-0 h-full w-full opacity-50" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
        {game.palette.pattern === 'harbor' && <HarborPattern accent={game.palette.accent} />}
        {game.palette.pattern === 'fault' && <FaultPattern accent={game.palette.accent} />}
        {game.palette.pattern === 'crane' && <CranePattern accent={game.palette.accent} />}
        {game.palette.pattern === 'void' && <VoidPattern accent={game.palette.accent} />}
      </svg>
      {label && (
        <span className="absolute bottom-3 left-3 rounded-md bg-black/50 px-2 py-1 font-en text-[10px] text-white/80 backdrop-blur">
          {label}
        </span>
      )}
    </div>
  )
}
