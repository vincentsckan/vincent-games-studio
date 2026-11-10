import type { HeroId } from './types'

const BASE = 'mm-real2d-v1'

export function heroBust(hero: HeroId, team: 1 | 2): string {
  const side = team === 1 ? 'p1' : 'p2'
  return `${BASE}/heroes/${hero}/${hero}-bust-${side}.png`
}

export function heroFull(hero: HeroId, team: 1 | 2): string {
  const side = team === 1 ? 'p1' : 'p2'
  return `${BASE}/heroes/${hero}/${hero}-full-${side}.png`
}

export const ARENA_BG = `${BASE}/arena/arena-topdown-v2.png`
export const TITLE_MOOD = `${BASE}/arena/rift-arena-mood-titled.png`

const cache = new Map<string, HTMLImageElement>()

export function loadImage(src: string): Promise<HTMLImageElement> {
  const hit = cache.get(src)
  if (hit?.complete && hit.naturalWidth) return Promise.resolve(hit)
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      cache.set(src, img)
      resolve(img)
    }
    img.onerror = () => reject(new Error(`Failed to load ${src}`))
    img.src = src
  })
}

export async function preloadAll(): Promise<void> {
  const heroes: HeroId[] = ['pofeng', 'xianming', 'dingchao']
  const jobs: Promise<HTMLImageElement>[] = [loadImage(ARENA_BG), loadImage(TITLE_MOOD)]
  for (const h of heroes) {
    jobs.push(loadImage(heroBust(h, 1)), loadImage(heroBust(h, 2)))
  }
  for (const h of heroes) {
    jobs.push(loadImage(heroFull(h, 1)), loadImage(heroFull(h, 2)))
  }
  const settled = await Promise.allSettled(jobs)
  const failed = settled.filter((r) => r.status === 'rejected') as PromiseRejectedResult[]
  if (failed.length > 0) {
    console.warn(
      '[rift-arena] asset preload failures:',
      failed.map((f) => String(f.reason)),
    )
  }
}

export function getCached(src: string): HTMLImageElement | undefined {
  return cache.get(src)
}
