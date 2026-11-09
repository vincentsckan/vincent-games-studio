import type { Vec2 } from './types'

export function dist(ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax
  const dy = by - ay
  return Math.hypot(dx, dy)
}

export function norm(dx: number, dy: number): Vec2 {
  const l = Math.hypot(dx, dy) || 1
  return { x: dx / l, y: dy / l }
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function angleBetween(ax: number, ay: number, bx: number, by: number): number {
  return Math.atan2(by - ay, bx - ax)
}

export function circleRectHit(
  cx: number,
  cy: number,
  r: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number,
): boolean {
  const nx = clamp(cx, rx, rx + rw)
  const ny = clamp(cy, ry, ry + rh)
  return dist(cx, cy, nx, ny) < r
}

export function segmentCircleHit(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  cx: number,
  cy: number,
  r: number,
): boolean {
  const dx = x2 - x1
  const dy = y2 - y1
  const len2 = dx * dx + dy * dy
  if (len2 < 1e-6) return dist(x1, y1, cx, cy) <= r
  let t = ((cx - x1) * dx + (cy - y1) * dy) / len2
  t = clamp(t, 0, 1)
  const px = x1 + t * dx
  const py = y1 + t * dy
  return dist(px, py, cx, cy) <= r
}
