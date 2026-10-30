import { useCallback, useEffect, useState } from 'react'
import type { Game } from '../data/games'
import { fetchGameBySlug, fetchPublishedGames } from '../lib/gamesCatalog'

type State = {
  games: Game[]
  loading: boolean
  error: string | null
}

export function useCatalogGames() {
  const [state, setState] = useState<State>({
    games: [],
    loading: true,
    error: null,
  })

  const reload = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const games = await fetchPublishedGames()
      setState({ games, loading: false, error: null })
    } catch (e) {
      setState({
        games: [],
        loading: false,
        error: e instanceof Error ? e.message : 'Failed to load games',
      })
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  return { ...state, reload }
}

export function useCatalogGame(slug: string | undefined) {
  const [game, setGame] = useState<Game | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) {
      setGame(undefined)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    void fetchGameBySlug(slug)
      .then((g) => {
        if (!cancelled) {
          setGame(g)
          setLoading(false)
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load game')
          setGame(undefined)
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  return { game, loading, error }
}
