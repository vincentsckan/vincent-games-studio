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
      play: demoUrl ?? undefined,
      download: buildUrl ?? undefined,
      steam: steam || undefined,
      itch: itch || undefined,
    },
  }
}

export async function fetchPublishedGames(): Promise<Game[]> {
  if (!isSupabaseConfigured) return localGames
  const sb = getSupabase()
  if (!sb) return localGames

  const { data, error } = await sb
    .from('games')
    .select('*')
    .eq('published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error || !data) {
    console.warn('[gamesCatalog] Supabase fetch failed, using local fallback:', error?.message)
    return localGames
  }
  if (data.length === 0) return localGames
  return (data as DbGame[]).map(dbGameToGame)
}

export async function fetchGameBySlug(slug: string): Promise<Game | undefined> {
  if (!isSupabaseConfigured) return getLocalBySlug(slug)
  const sb = getSupabase()
  if (!sb) return getLocalBySlug(slug)

  const { data, error } = await sb
    .from('games')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  if (error) {
    console.warn('[gamesCatalog] slug fetch failed:', error.message)
    return getLocalBySlug(slug)
  }
  if (!data) return getLocalBySlug(slug)
  return dbGameToGame(data as DbGame)
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
