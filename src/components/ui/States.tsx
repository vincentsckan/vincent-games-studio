import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

/** Soft skeleton pulse for loading catalogues. */
export function LoadingGrid({ count = 4, cols = 'sm:grid-cols-2 lg:grid-cols-3' }: { count?: number; cols?: string }) {
  return (
    <ul className={`grid gap-5 ${cols}`} aria-busy="true" aria-label="載入中">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="overflow-hidden rounded-2xl border border-white/8 bg-panel/40">
          <div className="aspect-[4/3] animate-pulse bg-white/5" />
          <div className="space-y-3 p-5">
            <div className="h-5 w-2/3 animate-pulse rounded bg-white/8" />
            <div className="h-3 w-full animate-pulse rounded bg-white/5" />
            <div className="h-3 w-4/5 animate-pulse rounded bg-white/5" />
          </div>
        </li>
      ))}
    </ul>
  )
}

export function LoadingBlock({ label = '載入中…' }: { label?: string }) {
  return (
    <div
      className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="h-10 w-10 animate-pulse rounded-full border-2 border-teal/30 border-t-teal" />
      <p className="text-base text-mist">{label}</p>
    </div>
  )
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionTo,
  children,
}: {
  title: string
  description?: string
  actionLabel?: string
  actionTo?: string
  children?: ReactNode
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-dashed border-white/15 bg-ink-2/50 px-6 py-14 text-center">
      <p className="font-display text-xl font-bold text-paper">{title}</p>
      {description && <p className="mt-3 text-sm leading-relaxed text-mist">{description}</p>}
      {children}
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-gold px-6 text-base font-bold text-ink hover:bg-gold-dim"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  )
}

export function PageHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
}) {
  return (
    <header className="max-w-2xl">
      {eyebrow && (
        <p className="text-sm font-semibold tracking-wide text-teal">{eyebrow}</p>
      )}
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-paper sm:text-4xl md:text-5xl">
        {title}
      </h1>
      {subtitle && <p className="mt-4 text-base leading-relaxed text-fog sm:text-lg">{subtitle}</p>}
    </header>
  )
}

/** Shared admin form field chrome — large tap / type targets. */
export const fieldClass =
  'mt-2 w-full rounded-xl border border-white/12 bg-ink-2 px-4 py-3.5 text-base text-paper outline-none transition-colors placeholder:text-mist/50 focus:border-teal/60 focus:ring-2 focus:ring-teal/20'

export const labelClass = 'block text-sm font-medium text-fog'

export const adminBtnPrimary =
  'inline-flex min-h-12 items-center justify-center rounded-xl bg-gold px-6 text-base font-bold text-ink hover:bg-gold-dim disabled:opacity-60'

export const adminBtnSecondary =
  'inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 px-6 text-base font-semibold text-fog hover:bg-white/5'

export const adminBtnGhost =
  'inline-flex min-h-11 items-center justify-center rounded-xl border border-white/12 px-4 text-sm font-semibold text-fog hover:bg-white/5'
