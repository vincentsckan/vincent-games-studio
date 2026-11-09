import { preloadAll } from './assets'
import { Game } from './game'
import { createInput } from './input'

async function boot(): Promise<void> {
  const canvas = document.getElementById('game') as HTMLCanvasElement
  if (!canvas) throw new Error('canvas missing')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2d context missing')

  function resize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.floor(window.innerWidth * dpr)
    canvas.height = Math.floor(window.innerHeight * dpr)
    ctx.setTransform(1, 0, 0, 1, 0, 0)
  }
  resize()
  window.addEventListener('resize', resize)

  try {
    await preloadAll()
  } catch (e) {
    console.warn('[rift-arena] asset preload partial', e)
  }

  const input = createInput(canvas)
  const game = new Game(canvas, ctx, input)

  let last = performance.now()
  function frame(now: number): void {
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    game.tick(dt)
    requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}

boot().catch((err) => console.error('[rift-arena] boot failed', err))
