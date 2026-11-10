import { describe, expect, it } from 'vitest'
import { COVER_RECTS, lineHitsCover, moveWithCollision, SPAWN_P1, SPAWN_P2, type CoverRect } from './arena'
import { coversFor, MAPS } from './maps'
import { ARENA_H, ARENA_W, type MapId } from './types'

function isStandable(x: number, y: number, covers: readonly CoverRect[]): boolean {
  if (x < 48 || y < 48 || x > ARENA_W - 48 || y > ARENA_H - 48) return false
  const p = moveWithCollision(x, y, 0, 0, covers)
  return Math.abs(p.x - x) < 4 && Math.abs(p.y - y) < 4
}

function canWalk(covers: readonly CoverRect[], ax: number, ay: number, bx: number, by: number): boolean {
  const step = 24
  const x0 = 60
  const y0 = 60
  const cols = Math.floor((ARENA_W - 120) / step)
  const rows = Math.floor((ARENA_H - 120) / step)
  const stand: boolean[][] = []
  for (let c = 0; c <= cols; c++) {
    stand[c] = []
    for (let r = 0; r <= rows; r++) {
      stand[c]![r] = isStandable(x0 + c * step, y0 + r * step, covers)
    }
  }
  const cell = (x: number, y: number) => ({
    c: Math.round((x - x0) / step),
    r: Math.round((y - y0) / step),
  })
  const start = cell(ax, ay)
  const goal = cell(bx, by)
  if (!stand[start.c]?.[start.r] || !stand[goal.c]?.[goal.r]) return false
  const seen = new Set<string>([`${start.c},${start.r}`])
  const q: { c: number; r: number }[] = [start]
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ]
  while (q.length) {
    const cur = q.shift()!
    if (cur.c === goal.c && cur.r === goal.r) return true
    for (const [dc, dr] of dirs) {
      const nc = cur.c + dc
      const nr = cur.r + dr
      const key = `${nc},${nr}`
      if (seen.has(key) || !stand[nc]?.[nr]) continue
      if (dc !== 0 && dr !== 0 && (!stand[cur.c]?.[nr] || !stand[nc]?.[cur.r])) continue
      seen.add(key)
      q.push({ c: nc, r: nr })
    }
  }
  return false
}

function openRatio(covers: readonly CoverRect[]): number {
  let open = 0
  let total = 0
  for (let y = 80; y <= ARENA_H - 80; y += 28) {
    for (let x = 80; x <= ARENA_W - 80; x += 28) {
      total += 1
      if (isStandable(x, y, covers)) open += 1
    }
  }
  return open / total
}

function openCountAtX(covers: readonly CoverRect[], x: number): number {
  let open = 0
  for (let y = 180; y <= 880; y += 10) {
    if (isStandable(x, y, covers)) open += 1
  }
  return open
}

function expectSymmetric(covers: readonly CoverRect[]): void {
  for (const r of covers) {
    const mx = ARENA_W - r.x - r.w
    const mirror = covers.find(
      (o) => Math.abs(o.x - mx) < 0.6 && Math.abs(o.y - r.y) < 0.6 && o.w === r.w && o.h === r.h,
    )
    expect(mirror, `missing mirror for ${r.x},${r.y}`).toBeTruthy()
  }
}

const PLAYABLE: MapId[] = ['M0', 'M1', 'M1C', 'M2', 'M3', 'M4', 'M5', 'S10', 'S20']

