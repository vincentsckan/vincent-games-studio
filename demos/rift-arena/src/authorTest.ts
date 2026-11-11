import { randomBotHero } from './heroes'
import type { HeroId } from './types'

let authorTestMeleeMirror = false
let authorTestCoverPassive = false

/** Called once at boot from the page query string (see main.ts). */
export function initAuthorTestFromUrl(search?: string): void {
  const raw =
    search ?? (typeof window !== 'undefined' ? window.location.search : '')
  const q = new URLSearchParams(raw)
  const mode = q.get('authorTest')
  authorTestMeleeMirror = mode === 'melee'
  authorTestCoverPassive = mode === 'cover'
}

export function isAuthorTestMeleeMirror(): boolean {
  return authorTestMeleeMirror
}

/** Mirror 破鋒 bot stands still (training dummy) for harness spacing. */
export function isAuthorTestMeleeDummy(): boolean {
  return authorTestMeleeMirror
}

/** Harness-only: bot stands still under `?authorTest=cover` for right-side cover stills. */
export function isAuthorTestCoverPassive(): boolean {
  return authorTestCoverPassive
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
  authorTestCoverPassive = false
}
