/** Absolute GitHub Pages origin for this repo. */
export const PAGES_ORIGIN = 'https://vincentsckan.github.io'

/** Vite `base` path (with leading slash, no trailing slash required). */
export const SITE_BASE = '/vincent-games-studio'

/**
 * Build-time short git sha (see vite.config.ts). Falls back to "dev" in
 * plain `vite` without define — still unique enough for local.
 */
export const BUILD_SHA: string =
  (typeof import.meta !== 'undefined' &&
    (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_VGS_BUILD_SHA) ||
  'dev'

const DEMO_SLUGS = [
  'rift-arena',
  'pixel-plays-diorama',
  'pulse-arena',
  'midnight-estate',
  'neon-chase',
  'rooftop-cat',
  'tea-rush',
  'mist-harbor-lights',
  'faultline-walker',
  'paper-crane-epoch',
  'echoes-of-void',
] as const

export type DemoSlug = (typeof DEMO_SLUGS)[number]

export function isDemoSlug(slug: string): slug is DemoSlug {
  return (DEMO_SLUGS as readonly string[]).includes(slug)
}

/** Canonical Pages demo URL (no query). Non-browser fallback only. */
export function pagesDemoUrl(slug: DemoSlug | string): string {
  return `${PAGES_ORIGIN}${SITE_BASE}/demos/${slug}/`
}

/**
 * Origin for a demo play link. In a browser this is the catalog page
 * (`window.location`), so a preview host opens its own copy of the demo.
 * Without `window` (tests, SSR) it stays the formal GitHub Pages origin.
 * On vincentsckan.github.io the two are the same.
 */
export function playLinkOrigin(): string {
  try {
    const scope = globalThis as typeof globalThis & {
      window?: { location?: { origin?: string } }
      location?: { origin?: string }
    }
    const origin = scope.window?.location?.origin || scope.location?.origin
    if (origin) return origin
  } catch {
    // location can throw in a locked-down or non-browser realm
  }
  return PAGES_ORIGIN
}

/**
 * Turn a play href into an absolute demo URL with `?v=<sha>` so browsers
 * do not reuse a cached demo HTML that predates catalog-back controls.
 * Known studio demos keep `/vincent-games-studio/demos/<slug>/` on the
 * current origin. Hash placeholders (`#play-demo`) are left unchanged.
 */
export function resolvePlayHref(play: string | undefined | null): string | undefined {
  if (!play) return undefined
  if (play.startsWith('#')) return play

  const origin = playLinkOrigin()
  let absolute = play.trim()
  if (absolute.startsWith('/')) {
    absolute = `${origin}${absolute}`
  } else if (!/^https?:\/\//i.test(absolute)) {
    absolute = `${origin}${SITE_BASE}/demos/${absolute.replace(/\/+$/, '')}/`
  }

  try {
    const u = new URL(absolute)
    // Known studio demos stay on the catalog origin, with a stable path.
    const m = u.pathname.match(/\/demos\/([a-z0-9-]+)\/?$/i)
    if (m && isDemoSlug(m[1])) {
      const base = new URL(origin)
      u.protocol = base.protocol
      u.host = base.host
      u.pathname = `${SITE_BASE}/demos/${m[1]}/`
    }
    u.searchParams.set('v', BUILD_SHA)
    // Normalize trailing slash on demo dirs
    if (/\/demos\/[a-z0-9-]+$/i.test(u.pathname)) u.pathname += '/'
    return u.toString()
  } catch {
    return absolute
  }
}

export function isExternalPlayHref(href: string | undefined): boolean {
  return Boolean(href && /^https?:\/\//i.test(href) && !href.startsWith('#'))
}
