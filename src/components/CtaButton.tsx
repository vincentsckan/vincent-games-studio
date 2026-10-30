import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'steam' | 'itch'

const styles: Record<Variant, string> = {
  primary:
    'bg-gold text-ink hover:bg-gold-dim shadow-[0_0_24px_rgba(240,193,74,0.25)] hover:shadow-[0_0_32px_rgba(240,193,74,0.4)]',
  secondary:
    'bg-teal/15 text-teal border border-teal/40 hover:bg-teal/25 hover:border-teal/70',
  ghost:
    'bg-white/5 text-paper border border-white/15 hover:bg-white/10 hover:border-white/30',
  steam:
    'bg-[#1b2838] text-[#66c0f4] border border-[#66c0f4]/40 hover:bg-[#2a475e]',
  itch:
    'bg-[#fa5c5c]/15 text-[#fa5c5c] border border-[#fa5c5c]/40 hover:bg-[#fa5c5c]/25',
}

interface Props {
  children: ReactNode
  variant?: Variant
  href?: string
  to?: string
  onClick?: () => void
  className?: string
  external?: boolean
}

export function CtaButton({
  children,
  variant = 'primary',
  href,
  to,
  onClick,
  className = '',
  external,
}: Props) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold tracking-wide transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal ${styles[variant]} ${className}`

  if (to) {
    return (
      <Link to={to} className={cls} onClick={onClick}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a
        href={href}
        className={cls}
        onClick={onClick}
        {...(external || href.startsWith('http')
          ? { target: '_blank', rel: 'noopener noreferrer' }
          : {})}
      >
        {children}
      </a>
    )
  }

  return (
    <button type="button" className={cls} onClick={onClick}>
      {children}
    </button>
  )
}

export function GameCtaRow({
  links,
  className = '',
}: {
  links: { play?: string; download?: string; steam?: string; itch?: string }
  className?: string
}) {
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {links.play && (
        <CtaButton href={links.play} variant="primary">
          試玩 Play
        </CtaButton>
      )}
      {links.download && (
        <CtaButton href={links.download} variant="secondary">
          下載 Download
        </CtaButton>
      )}
      {links.steam && (
        <CtaButton href={links.steam} variant="steam" external>
          Steam Wishlist
        </CtaButton>
      )}
      {links.itch && (
        <CtaButton href={links.itch} variant="itch" external>
          itch.io
        </CtaButton>
      )}
    </div>
  )
}
