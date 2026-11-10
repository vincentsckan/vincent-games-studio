import { randomBotHero } from './heroes'
import type { HeroId } from './types'

let authorTestMeleeMirror = false

/** Called once at boot from the page query string (see main.ts). */
export function initAuthorTestFromUrl(search?: string): void {
  const raw =
    search ?? (typeof window !== 'undefined' ? window.location.search : '')
  const q = new URLSearchParams(raw)
  authorTestMeleeMirror = q.get('authorTest') === 'melee'
}

export function isAuthorTestMeleeMirror(): boolean {
  return authorTestMeleeMirror
}

/**
 * Picks the P2 hero for 自由對練. Default is unchanged randomBotHero.
 * With `?authorTest=melee`, 破鋒 players face a mirror 破鋒 bot for harness / author self-test only.
 */
export function resolveBotHeroForMatch(playerHero: HeroId): HeroId {
  if (authorTestMeleeMirror && playerHero === 'pofeng') return 'pofeng'
  return randomBotHero(playerHero)
}

export function _resetAuthorTestForTests(): void {
  authorTestMeleeMirror = false
}
