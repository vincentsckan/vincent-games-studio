import { describe, expect, it } from 'vitest'
import { computeCamera } from '../render'
import { ARENA_H, ARENA_W } from '../types'
import { GAMEPLAY_PITCH, TITLE, gameToWorld, gameplayView, matchYaw } from './layout'

describe('stage-1 3d preview contract', () => {
  it('keeps 擂 as the third title character', () => {
    expect(TITLE.codePointAt(2)).toBe(0x64c2)
    expect(TITLE).toBe('裂空擂台')
  })

  it('keeps the accepted computeCamera scale and focus', () => {
    const cam = computeCamera(1280, 720, { x: 280, y: 400 } as never)
    expect(cam.x).toBe(280)
    expect(cam.y).toBe(400)
    expect(cam.scale).toBeCloseTo(Math.min(1280 / ARENA_W, 720 / ARENA_H) * 0.92)
    const idle = computeCamera(1280, 720)
    expect(idle.x).toBe(ARENA_W / 2)
    expect(idle.y).toBe(ARENA_H / 2)
  })

  it('maps the arena center onto the plate center', () => {
    expect(gameToWorld(ARENA_W / 2, ARENA_H / 2)).toEqual({ x: 0, z: 0 })
  })

  it('points the mesh chest along the gameplay facing vector', () => {
    for (const angle of [0, Math.PI / 2, Math.PI, -0.4]) {
      const yaw = matchYaw(angle)
      const chestX = Math.cos(yaw)
      const chestZ = -Math.sin(yaw)
      expect(chestX).toBeCloseTo(Math.cos(angle))
      expect(chestZ).toBeCloseTo(Math.sin(angle))
    }
  })

  it('keeps gameplay feet on the computeCamera ground plane', () => {
    const cam = computeCamera(1280, 720, { x: 420, y: 610 } as never)
    const view = gameplayView(cam, 1280, 720)
    const project = (x: number, y: number, z: number) => {
      const dx = x - view.focus.x
      const dy = y
      const dz = z - view.focus.z
      const camX = dx
      const camY = dy * view.up.y + dz * view.up.z
      return { x: camX / view.right, y: camY / view.top }
    }
    const focus = gameToWorld(cam.x, cam.y)
    expect(project(focus.x, 0, focus.z)).toEqual({ x: 0, y: 0 })
    const halfW = view.right
    const halfD = view.top / Math.cos(GAMEPLAY_PITCH)
    expect(project(focus.x + halfW, 0, focus.z).x).toBeCloseTo(1)
    expect(project(focus.x, 0, focus.z + halfD).y).toBeCloseTo(-1)
    expect(project(focus.x, 1.7, focus.z).y).toBeGreaterThan(0)
  })
})
