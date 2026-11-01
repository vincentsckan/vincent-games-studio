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
  'pulse-arena',
  'midnight-estate',
  'neon-chase',
  'rooftop-cat',
  'tea-rush',
] as const

export type DemoSlug = (typeof DEMO_SLUGS)[number]

export function isDemoSlug(slug: string): slug is DemoSlug {
  return (DEMO_SLUGS as readonly string[]).includes(slug)
}

/** Canonical Pages demo URL (no query). */
export function pagesDemoUrl(slug: DemoSlug | string): string {
  return `${PAGES_ORIGIN}${SITE_BASE}/demos/${slug}/`
}

/**
 * Turn a play href into an absolute Pages URL with `?v=<sha>` so browsers
 * do not reuse a cached demo HTML that predates catalog-back controls.
 * Hash placeholders (`#play-demo`) are left unchanged.
 */
export function resolvePlayHref(play: string | undefined | null): string | undefined {
  if (!play) return undefined
  if (play.startsWith('#')) return play

  let absolute = play.trim()
  if (absolute.startsWith('/')) {
    absolute = `${PAGES_ORIGIN}${absolute}`
  } else if (!/^https?:\/\//i.test(absolute)) {
    absolute = pagesDemoUrl(absolute.replace(/\/+$/, ''))
  }

  try {
    const u = new URL(absolute)
    // Prefer our Pages demo host/path when the path clearly is a studio demo
    const m = u.pathname.match(/\/demos\/([a-z0-9-]+)\/?$/i)
    if (m && isDemoSlug(m[1])) {
      u.protocol = 'https:'
      u.host = 'vincentsckan.github.io'
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
