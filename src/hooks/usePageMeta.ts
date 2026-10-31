import { useEffect } from 'react'
import { SITE_BASE, PAGES_ORIGIN } from '../lib/demoPlay'

const SITE = 'Vincent Games Studio'
const DEFAULT_DESC =
  'Vincent Games Studio — 香港獨立遊戲工作室。歡迎嚟玩：氣氛敘事、手感打磨，2D 與 3D 作品即開試玩。'
const DEFAULT_OG = `${PAGES_ORIGIN}${SITE_BASE}/og-default.jpg`

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  const sel = `meta[${attr}="${key}"]`
  let el = document.head.querySelector(sel) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

/** Absolute Pages URL for a public/ path (leading slash optional). */
export function pagesAssetUrl(path: string): string {
  const clean = path.replace(/^\//, '')
  return `${PAGES_ORIGIN}${SITE_BASE}/${clean}`
}

/** Set document title + description (and matching OG/Twitter) for the current route. */
export function usePageMeta({
  title,
  description = DEFAULT_DESC,
  image,
}: {
  title: string
  description?: string
  /** Path under public/ or absolute https URL. Defaults to og-default.jpg */
  image?: string
}) {
  useEffect(() => {
    const prev = document.title
    document.title = title.includes(SITE) ? title : `${title}｜${SITE}`
    const img =
      !image ? DEFAULT_OG : /^https?:\/\//i.test(image) ? image : pagesAssetUrl(image)

    upsertMeta('name', 'description', description)
    upsertMeta('property', 'og:title', document.title)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:image', img)
    upsertMeta('name', 'twitter:title', document.title)
    upsertMeta('name', 'twitter:description', description)
    upsertMeta('name', 'twitter:image', img)
    return () => {
      document.title = prev
    }
  }, [title, description, image])
}
