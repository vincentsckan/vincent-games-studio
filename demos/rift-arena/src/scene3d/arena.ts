import * as THREE from 'three'
import { PLATE_D, PLATE_W } from './layout'

const INNER_X = 6.85
const INNER_Z = 3.55
const CORNER = 1.05

export const PLAYER_RADIUS = 0.34

function fromPlate(px: number, py: number): { x: number; z: number } {
  return {
    x: (px / 1280 - 0.5) * PLATE_W,
    z: (py / 720 - 0.5) * PLATE_D,
  }
}

export function insideWalkable(x: number, z: number, pad = 0): boolean {
  const hx = INNER_X - pad
  const hz = INNER_Z - pad
  const r = Math.max(0.15, CORNER - pad * 0.25)
  const ax = Math.abs(x)
  const az = Math.abs(z)
  if (ax > hx || az > hz) return false
  if (ax <= hx - r || az <= hz - r) return true
  const dx = ax - (hx - r)
  const dz = az - (hz - r)
  return dx * dx + dz * dz <= r * r
}

function crystalMesh(color: THREE.Color, emissive: THREE.Color): THREE.Mesh {
  const points = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.1, 0.08),
    new THREE.Vector2(0.34, 0.42),
    new THREE.Vector2(0.22, 1.25),
    new THREE.Vector2(0.08, 1.85),
    new THREE.Vector2(0.0, 2.15),
  ]
  const geo = new THREE.LatheGeometry(points, 6)
  const material = new THREE.MeshStandardMaterial({
    color,
    emissive,
    emissiveIntensity: 1.8,
    roughness: 0.16,
    metalness: 0.12,
    transparent: true,
    opacity: 0.94,
  })
  const mesh = new THREE.Mesh(geo, material)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

export interface ArenaRig {
  group: THREE.Group
  circles: { x: number; z: number; r: number }[]
  boxes: { minX: number; maxX: number; minZ: number; maxZ: number }[]
  dust: THREE.Points
  spawn: THREE.Vector3
}