describe('campaign maps', () => {
  it('keeps the practice arena on the original cover', () => {
    expect(coversFor('practice')).toBe(COVER_RECTS)
  })

  it('refuses to fall back when a map has no collision', () => {
    const map = MAPS.M3
    const previous = map.implemented
    map.implemented = false
    try {
      expect(() => coversFor('M3')).toThrow(/no collision/)
    } finally {
      map.implemented = previous
    }
    expect(coversFor('M3')).not.toBe(COVER_RECTS)
  })

  it('builds denser layouts from stage 1 through 20', () => {
    const m0 = coversFor('M0')
    const m1 = coversFor('M1')
    const s10 = coversFor('S10')
    const s20 = coversFor('S20')
    expect(m0.length).toBeLessThan(m1.length)
    expect(m1.length).toBeLessThan(s10.length)
    expect(s10.length).toBeLessThan(s20.length)
    expect(s10).not.toEqual(COVER_RECTS)
    expect(s20).not.toEqual(COVER_RECTS)
    expect(s10).not.toEqual(m1)
    expect(s20).not.toEqual(s10)
  })

  it('stays left-right symmetric, with clear spawns and a walk to the far side', () => {
    for (const id of PLAYABLE) {
      const covers = coversFor(id)
      expectSymmetric(covers)
      expect(isStandable(SPAWN_P1.x, SPAWN_P1.y, covers)).toBe(true)
      expect(isStandable(SPAWN_P2.x, SPAWN_P2.y, covers)).toBe(true)
      expect(canWalk(covers, SPAWN_P1.x, SPAWN_P1.y, SPAWN_P2.x, SPAWN_P2.y)).toBe(true)
    }
  })

  it('keeps stage 1 open and stage 5 on a wide center lane', () => {
    const m0 = coversFor('M0')
    const m1 = coversFor('M1')
    expect(lineHitsCover(SPAWN_P1.x, SPAWN_P1.y, SPAWN_P2.x, SPAWN_P2.y, m0)).toBe(false)
    expect(lineHitsCover(SPAWN_P1.x, SPAWN_P1.y, SPAWN_P2.x, SPAWN_P2.y, m1)).toBe(false)
    expect(isStandable(700, 525, m0)).toBe(true)
    expect(isStandable(700, 525, m1)).toBe(true)
    expect(isStandable(700, 210, m1)).toBe(true)
    expect(isStandable(700, 860, m1)).toBe(true)
    expect(openRatio(m0)).toBeGreaterThan(openRatio(m1))
  })

  it('breaks the long sightline on stages 10 and 20 without sealing the center or the map', () => {
    const s10 = coversFor('S10')
    const s20 = coversFor('S20')
    expect(lineHitsCover(SPAWN_P1.x, SPAWN_P1.y, SPAWN_P2.x, SPAWN_P2.y, s10)).toBe(true)
    expect(lineHitsCover(SPAWN_P1.x, SPAWN_P1.y, SPAWN_P2.x, SPAWN_P2.y, s20)).toBe(true)
    expect(isStandable(700, 525, s10)).toBe(true)
    expect(isStandable(700, 525, s20)).toBe(true)
    expect(s10.filter((r) => r.kind === 'rift').length).toBeGreaterThanOrEqual(4)
    expect(openCountAtX(s20, 300)).toBeLessThan(openCountAtX(s10, 300))
    expect(openRatio(s20)).toBeGreaterThan(0.55)
    expect(openRatio(s20)).toBeLessThan(openRatio(s10))
    expect(s20.some((r) => r.w >= 150)).toBe(true)
  })

  it('gives the remaining plan layouts their own collision', () => {
    const m1 = coversFor('M1')
    const m2 = coversFor('M2')
    const m3 = coversFor('M3')
    const m4 = coversFor('M4')
    const m5 = coversFor('M5')
    const m1c = coversFor('M1C')
    const s10 = coversFor('S10')
    for (const covers of [m2, m3, m4, m5, m1c]) {
      expect(covers).not.toEqual(COVER_RECTS)
      expect(covers).not.toEqual(s10)
      expect(openRatio(covers)).toBeGreaterThan(0.55)
    }
    expect(m2.some((r) => r.w >= 180)).toBe(true)
    expect(openCountAtX(m2, 200)).toBeLessThan(openCountAtX(m2, 410))
    expect(lineHitsCover(SPAWN_P1.x, SPAWN_P1.y, SPAWN_P2.x, SPAWN_P2.y, m2)).toBe(false)
    expect(openRatio(m3)).toBeGreaterThan(openRatio(m1))
    expect(lineHitsCover(SPAWN_P1.x, SPAWN_P1.y, SPAWN_P2.x, SPAWN_P2.y, m3)).toBe(false)
    expect(isStandable(700, 525, m3)).toBe(true)
    expect(lineHitsCover(SPAWN_P1.x, SPAWN_P1.y, SPAWN_P2.x, SPAWN_P2.y, m4)).toBe(true)
    expect(isStandable(700, 525, m4)).toBe(true)
    expect(m4).not.toEqual(s10)
    expect(isStandable(560, 380, m1)).toBe(true)
    expect(isStandable(560, 380, m1c)).toBe(false)
    expect(isStandable(700, 525, m1c)).toBe(true)
    expect(m5.some((r) => r.kind === 'rift')).toBe(true)
    expect(lineHitsCover(SPAWN_P1.x, SPAWN_P1.y, SPAWN_P2.x, SPAWN_P2.y, m5)).toBe(true)
    expect(isStandable(700, 525, m5)).toBe(true)
    expect(MAPS.M2.name).toBe('狹廊')
    expect(MAPS.M3.name).toBe('開闊廣場')
    expect(MAPS.M4.name).toBe('殘柱林')
    expect(MAPS.M5.name).toBe('裂縫之心')
    expect(MAPS.M1C.name).toBe('裂縫緣邊')
  })
})
