import { COVER_RECTS, type CoverRect } from './arena'
import type { MapId } from './types'
import { ARENA_H, ARENA_W } from './types'

/**
 * Playable cover for 裂空擂台.
 * Coordinates are a left-right symmetric reading of mm-stages-v1, not a pixel trace.
 * Maps without `implemented` collision throw — they must not fall back to the open arena.
 */
export interface ArenaMapDef {
  id: MapId
  name: string
  implemented: boolean
  covers: CoverRect[]
}

function mirrorX(rects: readonly CoverRect[]): CoverRect[] {
  const out: CoverRect[] = []
  for (const r of rects) {
    out.push({ ...r })
    const mx = ARENA_W - r.x - r.w
    if (Math.abs(mx - r.x) > 0.5) out.push({ ...r, x: mx })
  }
  return out
}

function mirrorY(rects: readonly CoverRect[]): CoverRect[] {
  const out: CoverRect[] = []
  for (const r of rects) {
    out.push({ ...r })
    const my = ARENA_H - r.y - r.h
    if (Math.abs(my - r.y) > 0.5) out.push({ ...r, y: my })
  }
  return out
}

/** Stage 1 — four short stone pairs near the ends, empty center lane. */
const M0 = mirrorX(
  mirrorY([
    { x: 230, y: 210, w: 76, h: 32, kind: 'cover' as const },
    { x: 322, y: 210, w: 76, h: 32, kind: 'cover' as const },
  ]),
)

/**
 * Stage 5 language — four rune pillars around an open center,
 * end stones, and a wide mid lane plus softer top and bottom paths.
 */
const M1 = mirrorX(
  mirrorY([
    { x: 408, y: 268, w: 74, h: 92, kind: 'cover' as const },
    { x: 214, y: 156, w: 68, h: 30, kind: 'cover' as const },
    { x: 298, y: 156, w: 68, h: 30, kind: 'cover' as const },
  ]),
)

/**
 * Stage 10 — eight staggered midfield pillars, end stones, and broken rift lines.
 * The crystal-to-crystal line is blocked; the center rune ring stays walkable.
 */
const S10_LEFT: CoverRect[] = [
  { x: 348, y: 292, w: 62, h: 78, kind: 'cover' },
  { x: 478, y: 448, w: 66, h: 104, kind: 'cover' },
  { x: 336, y: 648, w: 62, h: 78, kind: 'cover' },
  { x: 508, y: 690, w: 64, h: 76, kind: 'cover' },
  { x: 196, y: 148, w: 72, h: 30, kind: 'cover' },
  { x: 284, y: 148, w: 72, h: 30, kind: 'cover' },
  { x: 196, y: 872, w: 72, h: 30, kind: 'cover' },
  { x: 284, y: 872, w: 72, h: 30, kind: 'cover' },
  { x: 590, y: 292, w: 14, h: 86, kind: 'rift' },
  { x: 590, y: 748, w: 14, h: 86, kind: 'rift' },
]

const S10 = mirrorX(S10_LEFT)

/** Near-crystal L shelves. Upper half only; mirrorY completes the lower gate. */
const S20_CHOKE: CoverRect[] = [
  { x: 188, y: 318, w: 24, h: 128, kind: 'cover' },
  { x: 188, y: 446, w: 168, h: 22, kind: 'cover' },
  { x: 118, y: 248, w: 48, h: 26, kind: 'cover' },
]

/** Stage 20 — stage 10 midfield plus chokepoints and corner pockets. */
const S20 = mirrorX([...S10_LEFT, ...mirrorY(S20_CHOKE)])

function unimplemented(id: MapId, name: string): ArenaMapDef {
  return { id, name, implemented: false, covers: [] }
}

export const MAPS: Record<MapId, ArenaMapDef> = {
  practice: { id: 'practice', name: '自由對練', implemented: true, covers: COVER_RECTS },
  M0: { id: 'M0', name: '入門裂隙', implemented: true, covers: M0 },
  M1: { id: 'M1', name: '交錯走位', implemented: true, covers: M1 },
  M1C: unimplemented('M1C', '裂縫緣邊'),
  M2: unimplemented('M2', '狹廊'),
  M3: unimplemented('M3', '開闊廣場'),
  M4: unimplemented('M4', '殘柱林'),
  M5: unimplemented('M5', '裂縫之心'),
  S10: { id: 'S10', name: '斷線戰場', implemented: true, covers: S10 },
  S20: { id: 'S20', name: '裂空終局', implemented: true, covers: S20 },
}

export function coversFor(id: MapId): readonly CoverRect[] {
  const map = MAPS[id]
  if (!map.implemented) {
    throw new Error(`裂空擂台 map ${id} has no collision yet`)
  }
  return map.covers
}