export function buildArena(floorTex: THREE.Texture, moodTex: THREE.Texture): ArenaRig {
  const group = new THREE.Group()
  group.name = 'arena'
  const circles: ArenaRig['circles'] = []
  const boxes: ArenaRig['boxes'] = []

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(28, 64),
    new THREE.MeshStandardMaterial({ color: 0x05040a, roughness: 1, metalness: 0 }),
  )
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -1.05
  ground.receiveShadow = true
  group.add(ground)

  const slab = new THREE.Mesh(
    new THREE.BoxGeometry(PLATE_W, 0.86, PLATE_D),
    new THREE.MeshStandardMaterial({ color: 0x121018, roughness: 0.94, metalness: 0.04 }),
  )
  slab.position.y = -0.43
  slab.receiveShadow = true
  slab.castShadow = true
  group.add(slab)

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(PLATE_W, PLATE_D),
    new THREE.MeshStandardMaterial({
      map: floorTex,
      emissiveMap: floorTex,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 0.42,
      roughness: 0.78,
      metalness: 0.12,
    }),
  )
  floor.rotation.x = -Math.PI / 2
  floor.position.y = 0.012
  floor.receiveShadow = true
  group.add(floor)

  const mood = new THREE.Mesh(
    new THREE.CylinderGeometry(16.5, 16.5, 8.5, 48, 1, true),
    new THREE.MeshBasicMaterial({
      map: moodTex,
      color: 0x6a6280,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
    }),
  )
  mood.position.y = 2.4
  group.add(mood)

  const stone = new THREE.MeshStandardMaterial({
    color: 0x3a4258,
    roughness: 0.48,
    metalness: 0.42,
  })
  const cyanMat = new THREE.MeshStandardMaterial({
    color: 0x12343c,
    emissive: 0x39e7ff,
    emissiveIntensity: 2.1,
    roughness: 0.22,
    metalness: 0.18,
  })
  const magentaMat = new THREE.MeshStandardMaterial({
    color: 0x3a1230,
    emissive: 0xff3d92,
    emissiveIntensity: 2.1,
    roughness: 0.22,
    metalness: 0.18,
  })

  const crystals = [
    { px: 128, py: 277, material: cyanMat, light: 0x39e7ff },
    { px: 1149, py: 277, material: magentaMat, light: 0xff3d92 },
  ]
  for (const item of crystals) {
    const spot = fromPlate(item.px, item.py)
    const crystal = crystalMesh(item.material.color, item.material.emissive)
    crystal.position.set(spot.x, 0.02, spot.z)
    group.add(crystal)
    const light = new THREE.PointLight(item.light, 12, 11, 1.7)
    light.position.set(spot.x, 1.7, spot.z)
    group.add(light)
    circles.push({ x: spot.x, z: spot.z, r: 0.85 })
  }

  const pillars = [
    { px: 445, py: 200, side: -1 },
    { px: 445, py: 455, side: -1 },
    { px: 870, py: 200, side: 1 },
    { px: 870, py: 455, side: 1 },
  ]
  for (const item of pillars) {
    const spot = fromPlate(item.px, item.py)
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.4, 1.05, 6), stone)
    pillar.position.set(spot.x, 0.52, spot.z)
    pillar.castShadow = true
    pillar.receiveShadow = true
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), item.side < 0 ? cyanMat : magentaMat)
    gem.scale.set(1.1, 1.5, 0.22)
    const reach = Math.hypot(spot.x, spot.z) || 1
    gem.position.set(spot.x - (spot.x / reach) * 0.36, 0.72, spot.z - (spot.z / reach) * 0.36)
    gem.lookAt(0, 0.72, 0)
    group.add(pillar, gem)
    circles.push({ x: spot.x, z: spot.z, r: 0.48 })
  }

  const covers = [
    { px: 310, py: 215, rot: 0 },
    { px: 320, py: 440, rot: 0 },
    { px: 960, py: 215, rot: 0 },
    { px: 960, py: 440, rot: 0 },
  ]
  for (const item of covers) {
    const spot = fromPlate(item.px, item.py)
    const piece = new THREE.Group()
    const sizes: [number, number, number][] = [
      [-0.42, 0.28, 0.22],
      [0.0, 0.34, 0.22],
      [0.42, 0.28, 0.22],
    ]
    for (const [ox, h, oz] of sizes) {
      const block = new THREE.Mesh(new THREE.BoxGeometry(0.36, h, oz), stone)
      block.position.set(ox, h * 0.5, 0)
      block.castShadow = true
      block.receiveShadow = true
      piece.add(block)
    }
    const slit = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.03, 0.03), spot.x < 0 ? cyanMat : magentaMat)
    slit.position.set(0, 0.22, 0.1)
    piece.add(slit)
    piece.position.set(spot.x, 0, spot.z)
    piece.rotation.y = item.rot
    group.add(piece)
    boxes.push({
      minX: spot.x - 0.7,
      maxX: spot.x + 0.7,
      minZ: spot.z - 0.28,
      maxZ: spot.z + 0.28,
    })
  }

  const dustGeo = new THREE.BufferGeometry()
  const dustCount = 160
  const dustPos = new Float32Array(dustCount * 3)
  for (let i = 0; i < dustCount; i += 1) {
    dustPos[i * 3] = (Math.random() - 0.5) * 20
    dustPos[i * 3 + 1] = 0.35 + Math.random() * 2.8
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 11
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3))
  const dust = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({ color: 0x9ab0d8, size: 0.03, transparent: true, opacity: 0.4 }),
  )
  group.add(dust)

  return {
    group,
    circles,
    boxes,
    dust,
    spawn: new THREE.Vector3(0, 0, 1.15),
  }
}

export function blocked(
  x: number,
  z: number,
  circles: ArenaRig['circles'],
  boxes: ArenaRig['boxes'],
): boolean {
  if (!insideWalkable(x, z, PLAYER_RADIUS)) return true
  for (const circle of circles) {
    const dx = x - circle.x
    const dz = z - circle.z
    const reach = circle.r + PLAYER_RADIUS * 0.85
    if (dx * dx + dz * dz < reach * reach) return true
  }
  for (const box of boxes) {
    if (
      x > box.minX - PLAYER_RADIUS &&
      x < box.maxX + PLAYER_RADIUS &&
      z > box.minZ - PLAYER_RADIUS &&
      z < box.maxZ + PLAYER_RADIUS
    ) {
      return true
    }
  }
  return false
}
