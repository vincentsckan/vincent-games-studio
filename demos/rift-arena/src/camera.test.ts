import { describe, expect, it } from 'vitest'
import { computeCamera, worldToScreen } from './render'

describe('computeCamera edge clamp', () => {
  it('places player east of center on screen when at right-side cover', () => {
    const cw = 1280
    const ch = 720
    const cam = computeCamera(cw, ch, { x: 1100, y: 420 } as { x: number; y: number })
    const screen = worldToScreen(cam, 1100, 420, cw, ch)
    expect(screen.x).toBeGreaterThan(cw * 0.55)
    expect(screen.x).toBeLessThan(cw * 0.95)
  })

  it('keeps dead-center framing near arena midpoint', () => {
    const cw = 1280
    const ch = 720
    const wx = 700
    const wy = 525
    const cam = computeCamera(cw, ch, { x: wx, y: wy } as { x: number; y: number })
    const screen = worldToScreen(cam, wx, wy, cw, ch)
    expect(Math.abs(screen.x - cw / 2)).toBeLessThan(8)
  })
})
