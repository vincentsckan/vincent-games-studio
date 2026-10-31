import {
  games as localGames,
  getGameBySlug as getLocalBySlug,
  filterGames as filterLocal,
  type Game,
  type GameDimension,
} from '../data/games'
import {
  getSupabase,
  isSupabaseConfigured,
  storagePublicUrl,
  type DbGame,
} from './supabase'
import { resolvePlayHref } from './demoPlay'

/** Vincent abandoned these demos — never show in public catalog (horror 2026-10-31; neon-harbor 2026-11-01). */
const ABANDONED_SLUGS = new Set(['cold-hold', 'alley-clinic', 'neon-harbor'])

function isPublicGame(g: Game): boolean {
  return !ABANDONED_SLUGS.has(g.slug) && !ABANDONED_SLUGS.has(g.id)
}

const DEFAULT_PALETTE: Game['palette'] = {
  from: '#0a1628',
  via: '#1a3a5c',
  to: '#0d9488',
  accent: '#f0c14a',
  pattern: 'harbor',
}

/** Map a Supabase row into the showcase Game shape used by existing UI. */
export function dbGameToGame(row: DbGame): Game {
  const coverUrl = storagePublicUrl('covers', row.cover_path)
  const demoUrl = storagePublicUrl('demos', row.demo_path)
  const buildUrl = storagePublicUrl('builds', row.build_path)
  const steam = row.store_links?.steam
  const itch = row.store_links?.itch

  let status: Game['status'] = 'coming-soon'
  if (demoUrl) status = 'demo'
  else if (buildUrl || steam || itch) status = 'released'

  const desc = row.description?.trim() || ''
  const tag = row.tagline?.trim() || ''

  return {
    id: row.id,
    slug: row.slug,
    titleZh: row.title,
    titleEn: row.title,
    taglineZh: tag || row.title,
    taglineEn: tag || row.title,
    dimension: row.type,
    status,
    year: new Date(row.created_at).getFullYear(),
    genres: [row.type],
    hookZh: desc || tag,
    hookEn: desc || tag,
    gameplayZh: desc,
    gameplayEn: desc,
    features: [],
    coverImage: coverUrl ?? undefined,
    palette: DEFAULT_PALETTE,
    links: {
      play: resolvePlayHref(demoUrl) ?? undefined,
      download: buildUrl ?? undefined,
      steam: steam || undefined,
      itch: itch || undefined,
    },
  }
}


function withBustedPlay(game: Game): Game {
  return {
    ...game,
    links: {
      ...game.links,
      play: resolvePlayHref(game.links.play),
    },
  }
}

export async function fetchPublishedGames(): Promise<Game[]> {
  if (!isSupabaseConfigured) return localGames.filter(isPublicGame).map(withBustedPlay)
  const sb = getSupabase()
  if (!sb) return localGames.filter(isPublicGame).map(withBustedPlay)

  const { data, error } = await sb
    .from('games')
    .select('*')
    .eq('published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error || !data) {
    console.warn('[gamesCatalog] Supabase fetch failed, using local fallback:', error?.message)
    return localGames.filter(isPublicGame).map(withBustedPlay)
  }
  // Merge Supabase + local: prefer local Pages play/cover when present
  // (Storage-uploaded .html often serves as text/plain and shows source.)
  const remote = (data as DbGame[]).map(dbGameToGame)
  const bySlug = new Map(remote.map((g) => [g.slug, g]))
  for (const local of localGames) {
    const remoteGame = bySlug.get(local.slug)
    if (!remoteGame) {
      bySlug.set(local.slug, local)
      continue
    }
    bySlug.set(local.slug, {
      ...remoteGame,
      titleZh: remoteGame.titleZh || local.titleZh,
      titleEn: local.titleEn || remoteGame.titleEn,
      taglineZh: remoteGame.taglineZh || local.taglineZh,
      taglineEn: local.taglineEn || remoteGame.taglineEn,
      genres: local.genres.length ? local.genres : remoteGame.genres,
      palette: local.palette ?? remoteGame.palette,
      coverImage: local.coverImage || remoteGame.coverImage,
      links: {
        ...remoteGame.links,
        play: resolvePlayHref(local.links.play || remoteGame.links.play),
        download: remoteGame.links.download || local.links.download,
      },
      status: local.links.play || remoteGame.links.play ? 'demo' : remoteGame.status,
    })
  }
  const merged = Array.from(bySlug.values()).filter(isPublicGame)
  return (merged.length > 0 ? merged : localGames.filter(isPublicGame)).map(withBustedPlay)
}

export async function fetchGameBySlug(slug: string): Promise<Game | undefined> {
  if (ABANDONED_SLUGS.has(slug)) return undefined
  if (!isSupabaseConfigured) {
    const g = getLocalBySlug(slug)
    return g ? withBustedPlay(g) : undefined
  }
  const sb = getSupabase()
  if (!sb) {
    const g = getLocalBySlug(slug)
    return g ? withBustedPlay(g) : undefined
  }

  const { data, error } = await sb
    .from('games')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  if (error) {
    console.warn('[gamesCatalog] slug fetch failed:', error.message)
    const localFallback = getLocalBySlug(slug)
    return localFallback ? withBustedPlay(localFallback) : undefined
  }
  const local = getLocalBySlug(slug)
  if (!data) return local ? withBustedPlay(local) : undefined
  const remoteGame = dbGameToGame(data as DbGame)
  if (!local) return withBustedPlay(remoteGame)
  return withBustedPlay({
    ...remoteGame,
    titleEn: local.titleEn || remoteGame.titleEn,
    taglineEn: local.taglineEn || remoteGame.taglineEn,
    genres: local.genres.length ? local.genres : remoteGame.genres,
    palette: local.palette ?? remoteGame.palette,
    coverImage: local.coverImage || remoteGame.coverImage,
    links: {
      ...remoteGame.links,
      play: local.links.play || remoteGame.links.play,
      download: remoteGame.links.download || local.links.download,
    },
    status: local.links.play || remoteGame.links.play ? 'demo' : remoteGame.status,
  })
}

export function filterCatalog(
  list: Game[],
  dimension: 'all' | GameDimension,
): Game[] {
  if (dimension === 'all') return list
  return list.filter((g) => g.dimension === dimension)
}

/** Sync helpers kept for any static imports that still need local data. */
export { localGames, filterLocal, getLocalBySlug }
