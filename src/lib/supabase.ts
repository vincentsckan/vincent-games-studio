import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** True when both Vite env vars are set — public site then loads from Supabase. */
export const isSupabaseConfigured = Boolean(
  url && anonKey && url.length > 0 && anonKey.length > 0,
)

export type StoreLinks = {
  steam?: string
  itch?: string
}

/** Row shape matching supabase/migrations/001_games_admin.sql */
export type DbGame = {
  id: string
  slug: string
  title: string
  tagline: string | null
  description: string | null
  type: '2D' | '3D'
  cover_path: string | null
  trailer_url: string | null
  demo_path: string | null
  build_path: string | null
  price_cents: number
  currency: string
  store_links: StoreLinks
  published: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export type DbGameWrite = {
  slug: string
  title: string
  tagline: string | null
  description: string | null
  type: '2D' | '3D'
  cover_path: string | null
  trailer_url: string | null
  demo_path: string | null
  build_path: string | null
  price_cents: number
  currency: string
  store_links: StoreLinks
  published: boolean
  sort_order: number
}

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null
  if (!client) {
    client = createClient(url!, anonKey!)
  }
  return client
}

/** Public URL for a storage object path, or null. */
export function storagePublicUrl(
  bucket: 'covers' | 'demos' | 'builds',
  path: string | null | undefined,
): string | null {
  if (!path) return null
  if (/^https?:\/\//i.test(path)) return path
  const sb = getSupabase()
  if (!sb) return null
  const { data } = sb.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
