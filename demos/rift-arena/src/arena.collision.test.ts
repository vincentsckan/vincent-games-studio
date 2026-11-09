import { describe, expect, it } from 'vitest'
import { COVER_RECTS, moveWithCollision, SPAWN_P1 } from './arena'

describe('cover collision', () => {
  it('blocks movement into central pillar', () => {
    const c = COVER_RECTS[0]!
    const cx = c.x + c.w / 2
    const cy = c.y + c.h / 2
    const startX = cx - c.w
    const moved = moveWithCollision(startX, cy, c.w * 0.9, 0)
    expect(moved.x).toBeLessThan(cx - 10)
  })

  it('resolves each cover rect without NaN', () => {
    for (const c of COVER_RECTS) {
      const pos = moveWithCollision(c.x + c.w / 2, c.y + c.h / 2, 0, 0)
      expect(Number.isFinite(pos.x)).toBe(true)
      expect(Number.isFinite(pos.y)).toBe(true)
    }
  })

  it('spawn p1 is inside arena bounds', () => {
    const moved = moveWithCollision(SPAWN_P1.x, SPAWN_P1.y, 0, 0)
    expect(moved.x).toBeCloseTo(SPAWN_P1.x, 0)
    expect(moved.y).toBeCloseTo(SPAWN_P1.y, 0)
  })
})
