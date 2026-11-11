import type { Camera } from '../render'
import { ARENA_H, ARENA_W } from '../types'

/** 裂空擂台 — the third character is 擂 U+64C2. */
export const TITLE = '裂空擂台'

if (TITLE.codePointAt(2) !== 0x64c2) {
  throw new Error('title glyph drifted')
}

/** Locked plate is 1280×720. World size keeps that aspect. */
export const PLATE_W = 22.4
export const PLATE_D = 22.4 * (720 / 1280)

/**
 * Supplied glTF meshes face +X. A quarter turn about Y brings the chest to -Z,
 * which is the showcase front shot. Match facing uses matchYaw instead.
 */
export const FACE_YAW = Math.PI / 2

/** Radians down from straight overhead. Ground mapping stays on computeCamera. */
export const GAMEPLAY_PITCH = 0.58
export const GAMEPLAY_CAM_DIST = 10

export const TARGET_HEIGHT: Record<string, number> = {
  'pofeng-p1': 1.32,
  'pofeng-p2': 1.78,
  'xianming-p1': 1.74,
  'xianming-p2': 1.74,
  'dingchao-p1': 1.8,
  'dingchao-p2': 1.8,
}

export interface HeroSpec {
  id: 'pofeng' | 'xianming' | 'dingchao'
  name: string
}

export const FIGURINE_HEROES: readonly HeroSpec[] = [
  { id: 'pofeng', name: '破鋒' },
  { id: 'xianming', name: '弦鳴' },
  { id: 'dingchao', name: '定潮' },
]

export const FIGURINE_SIDES = ['p1', 'p2'] as const
export type FigurineSide = (typeof FIGURINE_SIDES)[number]

export function figurineKey(hero: string, side: FigurineSide): string {
  return `${hero}-${side}`
}

export function gameToWorld(x: number, y: number): { x: number; z: number } {
  return {
    x: (x / ARENA_W - 0.5) * PLATE_W,
    z: (y / ARENA_H - 0.5) * PLATE_D,
  }
}

/**
 * Chest of the supplied mesh is local +X.
 * rotation.y = -angle points that chest along the gameplay facing vector
 * (cos angle, sin angle) in (world X, world Z).
 */
export function matchYaw(angle: number): number {
  return -angle
}

export interface GameplayView {
  focus: { x: number; z: number }
  position: { x: number; y: number; z: number }
  up: { x: number; y: number; z: number }
  left: number
  right: number
  top: number
  bottom: number
  near: number
  far: number
}

/**
 * Orthographic pose whose ground plane matches computeCamera.
 * Distance does not change the ground scale. Pitch lifts the meshes
 * toward the top of the screen without moving their feet.
 */
export function gameplayView(cam: Camera, cw: number, ch: number): GameplayView {
  const focus = gameToWorld(cam.x, cam.y)
  const halfGameW = cw / (2 * cam.scale)
  const halfGameH = ch / (2 * cam.scale)
  const halfW = (halfGameW / ARENA_W) * PLATE_W
  const halfD = (halfGameH / ARENA_H) * PLATE_D
  const theta = GAMEPLAY_PITCH
  const cos = Math.cos(theta)
  const sin = Math.sin(theta)
  return {
    focus,
    position: {
      x: focus.x,
      y: cos * GAMEPLAY_CAM_DIST,
      z: focus.z + sin * GAMEPLAY_CAM_DIST,
    },
    up: { x: 0, y: sin, z: -cos },
    left: -halfW,
    right: halfW,
    top: halfD * cos,
    bottom: -halfD * cos,
    near: 0.2,
    far: 80,
  }
}
