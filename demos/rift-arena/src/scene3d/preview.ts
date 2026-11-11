import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { computeCamera } from '../render'
import type { MatchState } from '../types'
import { blocked, buildArena, type ArenaRig } from './arena'
import {
  FACE_YAW,
  FIGURINE_HEROES,
  FIGURINE_SIDES,
  TARGET_HEIGHT,
  TITLE,
  figurineKey,
  gameToWorld,
  gameplayView,
  matchYaw,
  type FigurineSide,
} from './layout'

export type PreviewMode = 'game' | 'figurines' | 'shot'

export type ShotAngle = 'front' | 'back' | 'left' | 'right' | 'threeq'

const ANGLE_LABEL: Record<ShotAngle, string> = {
  front: '正前',
  back: '正後',
  left: '左側',
  right: '右側',
  threeq: '四分之三側',
}

interface PreviewHooks {
  title: string
  mode: PreviewMode
  ready: boolean
  select: (hero: string, side: FigurineSide) => void
  shoot: (hero: string, side: FigurineSide, angle: ShotAngle) => void
}

declare global {
  interface Window {
    __PREVIEW_READY?: boolean
    __SHOT_READY?: boolean
    __SHOT_FRAME?: number
    __arenaPreview?: PreviewHooks
  }
}

function assetUrl(file: string): string {
  const base = import.meta.env.BASE_URL
  return `${base}stage1-3d/${file}`
}

function loadTexture(url: string): Promise<THREE.Texture> {
  const loader = new THREE.TextureLoader()
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace
        texture.anisotropy = 8
        texture.wrapS = THREE.ClampToEdgeWrapping
        texture.wrapT = THREE.ClampToEdgeWrapping
        texture.needsUpdate = true
        resolve(texture)
      },
      undefined,
      reject,
    )
  })
}

function fitMaterials(root: THREE.Object3D): void {
  root.traverse((node) => {
    const mesh = node as THREE.Mesh
    if (!mesh.isMesh) return
    mesh.castShadow = true
    mesh.receiveShadow = true
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    for (const material of materials) {
      if (!material) continue
      material.side = THREE.FrontSide
      if ('envMapIntensity' in material) material.envMapIntensity = 1
    }
  })
}

function plantFigurine(root: THREE.Object3D, key: string): number {
  root.updateMatrixWorld(true)
  const box = new THREE.Box3().setFromObject(root)
  const height = Math.max(0.001, box.max.y - box.min.y)
  const scale = (TARGET_HEIGHT[key] || 1.7) / height
  root.scale.setScalar(scale)
  return -box.min.y * scale
}

function shortest(from: number, to: number): number {
  let delta = to - from
  while (delta > Math.PI) delta -= Math.PI * 2
  while (delta < -Math.PI) delta += Math.PI * 2
  return from + delta
}

