import { describe, expect, it } from 'vitest'
import { makeFighter } from './combat'
import { KILLS_TO_WIN, RESPAWN_SEC } from './types'

describe('match rules', () => {
  it('first to five kills', () => {
    expect(KILLS_TO_WIN).toBe(5)
  })

  it('respawn window is brief', () => {
    expect(RESPAWN_SEC).toBeGreaterThan(1)
    expect(RESPAWN_SEC).toBeLessThan(5)
  })
})

describe('fighters', () => {
  it('creates distinct kits for three heroes', () => {
    const a = makeFighter('p1', 'pofeng', 1, false)
    const b = makeFighter('p2', 'xianming', 2, true)
    const c = makeFighter('p3', 'dingchao', 1, false)
    expect(a.maxHp).toBeGreaterThan(b.maxHp)
    expect(b.maxHp).not.toBe(c.maxHp)
  })
})
