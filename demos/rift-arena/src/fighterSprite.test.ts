import { describe, expect, it } from 'vitest'
import { heroFull } from './assets'
import { FIGHTER_SPRITE_HEIGHT_PX, fighterDrawSize } from './fighterSprite'
import type { HeroId } from './types'

describe('fighterDrawSize', () => {
  it('does not crush width with legacy 0.45-style sliver sizing', () => {
    const { w, h } = fighterDrawSize(512, 682, 0.92)
    expect(h).toBeCloseTo(FIGHTER_SPRITE_HEIGHT_PX * 0.92, 1)
    expect(w).toBeGreaterThan(55)
    expect(w / h).toBeCloseTo(512 / 682, 2)
    const legacyW = h * (512 / 682) * 0.45
    expect(w).toBeGreaterThan(legacyW * 1.8)
  })
})

describe('in-arena sprite manifest', () => {
  it('lists all six full-body P1+P2 paths', () => {
    const heroes: HeroId[] = ['pofeng', 'xianming', 'dingchao']
    const urls = heroes.flatMap((h) => [heroFull(h, 1), heroFull(h, 2)])
    expect(urls).toHaveLength(6)
    expect(new Set(urls).size).toBe(6)
    for (const u of urls) {
      expect(u).toMatch(/-full-p[12]\.png$/)
    }
  })
})
