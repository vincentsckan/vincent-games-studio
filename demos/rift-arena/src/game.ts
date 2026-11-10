import { botMoveDir, tickBot } from './bot'
import {
  castE,
  castQ,
  castR,
  makeFighter,
  respawnIfNeeded,
  tickCooldowns,
  tickFx,
  tickProjectiles,
  tickZones,
  tryBasicAttack,
} from './combat'
import { isAuthorTestMeleeMirror, resolveBotHeroForMatch } from './authorTest'
import { HEROES } from './heroes'
import { moveWithCollision } from './arena'
import type { InputState } from './input'
import { consumeFrameInput, moveVector } from './input'
import { computeCamera, drawOverlay, renderMatch, screenToWorld, type MenuHit } from './render'
import type { Difficulty, GamePhase, HeroId, MatchState } from './types'
import { KILLS_TO_WIN } from './types'

export function createMatchState(): MatchState {
  return {
    phase: 'title',
    playerHero: null,
    botHero: null,
    difficulty: 'normal',
    p1Kills: 0,
    p2Kills: 0,
    winner: null,
    fighters: [],
    projectiles: [],
    zones: [],
    fx: [],
    screenShake: 0,
    matchStartedAt: 0,
  }
}

export function startMatch(state: MatchState, playerHero: HeroId, difficulty: Difficulty): void {
  state.playerHero = playerHero
  state.botHero = resolveBotHeroForMatch(playerHero)
  state.difficulty = difficulty
  state.p1Kills = 0
  state.p2Kills = 0
  state.winner = null
  state.projectiles = []
  state.zones = []
  state.fx = []
  state.fighters = [
    makeFighter('p1', playerHero, 1, false),
    makeFighter('p2', state.botHero, 2, true),
  ]
  if (isAuthorTestMeleeMirror() && playerHero === 'pofeng' && state.botHero === 'pofeng') {
    const p1 = state.fighters[0]!
    const p2 = state.fighters[1]!
    p2.x = p1.x + HEROES.pofeng.range * 0.82
    p2.y = p1.y
  }
  state.phase = 'match'
  state.matchStartedAt = performance.now() / 1000
}

export class Game {
  state = createMatchState()
  hover = { x: 0, y: 0 }
  private click = false

  constructor(
    private canvas: HTMLCanvasElement,
    private ctx: CanvasRenderingContext2D,
    private input: InputState,
  ) {
    canvas.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect()
      this.hover.x = ((e.clientX - r.left) / r.width) * canvas.width
      this.hover.y = ((e.clientY - r.top) / r.height) * canvas.height
    })
    canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) this.click = true
    })
  }

  tick(dt: number): void {
    const now = performance.now() / 1000
    const { state } = this
    const cw = this.canvas.width
    const ch = this.canvas.height

    if (state.phase === 'match') {
      this.tickMatch(dt, now)
      if (state.p1Kills >= KILLS_TO_WIN || state.p2Kills >= KILLS_TO_WIN) {
        state.phase = 'result'
      }
    }

    if (state.phase === 'match') {
      renderMatch(this.ctx, cw, ch, state, now)
    } else {
      this.ctx.clearRect(0, 0, cw, ch)
      const hit = drawOverlay(this.ctx, cw, ch, state.phase, state, this.hover)
      if (this.click && hit) this.handleMenu(hit)
    }

    consumeFrameInput(this.input)
    this.click = false
  }

  private handleMenu(hit: MenuHit): void {
    const { state } = this
    if (hit.hero && state.phase === 'heroSelect') {
      state.playerHero = hit.hero
      state.phase = 'difficulty'
      return
    }
    if (hit.action === 'start' && state.phase === 'title') {
      state.phase = 'heroSelect'
      return
    }
    if (hit.action === 'diffNormal' && state.phase === 'difficulty' && state.playerHero) {
      startMatch(state, state.playerHero, 'normal')
      return
    }
    if (hit.action === 'diffHard' && state.phase === 'difficulty' && state.playerHero) {
      startMatch(state, state.playerHero, 'hard')
      return
    }
    if (hit.action === 'rematch' && state.playerHero) {
      startMatch(state, state.playerHero, state.difficulty)
      return
    }
    if (hit.action === 'title') {
      Object.assign(state, createMatchState())
    }
  }

  private tickMatch(dt: number, now: number): void {
    const { state, input, canvas } = this
    const player = state.fighters.find((f) => f.team === 1)!
    const bot = state.fighters.find((f) => f.team === 2)!
    const cw = canvas.width
    const ch = canvas.height
    const cam = computeCamera(cw, ch, player)
    const world = screenToWorld(cam, input.mouseX, input.mouseY, cw, ch)
    input.mouseWorld = world

    for (const f of state.fighters) {
      tickCooldowns(f, dt)
      respawnIfNeeded(f, now)
    }

    tickBot(state, bot, player, state.difficulty, now)

    if (player.alive && now >= player.rootedUntil && now >= player.dashUntil) {
      const mv = moveVector(input)
      const def = HEROES[player.hero]
      const spd = def.moveSpeed * player.slowMul * dt
      const pos = moveWithCollision(player.x, player.y, mv.x * spd, mv.y * spd)
      player.x = pos.x
      player.y = pos.y
      player.angle = Math.atan2(world.y - player.y, world.x - player.x)
    } else if (player.alive && now < player.dashUntil) {
      const pos = moveWithCollision(player.x, player.y, player.dashVx * dt, player.dashVy * dt)
      player.x = pos.x
      player.y = pos.y
    }

    if (bot.alive && now >= bot.rootedUntil && now < bot.dashUntil) {
      const pos = moveWithCollision(bot.x, bot.y, bot.dashVx * dt, bot.dashVy * dt)
      bot.x = pos.x
      bot.y = pos.y
    } else if (bot.alive && now >= bot.rootedUntil) {
      const dir = botMoveDir(bot, player, state.difficulty)
      const def = HEROES[bot.hero]
      const spd = def.moveSpeed * bot.slowMul * dt
      const pos = moveWithCollision(bot.x, bot.y, dir.x * spd, dir.y * spd)
      bot.x = pos.x
      bot.y = pos.y
    }

    if (player.alive) {
      if (input.lmbPressed || (input.lmb && player.cds.basic <= 0)) tryBasicAttack(state, player, world.x, world.y, now)
      if (input.qPressed) castQ(state, player, world.x, world.y, now)
      if (input.ePressed) castE(state, player, world.x, world.y, now)
      if (input.rPressed) castR(state, player, world.x, world.y, now)
    }

    tickProjectiles(state, dt, now)
    tickZones(state, dt, now)
    tickFx(state, dt)
  }
}
