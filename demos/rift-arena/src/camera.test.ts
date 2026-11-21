import { describe, expect, it, beforeEach } from 'vitest'
import { _resetAuthorTestForTests, initAuthorTestFromUrl } from './authorTest'
import { computeCamera, worldToScreen } from './render'
import { ARENA_H, ARENA_W } from './types'

describe('computeCamera', () => {
  beforeEach(() => _resetAuthorTestForTests())

  it('default free practice uses legacy fit scale (no authorTest query)', () => {
    const cw = 1280
    const ch = 720
    const fitScale = Math.min(cw / ARENA_W, ch / ARENA_H) * 0.92
    const cam = computeCamera(cw, ch, { x: 700, y: ARENA_H / 2 } as { x: number; y: number })
    expect(cam.scale).toBeCloseTo(fitScale, 6)
    expect(cam.x).toBe(700)
    const screen = worldToScreen(cam, 700, ARENA_H / 2, cw, ch)
    expect(Math.abs(screen.x - cw / 2)).toBeLessThan(8)
  })

  it('?authorTest=cover uses follow zoom with edge clamp at right cover', () => {
    initAuthorTestFromUrl('?authorTest=cover')
    const cw = 1280
    const ch = 720
    const followScale = Math.max(cw / ARENA_W, ch / ARENA_H) * 1.08
    const cam = computeCamera(cw, ch, { x: 1100, y: 420 } as { x: number; y: number })
    expect(cam.scale).toBeCloseTo(followScale, 6)
    const screen = worldToScreen(cam, 1100, 420, cw, ch)
    expect(screen.x).toBeGreaterThan(cw * 0.55)
  })
})
