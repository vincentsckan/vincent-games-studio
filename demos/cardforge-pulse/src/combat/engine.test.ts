import { describe, expect, it } from 'vitest'
import { Rng } from '../rng'
import { createCombat, playCard, canPlayCard } from './engine'
import { starterDeckInstances } from '../data/cards'

describe('combat engine', () => {
  it('鍛錘 deals 6 damage to enemy', () => {
    const rng = new Rng(1)
    const combat = createCombat(['forge_hammer', 'forge_hammer'], 'battle', 70, 70, rng, 0, false, false)
    combat.enemies = combat.enemies.slice(0, 1)
    const hp0 = combat.enemies[0].hp
    const idx = combat.hand.findIndex((c) => c.defId === 'forge_hammer')
    expect(idx).toBeGreaterThanOrEqual(0)
    expect(canPlayCard(combat, idx)).toBe(true)
    playCard(combat, idx, combat.enemies[0].uid, rng)
    expect(combat.enemies[0].hp).toBe(hp0 - 6)
  })

  it('starter deck has 12 cards', () => {
    expect(starterDeckInstances().length).toBe(12)
  })
})
