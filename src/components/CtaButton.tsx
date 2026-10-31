import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { isExternalPlayHref, resolvePlayHref } from '../lib/demoPlay'

type Variant = 'primary' | 'secondary' | 'ghost' | 'steam' | 'itch'

const styles: Record<Variant, string> = {
  primary: 'bg-gold text-ink hover:bg-gold-dim',
  secondary:
    'bg-teal/15 text-teal border border-teal/40 hover:bg-teal/25 hover:border-teal/70',
  ghost:
    'bg-white/5 text-paper border border-white/15 hover:bg-white/10 hover:border-white/30',
  steam: 'bg-[#1b2838] text-[#66c0f4] border border-[#66c0f4]/40 hover:bg-[#2a475e]',
  itch: 'bg-[#fa5c5c]/15 text-[#fa5c5c] border border-[#fa5c5c]/40 hover:bg-[#fa5c5c]/25',
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

const base =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-base font-bold tracking-wide transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal'

export function CtaButton({
  children,
  variant = 'primary',
  href,
  to,
  onClick,
  className = '',
  external,
}: Props) {
  const cls = `${base} ${styles[variant]} ${className}`

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
  const hasAny = links.play || links.download || links.steam || links.itch
  if (!hasAny) {
    return (
      <p className={`text-sm text-mist ${className}`}>
        連結即將推出 — 歡迎先加入 Wishlist 或來信洽詢。
      </p>
    )
  }

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {links.play && (() => {
        const playHref = resolvePlayHref(links.play)
        if (!playHref) return null
        const openTab = isExternalPlayHref(playHref)
        return (
          <CtaButton href={playHref} variant="primary" external={openTab}>
            試玩
          </CtaButton>
        )
      })()}
      {links.download && (
        <CtaButton href={links.download} variant="secondary">
          下載
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
