import { initAuthorTestFromUrl, isAuthorTestCoverPassive } from './authorTest'
import { preloadAll } from './assets'
import { Game } from './game'
import { computeCamera, worldToScreen } from './render'
import { createInput } from './input'

async function boot(): Promise<void> {
  initAuthorTestFromUrl()
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

  ;(window as unknown as { __riftArenaState?: () => unknown }).__riftArenaState = () => ({
    phase: game.state.phase,
    playerHero: game.state.playerHero,
    botHero: game.state.botHero,
  })

  if (isAuthorTestCoverPassive()) {
    ;(window as unknown as { __riftHarness?: () => unknown }).__riftHarness = () => {
      const cw = canvas.width
      const ch = canvas.height
      const p1 = game.state.fighters.find((f) => f.team === 1)
      const p2 = game.state.fighters.find((f) => f.team === 2)
      const cam = computeCamera(cw, ch, p1)
      const s1 = p1 ? worldToScreen(cam, p1.x, p1.y, cw, ch) : null
      const s2 = p2 ? worldToScreen(cam, p2.x, p2.y, cw, ch) : null
      return {
        phase: game.state.phase,
        cw,
        ch,
        p1: p1 && s1 ? { x: p1.x, y: p1.y, sx: s1.x, sy: s1.y } : null,
        p2: p2 && s2 ? { x: p2.x, y: p2.y, sx: s2.x, sy: s2.y } : null,
      }
    }
  }

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