export class Stage1Preview {
  readonly canvas: HTMLCanvasElement
  mode: PreviewMode = 'game'
  ready = false

  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private gameCamera: THREE.OrthographicCamera
  private showCamera: THREE.PerspectiveCamera
  private activeCamera: THREE.Camera
  private figurines = new Map<string, THREE.Object3D>()
  private feet = new Map<string, number>()
  private arena: ArenaRig | null = null
  private heroId = 'pofeng'
  private side: FigurineSide = 'p1'
  private current: THREE.Object3D | null = null
  private body = { x: 0, z: 1.15, yaw: 0 }
  private camYaw = Math.PI * 0.82
  private camPitch = 0.38
  private camDist = 5.4
  private keys = new Set<string>()
  private shotAngle: ShotAngle = 'front'
  private shotFrames = 0
  private heroButtons = new Map<string, HTMLButtonElement>()
  private sideButtons = new Map<string, HTMLButtonElement>()
  private panel: HTMLElement | null = null
  private caption: HTMLElement | null = null
  private who: HTMLElement | null = null
  private errorBox: HTMLElement | null = null
  private dragging = false
  private lastX = 0
  private lastY = 0

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false })
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.05
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.scene.background = new THREE.Color(0x07060f)
    this.scene.fog = new THREE.FogExp2(0x07060f, 0.038)
    this.gameCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.2, 80)
    this.showCamera = new THREE.PerspectiveCamera(48, 1, 0.08, 80)
    this.activeCamera = this.gameCamera
    this.installLights()
    this.installUi()
    this.installInput()
    this.publish()
  }

  private installLights(): void {
    const pmrem = new THREE.PMREMGenerator(this.renderer)
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    const hemi = new THREE.HemisphereLight(0x24304a, 0x100c10, 0.55)
    this.scene.add(hemi)
    const key = new THREE.DirectionalLight(0xfff2e4, 1.65)
    key.position.set(-4.5, 8.5, 3.5)
    key.castShadow = true
    key.shadow.mapSize.set(1024, 1024)
    key.shadow.camera.near = 1
    key.shadow.camera.far = 28
    key.shadow.camera.left = -12
    key.shadow.camera.right = 12
    key.shadow.camera.top = 12
    key.shadow.camera.bottom = -12
    key.shadow.bias = -0.0004
    this.scene.add(key)
    const fill = new THREE.DirectionalLight(0xb9c6ff, 0.7)
    fill.position.set(5, 3.2, 4)
    this.scene.add(fill)
  }

  private installUi(): void {
    const root = document.createElement('div')
    root.id = 'figurine-ui'
    root.innerHTML = `
      <div id="fig-hud">
        <h1>裂空<span>擂</span>台</h1>
        <p>立體公仔 · 本地預覽</p>
        <p id="fig-who">破鋒 · P1</p>
      </div>
      <div id="fig-panel">
        <div class="row" id="fig-heroes"></div>
        <div class="row" id="fig-sides"></div>
        <p class="hint">WASD／方向鍵移動 · 拖曳旋轉鏡頭 · 滾輪遠近 · 1／2／3 切英雄 · F 切換 P1／P2 · Esc 返回標題</p>
      </div>
      <div id="fig-caption" hidden></div>
      <div id="fig-error"></div>
    `
    document.body.appendChild(root)
    this.panel = root.querySelector('#fig-panel')
    this.caption = root.querySelector('#fig-caption')
    this.who = root.querySelector('#fig-who')
    this.errorBox = root.querySelector('#fig-error')
    const heroes = root.querySelector('#fig-heroes') as HTMLElement
    const sides = root.querySelector('#fig-sides') as HTMLElement
    for (const hero of FIGURINE_HEROES) {
      const button = document.createElement('button')
      button.type = 'button'
      button.textContent = hero.name
      button.addEventListener('click', () => this.select(hero.id, this.side))
      heroes.appendChild(button)
      this.heroButtons.set(hero.id, button)
    }
    for (const variant of FIGURINE_SIDES) {
      const button = document.createElement('button')
      button.type = 'button'
      button.textContent = variant.toUpperCase()
      button.className = variant === 'p2' ? 'side-p2' : 'side-p1'
      button.addEventListener('click', () => this.select(this.heroId, variant))
      sides.appendChild(button)
      this.sideButtons.set(variant, button)
    }
    this.applyChrome()
  }

  private installInput(): void {
    window.addEventListener('keydown', (event) => {
      this.keys.add(event.code)
      if (this.mode === 'game') return
      if (event.code === 'Digit1') this.select('pofeng', this.side)
      if (event.code === 'Digit2') this.select('xianming', this.side)
      if (event.code === 'Digit3') this.select('dingchao', this.side)
      if (event.code === 'KeyF') this.select(this.heroId, this.side === 'p1' ? 'p2' : 'p1')
      if (event.code === 'KeyR' && this.arena && this.mode === 'figurines') {
        this.body.x = this.arena.spawn.x
        this.body.z = this.arena.spawn.z
      }
      if (event.code === 'Escape' && this.mode === 'figurines') this.exitFigurines()
    })
    window.addEventListener('keyup', (event) => this.keys.delete(event.code))
    this.canvas.addEventListener('pointerdown', (event) => {
      if (this.mode !== 'figurines') return
      this.dragging = true
      this.lastX = event.clientX
      this.lastY = event.clientY
      this.canvas.setPointerCapture(event.pointerId)
    })
    this.canvas.addEventListener('pointerup', () => {
      this.dragging = false
    })
    this.canvas.addEventListener('pointermove', (event) => {
      if (!this.dragging || this.mode !== 'figurines') return
      this.camYaw -= (event.clientX - this.lastX) * 0.005
      this.camPitch = Math.max(0.18, Math.min(1.15, this.camPitch - (event.clientY - this.lastY) * 0.004))
      this.lastX = event.clientX
      this.lastY = event.clientY
    })
    this.canvas.addEventListener(
      'wheel',
      (event) => {
        if (this.mode !== 'figurines') return
        this.camDist = Math.max(2.4, Math.min(9, this.camDist + Math.sign(event.deltaY) * 0.35))
        event.preventDefault()
      },
      { passive: false },
    )
    this.canvas.addEventListener('contextmenu', (event) => event.preventDefault())
  }

  async load(): Promise<void> {
    const [floorTex, moodTex] = await Promise.all([
      loadTexture(assetUrl('arena/arena-topdown-v2.png')),
      loadTexture(assetUrl('arena/arena-mood-v2.png')),
    ])
    this.arena = buildArena(floorTex, moodTex)
    this.scene.add(this.arena.group)
    const loader = new GLTFLoader()
    const jobs: Promise<void>[] = []
    for (const hero of FIGURINE_HEROES) {
      for (const variant of FIGURINE_SIDES) {
        const key = figurineKey(hero.id, variant)
        jobs.push(
          loader.loadAsync(assetUrl(`models/${key}.glb`)).then((gltf) => {
            fitMaterials(gltf.scene)
            const foot = plantFigurine(gltf.scene, key)
            gltf.scene.visible = false
            gltf.scene.traverse((node) => {
              node.frustumCulled = false
            })
            this.scene.add(gltf.scene)
            this.figurines.set(key, gltf.scene)
            this.feet.set(key, foot)
          }),
        )
      }
    }
    await Promise.all(jobs)
    if (this.figurines.size !== 6) {
      throw new Error(`expected six figurines, loaded ${this.figurines.size}`)
    }
    this.body.x = this.arena.spawn.x
    this.body.z = this.arena.spawn.z
    this.select(this.heroId, this.side)
    this.ready = true
    window.__PREVIEW_READY = true
    this.publish()
  }

  showError(message: string): void {
    if (!this.errorBox) return
    this.errorBox.style.display = 'grid'
    this.errorBox.textContent = message
  }

  /** Menus stay on the flat backdrop. The 3D plate shows only in a match or the figurine walk. */
  setGameBackdrop(matchVisible: boolean): void {
    this.canvas.style.visibility = this.mode !== 'game' || matchVisible ? 'visible' : 'hidden'
  }

  resize(width: number, height: number): void {
    this.renderer.setPixelRatio(1)
    this.renderer.setSize(width, height, false)
    this.canvas.style.width = '100%'
    this.canvas.style.height = '100%'
    this.showCamera.aspect = width / Math.max(1, height)
    this.showCamera.updateProjectionMatrix()
  }

  enterFigurines(): void {
    this.mode = 'figurines'
    this.camDist = 5.4
    if (this.arena) {
      this.body.x = this.arena.spawn.x
      this.body.z = this.arena.spawn.z
    }
    this.hideAll()
    this.select(this.heroId, this.side)
    this.applyChrome()
    this.publish()
  }

  exitFigurines(): void {
    if (this.mode !== 'figurines') return
    this.mode = 'game'
    this.hideAll()
    this.applyChrome()
    this.publish()
  }

  shoot(hero: string, side: FigurineSide, angle: ShotAngle): void {
    this.mode = 'shot'
    this.shotAngle = angle
    this.shotFrames = 0
    window.__SHOT_READY = false
    window.__SHOT_FRAME = 0
    this.hideAll()
    this.select(hero, side)
    this.applyShotPose()
    this.applyChrome()
    this.publish()
  }

  select(hero: string, side: FigurineSide): void {
    this.heroId = hero
    this.side = side
    if (this.mode === 'game') return
    this.hideAll()
    const next = this.figurines.get(figurineKey(hero, side)) ?? null
    this.current = next
    if (next) next.visible = true
    const spec = FIGURINE_HEROES.find((item) => item.id === hero)
    const label = `${spec?.name ?? hero} · ${side.toUpperCase()}`
    if (this.who) this.who.textContent = label
    for (const [id, button] of this.heroButtons) button.setAttribute('aria-pressed', String(id === hero))
    for (const [id, button] of this.sideButtons) button.setAttribute('aria-pressed', String(id === side))
    if (this.caption) {
      if (this.mode === 'shot') {
        this.caption.hidden = false
        this.caption.textContent = `${TITLE} · ${label} · ${ANGLE_LABEL[this.shotAngle]}`
      } else {
        this.caption.hidden = true
      }
    }
    this.publish()
  }

  presentMatch(state: MatchState, cw: number, ch: number): void {
    if (!this.ready || this.mode !== 'game') return
    const player = state.fighters.find((f) => f.team === 1)
    const cam = computeCamera(cw, ch, player)
    const view = gameplayView(cam, cw, ch)
    this.gameCamera.position.set(view.position.x, view.position.y, view.position.z)
    this.gameCamera.up.set(view.up.x, view.up.y, view.up.z)
    this.gameCamera.lookAt(view.focus.x, 0, view.focus.z)
    this.gameCamera.left = view.left
    this.gameCamera.right = view.right
    this.gameCamera.top = view.top
    this.gameCamera.bottom = view.bottom
    this.gameCamera.near = view.near
    this.gameCamera.far = view.far
    this.gameCamera.updateProjectionMatrix()
    this.hideAll()
    for (const fighter of state.fighters) {
      if (!fighter.alive) continue
      const side: FigurineSide = fighter.team === 1 ? 'p1' : 'p2'
      const mesh = this.figurines.get(figurineKey(fighter.hero, side))
      if (!mesh) continue
      const spot = gameToWorld(fighter.x, fighter.y)
      mesh.visible = true
      mesh.position.set(spot.x, this.feet.get(figurineKey(fighter.hero, side)) ?? 0, spot.z)
      mesh.rotation.set(0, matchYaw(fighter.angle), 0)
    }
    this.activeCamera = this.gameCamera
    this.renderer.toneMappingExposure = 1.12
    if (this.arena) this.arena.dust.rotation.y += 0.002
    this.renderer.render(this.scene, this.activeCamera)
  }

  frame(dt: number): void {
    if (!this.ready) return
    if (this.mode === 'figurines') this.stepWalk(dt)
    if (this.mode === 'shot') this.applyShotPose()
    if (this.mode !== 'game') {
      this.placeShowcase()
      this.updateShowCamera()
      this.activeCamera = this.showCamera
      this.renderer.toneMappingExposure = this.mode === 'shot' ? 1.05 : 1
      if (this.arena) this.arena.dust.rotation.y += dt * 0.02
      this.renderer.render(this.scene, this.activeCamera)
      if (this.mode === 'shot' && this.current?.visible) {
        this.shotFrames += 1
        window.__SHOT_FRAME = this.shotFrames
        if (this.shotFrames >= 3) window.__SHOT_READY = true
      }
    }
  }

  private stepWalk(dt: number): void {
    if (!this.current || !this.arena) return
    const forwardX = -Math.sin(this.camYaw)
    const forwardZ = -Math.cos(this.camYaw)
    const rightX = -forwardZ
    const rightZ = forwardX
    let ix = 0
    let iz = 0
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) {
      ix += forwardX
      iz += forwardZ
    }
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) {
      ix -= forwardX
      iz -= forwardZ
    }
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) {
      ix += rightX
      iz += rightZ
    }
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) {
      ix -= rightX
      iz -= rightZ
    }
    const length = Math.hypot(ix, iz)
    if (length > 0.001) {
      const speed = (this.keys.has('ShiftLeft') || this.keys.has('ShiftRight') ? 5.4 : 3.35) * dt
      const nx = this.body.x + (ix / length) * speed
      const nz = this.body.z + (iz / length) * speed
      ;[this.body.x, this.body.z] = this.tryMove(nx, nz)
      const facing = Math.atan2(-ix / length, -iz / length)
      const delta = shortest(0, facing - this.body.yaw)
      this.body.yaw += delta * Math.min(1, dt * 10)
    }
  }

  private tryMove(nx: number, nz: number): [number, number] {
    if (!this.arena) return [this.body.x, this.body.z]
    const { circles, boxes } = this.arena
    if (!blocked(nx, nz, circles, boxes)) return [nx, nz]
    if (!blocked(nx, this.body.z, circles, boxes)) return [nx, this.body.z]
    if (!blocked(this.body.x, nz, circles, boxes)) return [this.body.x, nz]
    return [this.body.x, this.body.z]
  }

  private placeShowcase(): void {
    if (!this.current) return
    const key = figurineKey(this.heroId, this.side)
    this.current.position.set(this.body.x, this.feet.get(key) ?? 0, this.body.z)
    this.current.rotation.set(0, this.body.yaw + FACE_YAW, 0)
  }

  private applyShotPose(): void {
    const table: Record<ShotAngle, number> = {
      front: Math.PI,
      back: 0,
      left: -Math.PI / 2,
      right: Math.PI / 2,
      threeq: Math.PI * 0.78,
    }
    this.camYaw = table[this.shotAngle]
    this.camPitch = this.shotAngle === 'threeq' ? 0.34 : 0.22
    this.camDist = 4.05
    this.body.x = 0
    this.body.z = 0
    this.body.yaw = 0
  }

  private updateShowCamera(): void {
    const lookY = 0.92
    const horizontal = Math.cos(this.camPitch) * this.camDist
    this.showCamera.position.set(
      this.body.x + Math.sin(this.camYaw) * horizontal,
      lookY + Math.sin(this.camPitch) * this.camDist,
      this.body.z + Math.cos(this.camYaw) * horizontal,
    )
    this.showCamera.lookAt(this.body.x, lookY, this.body.z)
  }

  private hideAll(): void {
    for (const mesh of this.figurines.values()) mesh.visible = false
    this.current = null
  }

  private applyChrome(): void {
    const showcase = this.mode !== 'game'
    const ui = document.getElementById('figurine-ui')
    if (ui) ui.style.display = showcase ? 'block' : 'none'
    if (this.panel) this.panel.hidden = this.mode === 'shot'
    const wrap = document.getElementById('wrap')
    const back = document.getElementById('vg-back-root')
    if (wrap) wrap.style.visibility = showcase ? 'hidden' : 'visible'
    if (back) back.style.visibility = this.mode === 'shot' ? 'hidden' : 'visible'
    this.canvas.style.pointerEvents = this.mode === 'figurines' ? 'auto' : 'none'
  }

  private publish(): void {
    window.__arenaPreview = {
      title: TITLE,
      mode: this.mode,
      ready: this.ready,
      select: (hero, side) => this.select(hero, side),
      shoot: (hero, side, angle) => this.shoot(hero, side, angle),
    }
  }
}
