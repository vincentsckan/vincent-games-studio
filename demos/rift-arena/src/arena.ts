import { ARENA_H, ARENA_W } from './types'
import { circleRectHit, clamp, dist } from './math'

export interface CoverRect {
  x: number
  y: number
  w: number
  h: number
  /** Rift segments block sight the same way as stone, and draw as a cracked line. */
  kind?: 'cover' | 'rift'
}

/** Practice-arena cover. Campaign maps live in maps.ts and must not replace this. */
export const COVER_RECTS: CoverRect[] = [
  { x: 620, y: 420, w: 160, h: 90 },
  { x: 620, y: 540, w: 160, h: 90 },
  { x: 200, y: 350, w: 100, h: 140 },
  { x: 1100, y: 350, w: 100, h: 140 },
  { x: 200, y: 560, w: 100, h: 140 },
  { x: 1100, y: 560, w: 100, h: 140 },
  { x: 480, y: 200, w: 80, h: 80 },
  { x: 840, y: 200, w: 80, h: 80 },
  { x: 480, y: 770, w: 80, h: 80 },
  { x: 840, y: 770, w: 80, h: 80 },
]

const WALL_PAD = 42
const PLAYER_R = 26

export function clampToArena(x: number, y: number): { x: number; y: number } {
  return {
    x: clamp(x, WALL_PAD, ARENA_W - WALL_PAD),
    y: clamp(y, WALL_PAD, ARENA_H - WALL_PAD),
  }
}

export function resolveCircleCover(
  x: number,
  y: number,
  r: number,
  covers: readonly CoverRect[] = COVER_RECTS,
): { x: number; y: number } {
  let nx = x
  let ny = y
  for (const c of covers) {
    if (circleRectHit(nx, ny, r, c.x, c.y, c.w, c.h)) {
      const cx = c.x + c.w / 2
      const cy = c.y + c.h / 2
      const dx = nx - cx
      const dy = ny - cy
      const n = dist(0, 0, dx, dy) || 1
      const push = r + Math.max(c.w, c.h) * 0.35
      nx = cx + (dx / n) * push
      ny = cy + (dy / n) * push
    }
  }
  return clampToArena(nx, ny)
}

export function moveWithCollision(
  x: number,
  y: number,
  dx: number,
  dy: number,
  covers: readonly CoverRect[] = COVER_RECTS,
): { x: number; y: number } {
  let nx = x + dx
  let ny = y + dy
  const clamped = clampToArena(nx, ny)
  nx = clamped.x
  ny = clamped.y
  return resolveCircleCover(nx, ny, PLAYER_R, covers)
}

export function lineHitsCover(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  covers: readonly CoverRect[] = COVER_RECTS,
): boolean {
  for (const c of covers) {
    if (segmentRectHit(x1, y1, x2, y2, c.x, c.y, c.w, c.h)) return true
  }
  return false
}

function segmentRectHit(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number,
): boolean {
  const corners = [
    [rx, ry],
    [rx + rw, ry],
    [rx + rw, ry + rh],
    [rx, ry + rh],
  ]
  for (let i = 0; i < 4; i++) {
    const [ax, ay] = corners[i]!
    const [bx, by] = corners[(i + 1) % 4]!
    if (segmentsIntersect(x1, y1, x2, y2, ax, ay, bx, by)) return true
  }
  if (x1 >= rx && x1 <= rx + rw && y1 >= ry && y1 <= ry + rh) return true
  if (x2 >= rx && x2 <= rx + rw && y2 >= ry && y2 <= ry + rh) return true
  return false
}

function segmentsIntersect(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  x4: number,
  y4: number,
): boolean {
  const d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
  if (Math.abs(d) < 1e-9) return false
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / d
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / d
  return t >= 0 && t <= 1 && u >= 0 && u <= 1
}

export const SPAWN_P1 = { x: 280, y: ARENA_H / 2 }
export const SPAWN_P2 = { x: ARENA_W - 280, y: ARENA_H / 2 }
