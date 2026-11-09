import { describe, expect, it } from 'vitest'
import { KILLS_TO_WIN } from './types'

describe('match rules', () => {
  it('wins at 5 kills', () => {
    expect(KILLS_TO_WIN).toBe(5)
  })
})

describe('cooldowns', () => {
  it('basic cd decreases', () => {
    let cd = 0.45
    const dt = 0.1
    cd = Math.max(0, cd - dt)
    expect(cd).toBeCloseTo(0.35)
  })
})
