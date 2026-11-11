import { preloadAll } from './assets'
import { Game } from './game'
import { createInput } from './input'
import { previewBus } from './previewBus'
import { setExternalMatchScene } from './render'
import { Stage1Preview, type ShotAngle } from './scene3d/preview'
import type { FigurineSide } from './scene3d/layout'
import { TITLE } from './scene3d/layout'

if (TITLE.codePointAt(2) !== 0x64c2) {
  throw new Error('title glyph drifted')
}

declare global {
  interface Window {
    __rift?: {
      phase: string
      stageId: number | null
      mode: string
      playerHero: string | null
    }
  }
}

function bufferSize(): { w: number; h: number } {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  return {
    w: Math.floor(window.innerWidth * dpr),
    h: Math.floor(window.innerHeight * dpr),
  }
}

async function boot(): Promise<void> {
  const canvas = document.getElementById('game') as HTMLCanvasElement
  const view = document.getElementById('view3d') as HTMLCanvasElement
  if (!canvas || !view) throw new Error('canvas missing')
  const context = canvas.getContext('2d')
  if (!context) throw new Error('2d context missing')
  const ctx: CanvasRenderingContext2D = context

  const params = new URLSearchParams(location.search)
  const shotHero = params.get('shot')
  const shotSide = (params.get('side') === 'p2' ? 'p2' : 'p1') as FigurineSide
  const shotAngle = (params.get('angle') || 'front') as ShotAngle
  const preview = new Stage1Preview(view)

  function resize(): void {
    const { w, h } = bufferSize()
    canvas.width = w
    canvas.height = h
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    preview.resize(w, h)
  }
  resize()
  window.addEventListener('resize', resize)

  const assets = preloadAll()
  const models = preview.load()
  try {
    await Promise.all([assets, models])
  } catch (error) {
    console.error('[rift-arena] preview load failed', error)
    preview.showError(`立體公仔未能載入。請用本機預覽伺服器開啟。 ${error instanceof Error ? error.message : ''}`)
    try {
      await assets
    } catch (assetError) {
      console.warn('[rift-arena] asset preload partial', assetError)
    }
  }

  if (shotHero) {
    preview.shoot(shotHero, shotSide, shotAngle)
    let last = performance.now()
    const frame = (now: number): void => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      preview.frame(dt)
      requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
    return
  }

  const input = createInput(canvas)
  const game = new Game(canvas, ctx, input)
  window.__rift = {
    get phase() {
      return game.state.phase
    },
    get stageId() {
      return game.state.stageId
    },
    get mode() {
      return game.state.mode
    },
    get playerHero() {
      return game.state.playerHero
    },
  }

  let last = performance.now()
  function frame(now: number): void {
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    if (previewBus.request === 'figurines') {
      previewBus.request = null
      preview.enterFigurines()
    }
    if (preview.mode === 'figurines' || preview.mode === 'shot') {
      setExternalMatchScene(false)
      preview.setGameBackdrop(false)
      preview.frame(dt)
      requestAnimationFrame(frame)
      return
    }
    const matchVisible = preview.ready && game.state.phase === 'match'
    preview.setGameBackdrop(matchVisible)
    setExternalMatchScene(matchVisible)
    game.tick(dt)
    if (preview.ready && game.state.phase === 'match') {
      preview.presentMatch(game.state, canvas.width, canvas.height)
    }
    requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}

boot().catch((err) => console.error('[rift-arena] boot failed', err))
