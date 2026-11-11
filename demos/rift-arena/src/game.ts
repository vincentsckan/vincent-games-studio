import { botMoveDir, tickBot, TIER_TUNING } from './bot'
import { loadProgress, nextEnterableStage, recordClear, saveProgress, isStageEnterable } from './campaign'
import {
  castE,
  castQ,
  castR,
  makeFighter,
  respawnIfNeeded,
  syncWinner,
  tickCooldowns,
  tickFx,
  tickProjectiles,
  tickZones,
  tryBasicAttack,
} from './combat'
import { HEROES, randomBotHero } from './heroes'
import { coversFor } from './maps'
import { moveWithCollision } from './arena'
import type { InputState } from './input'
import { consumeFrameInput, moveVector } from './input'
import { previewBus } from './previewBus'
import { computeCamera, drawOverlay, renderMatch, screenToWorld, type MenuHit } from './render'
import { pickCampaignEnemy, stageById } from './stages'
import type { Difficulty, GamePhase, HeroId, MatchState } from './types'
import { KILLS_TO_WIN } from './types'

export function createMatchState(): MatchState {
  return {
    phase: 'title',
    mode: 'practice',
    stageId: null,
    mapId: 'practice',
    killsToWin: KILLS_TO_WIN,
    enemyTier: null,
    campaignCleared: loadProgress().cleared,
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
  state.mode = 'practice'
  state.stageId = null
  state.mapId = 'practice'
  state.killsToWin = KILLS_TO_WIN
  state.enemyTier = null
  state.playerHero = playerHero
  state.botHero = randomBotHero(playerHero)
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
  state.phase = 'match'
  state.matchStartedAt = performance.now() / 1000
}

/** Returns true when the match has reached its kill rule and should show the result. */
export function settleMatch(state: MatchState): boolean {
  if (state.p1Kills < state.killsToWin && state.p2Kills < state.killsToWin) return false
  syncWinner(state)
  if (state.mode === 'campaign' && state.winner === 1 && state.stageId) {
    state.campaignCleared = recordClear({ cleared: state.campaignCleared }, state.stageId).cleared
    saveProgress({ cleared: state.campaignCleared })
  }
  return true
}

export function startCampaignMatch(state: MatchState, playerHero: HeroId, stageId: number): void {
  const stage = stageById(stageId)
  if (!stage.playable || stage.win.kind !== 'kills') {
    throw new Error(`裂空擂台 stage ${stageId} is not playable`)
  }
  coversFor(stage.mapId)
  if (!stage.heroes.includes(playerHero)) {
    throw new Error(`裂空擂台 stage ${stageId} does not allow ${playerHero}`)
  }
  const tune = TIER_TUNING[stage.enemyTier]
  const botHero = pickCampaignEnemy(stage, playerHero)
  state.mode = 'campaign'
  state.stageId = stage.id
  state.mapId = stage.mapId
  state.killsToWin = stage.win.n
  state.enemyTier = stage.enemyTier
  state.playerHero = playerHero
  state.botHero = botHero
  state.difficulty = 'normal'
  state.p1Kills = 0
  state.p2Kills = 0
  state.winner = null
  state.projectiles = []
  state.zones = []
  state.fx = []
  const bot = makeFighter('p2', botHero, 2, true)
  bot.maxHp = Math.round(HEROES[botHero].maxHp * tune.hpMul)
  bot.hp = bot.maxHp
  bot.damageMul = tune.damageMul
  state.fighters = [makeFighter('p1', playerHero, 1, false), bot]
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
      if (settleMatch(state)) state.phase = 'result'
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
    if (hit.action === 'figurines' && state.phase === 'title') {
      previewBus.request = 'figurines'
      return
    }
    if (hit.action === 'campaign' && state.phase === 'title') {
      state.phase = 'campaign'
      return
    }
    if (hit.action === 'practice' && state.phase === 'title') {
      state.mode = 'practice'
      state.stageId = null
      state.mapId = 'practice'
      state.playerHero = null
      state.phase = 'heroSelect'
      return
    }
    if (hit.stageId && state.phase === 'campaign') {
      const stage = stageById(hit.stageId)
      if (!isStageEnterable(stage, { cleared: state.campaignCleared })) return
      state.mode = 'campaign'
      state.stageId = stage.id
      state.mapId = stage.mapId
      state.playerHero = null
      state.phase = 'heroSelect'
      return
    }
    if (hit.hero && state.phase === 'heroSelect') {
      if (state.mode === 'campaign' && state.stageId) {
        const stage = stageById(state.stageId)
        if (!stage.heroes.includes(hit.hero)) return
        startCampaignMatch(state, hit.hero, stage.id)
        return
      }
      state.playerHero = hit.hero
      state.mode = 'practice'
      state.phase = 'difficulty'
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
    if (hit.action === 'next' && state.mode === 'campaign' && state.stageId && state.winner === 1) {
      const next = nextEnterableStage(state.stageId, { cleared: state.campaignCleared })
      if (next) {
        state.stageId = next.id
        state.playerHero = null
        state.winner = null
        state.phase = 'heroSelect'
      }
      return
    }
    if (hit.action === 'rematch' && state.playerHero) {
      if (state.mode === 'campaign' && state.stageId) startCampaignMatch(state, state.playerHero, state.stageId)
      else startMatch(state, state.playerHero, state.difficulty)
      return
    }
    if (hit.action === 'back') {
      state.phase = backPhase(state.phase, state.mode)
      return
    }
    if (hit.action === 'stages') {
      state.phase = 'campaign'
      state.winner = null
      return
    }
    if (hit.action === 'title') {
      const cleared = state.campaignCleared
      Object.assign(state, createMatchState())
      state.campaignCleared = cleared.length ? cleared : state.campaignCleared
    }
  }

  private tickMatch(dt: number, now: number): void {
    const { state, input, canvas } = this
    const player = state.fighters.find((f) => f.team === 1)!
    const bot = state.fighters.find((f) => f.team === 2)!
    const covers = coversFor(state.mapId)
    const cw = canvas.width
    const ch = canvas.height
    const cam = computeCamera(cw, ch, player)
    const world = screenToWorld(cam, input.mouseX, input.mouseY, cw, ch)
    input.mouseWorld = world

    for (const f of state.fighters) {
      tickCooldowns(f, dt)
      respawnIfNeeded(f, now)
    }

    tickBot(state, bot, player, now)

    if (player.alive && now >= player.rootedUntil && now >= player.dashUntil) {
      const mv = moveVector(input)
      const def = HEROES[player.hero]
      const spd = def.moveSpeed * player.slowMul * dt
      const pos = moveWithCollision(player.x, player.y, mv.x * spd, mv.y * spd, covers)
      player.x = pos.x
      player.y = pos.y
      player.angle = Math.atan2(world.y - player.y, world.x - player.x)
    } else if (player.alive && now < player.dashUntil) {
      const pos = moveWithCollision(player.x, player.y, player.dashVx * dt, player.dashVy * dt, covers)
      player.x = pos.x
      player.y = pos.y
    }

    if (bot.alive && now >= bot.rootedUntil && now < bot.dashUntil) {
      const pos = moveWithCollision(bot.x, bot.y, bot.dashVx * dt, bot.dashVy * dt, covers)
      bot.x = pos.x
      bot.y = pos.y
    } else if (bot.alive && now >= bot.rootedUntil) {
      const dir = botMoveDir(bot, player, state.difficulty, state.enemyTier)
      const def = HEROES[bot.hero]
      const spd = def.moveSpeed * bot.slowMul * dt
      const pos = moveWithCollision(bot.x, bot.y, dir.x * spd, dir.y * spd, covers)
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

function backPhase(phase: GamePhase, mode: MatchState['mode']): GamePhase {
  if (phase === 'campaign') return 'title'
  if (phase === 'heroSelect') return mode === 'campaign' ? 'campaign' : 'title'
  if (phase === 'difficulty') return 'heroSelect'
  return 'title'
}
