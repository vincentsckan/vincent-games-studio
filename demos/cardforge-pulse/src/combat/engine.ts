import { CARD_DEFS } from '../data/cards'
import { ENEMIES, enemyIdsForNode, type IntentDef } from '../data/enemies'
import { COPY } from '../copy/zh-HK'
import { Rng } from '../rng'
import type { CardInstance, CombatState, EnemyInstance, PlayerCombat } from './types'

let cardUid = 1
let enemyUid = 1

export function resetUidCounters(start = 1): void {
  cardUid = start
  enemyUid = start
}

function mkCard(defId: string): CardInstance {
  return { uid: cardUid++, defId }
}

function shuffleDrawPile(pile: CardInstance[], rng: Rng): CardInstance[] {
  return rng.shuffle(pile)
}

function intentAt(defId: string, index: number): IntentDef {
  const def = ENEMIES[defId]
  return def.pattern[index % def.pattern.length]
}

function refreshIntent(e: EnemyInstance): void {
  e.intent = intentAt(e.defId, e.patternIndex)
}

function spawnEnemy(defId: string): EnemyInstance {
  const def = ENEMIES[defId]
  const e: EnemyInstance = {
    uid: enemyUid++,
    defId,
    hp: def.maxHp,
    maxHp: def.maxHp,
    block: 0,
    atkBuff: 0,
    patternIndex: 0,
    intent: intentAt(defId, 0),
    alive: true,
  }
  return e
}

export function createCombat(
  deckDefIds: string[],
  nodeKind: string,
  playerHp: number,
  maxHp: number,
  rng: Rng,
  overclockCarry: number,
  ironPulseCarry: boolean,
  beatSynergyCarry: boolean,
): CombatState {
  resetUidCounters(100)
  const drawPile = shuffleDrawPile(deckDefIds.map((id) => mkCard(id)), rng)
  const enemies: EnemyInstance[] = []
  const pool = enemyIdsForNode(nodeKind)
  const pick = rng.pick(pool)
  enemies.push(spawnEnemy(pick))
  if (nodeKind === 'battle' && rng.float() > 0.55) {
    const second = rng.pick(pool.filter((x) => x !== pick))
    if (second) enemies.push(spawnEnemy(second))
  }

  const player: PlayerCombat = {
    hp: playerHp,
    maxHp,
    block: 0,
    energy: 3 + overclockCarry,
    maxEnergy: 3 + overclockCarry,
    energyPenalty: 0,
    drawPenalty: 0,
    weakTurns: 0,
  }

  if (ironPulseCarry) player.block += 3

  const state: CombatState = {
    deck: deckDefIds.map((id) => mkCard(id)),
    hand: [],
    discard: [],
    drawPile,
    exhaust: [],
    player,
    enemies,
    turn: 0,
    cardsPlayedThisTurn: 0,
    lastTurnHadSkill: false,
    playedSkillThisTurn: false,
    overclockStacks: overclockCarry,
    beatSynergy: beatSynergyCarry,
    ironPulse: ironPulseCarry,
    echoBlockPending: false,
    syncDrawBonus: 0,
    combatWon: false,
    combatLost: false,
    log: [`進入${COPY.forgeName}`],
    bossLineShown: false,
  }

  startPlayerTurn(state, rng)
  return state
}

function drawCards(state: CombatState, n: number, rng: Rng): void {
  for (let i = 0; i < n; i++) {
    if (state.drawPile.length === 0) {
      if (state.discard.length === 0) break
      state.drawPile = shuffleDrawPile(state.discard, rng)
      state.discard = []
    }
    const c = state.drawPile.pop()
    if (c) state.hand.push(c)
  }
}

export function startPlayerTurn(state: CombatState, rng: Rng): void {
  state.turn++
  state.player.block = 0
  state.enemies.forEach((e) => {
    if (e.alive) e.block = 0
  })

  const penE = state.player.energyPenalty
  state.player.energyPenalty = 0
  state.player.energy = Math.max(0, state.player.maxEnergy - penE)

  const drawN = Math.max(0, 5 - state.player.drawPenalty)
  state.player.drawPenalty = 0
  state.hand.forEach((c) => state.discard.push(c))
  state.hand = []
  drawCards(state, drawN, rng)

  state.cardsPlayedThisTurn = 0
  state.playedSkillThisTurn = false
  state.syncDrawBonus = 0
  if (state.echoBlockPending) {
    const anyAttack = state.enemies.some((e) => e.alive && e.intent.kind === 'attack')
    if (anyAttack) state.player.block += 4
    state.echoBlockPending = false
  }

  const boss = state.enemies.find((e) => e.alive && ENEMIES[e.defId].boss)
  if (boss && state.turn === 1 && !state.bossLineShown) {
    state.bossLineShown = true
    state.log.push(COPY.combat.bossEnter)
  }

  state.log.push(`— 第 ${state.turn} 拍 —`)
}

function applyDamageToEnemy(e: EnemyInstance, dmg: number, log: string[]): number {
  if (!e.alive || dmg <= 0) return 0
  let rem = dmg
  if (e.block > 0) {
    const absorbed = Math.min(e.block, rem)
    e.block -= absorbed
    rem -= absorbed
  }
  if (rem > 0) {
    e.hp -= rem
    if (e.hp <= 0) {
      e.hp = 0
      e.alive = false
      const def = ENEMIES[e.defId]
      log.push(`${def.nameZh} 殘響歸零`)
      if (def.boss) log.push(COPY.combat.bossDefeated)
    }
  }
  return dmg
}

function applyDamageToPlayer(p: PlayerCombat, dmg: number): number {
  if (dmg <= 0) return 0
  let rem = dmg
  if (p.block > 0) {
    const absorbed = Math.min(p.block, rem)
    p.block -= absorbed
    rem -= absorbed
  }
  if (rem > 0) p.hp -= rem
  return dmg
}

function livingEnemies(state: CombatState): EnemyInstance[] {
  return state.enemies.filter((e) => e.alive)
}

function checkCombatEnd(state: CombatState): void {
  if (state.player.hp <= 0) {
    state.player.hp = 0
    state.combatLost = true
    state.log.push(COPY.death.title)
    return
  }
  if (livingEnemies(state).length === 0) {
    state.combatWon = true
    state.log.push(COPY.combat.victory)
  }
}

export function canPlayCard(state: CombatState, handIndex: number): boolean {
  if (state.combatWon || state.combatLost) return false
  const card = state.hand[handIndex]
  if (!card) return false
  const def = CARD_DEFS[card.defId]
  return state.player.energy >= def.cost
}

export function playCard(
  state: CombatState,
  handIndex: number,
  targetEnemyUid: number | null,
  rng: Rng,
): boolean {
  if (!canPlayCard(state, handIndex)) return false
  const card = state.hand[handIndex]
  const def = CARD_DEFS[card.defId]
  state.player.energy -= def.cost
  state.hand.splice(handIndex, 1)
  state.discard.push(card)
  state.cardsPlayedThisTurn++
  if (def.kind === 'skill') state.playedSkillThisTurn = true

  const target =
    targetEnemyUid != null
      ? state.enemies.find((e) => e.uid === targetEnemyUid && e.alive)
      : livingEnemies(state)[0]

  switch (card.defId) {
    case 'forge_hammer':
      if (target) applyDamageToEnemy(target, 6, state.log)
      break
    case 'iron_wall':
      state.player.block += 5
      break
    case 'tempo_beat':
      drawCards(state, 2, rng)
      break
    case 'block_pose':
      state.player.block += 7
      livingEnemies(state).forEach((e) => {
        if (e.intent.kind === 'attack')
          e.intent = { ...e.intent, value: Math.max(0, e.intent.value - 2) }
      })
      break
    case 'pulse_thrust':
      if (target) applyDamageToEnemy(target, 10, state.log)
      break
    case 'chain_hammer':
      if (target) {
        applyDamageToEnemy(target, 4, state.log)
        applyDamageToEnemy(target, 4, state.log)
      }
      break
    case 'heavy_drop':
    case 'overheat_hammer':
      if (target) applyDamageToEnemy(target, card.defId === 'heavy_drop' ? 14 : 12, state.log)
      break
    case 'shard_beat':
      livingEnemies(state).forEach((e) => applyDamageToEnemy(e, 5, state.log))
      break
    case 'double_shell':
      state.player.block += 12
      break
    case 'furnace_latch':
      state.player.block += 4
      state.echoBlockPending = true
      break
    case 'full_guard_beat':
      state.player.block += 8
      break
    case 'advance_beat':
      drawCards(state, 1, rng)
      state.syncDrawBonus = 1
      break
    case 'hand_swap':
      drawCards(state, 2, rng)
      if (state.hand.length > 0) state.discard.push(state.hand.pop()!)
      break
    case 'fast_forward':
      state.player.energy++
      break
    case 'rhythm_tidy':
      drawCards(state, 3, rng)
      break
    case 'synergy_strike':
      state.beatSynergy = true
      break
    case 'double_ring': {
      let dmg = 7
      if (state.lastTurnHadSkill) dmg += 4
      if (target) applyDamageToEnemy(target, dmg, state.log)
      break
    }
    case 'chain_beat':
      if (target) applyDamageToEnemy(target, 8, state.log)
      break
    case 'triple_align': {
      let dmg = 8
      if (state.player.energy > 0) dmg += 6
      if (target) applyDamageToEnemy(target, dmg, state.log)
      break
    }
    case 'furnace_burst':
      state.overclockStacks++
      state.player.maxEnergy++
      state.player.energy++
      break
    case 'red_hot_beat':
      if (target) applyDamageToEnemy(target, 9, state.log)
      break
    case 'coolant_fluid':
      state.player.energyPenalty = 0
      state.player.drawPenalty = 0
      state.player.weakTurns = 0
      drawCards(state, 1, rng)
      break
    case 'cool_down':
      state.player.energyPenalty = 0
      state.player.drawPenalty = 0
      state.player.block += 5
      break
    case 'vein_rest':
      state.player.hp = Math.min(state.player.maxHp, state.player.hp + 4)
      break
    default:
      if (target) applyDamageToEnemy(target, 6, state.log)
  }

  state.log.push(`打出「${def.nameZh}」`)

  if (state.syncDrawBonus > 0) drawCards(state, state.syncDrawBonus, rng)

  if (state.beatSynergy && state.cardsPlayedThisTurn % 3 === 0) {
    livingEnemies(state).forEach((e) => applyDamageToEnemy(e, 3, state.log))
    state.log.push('共鳴擊觸發')
  }

  checkCombatEnd(state)
  return true
}

export function endPlayerTurn(state: CombatState, rng: Rng): void {
  if (state.combatWon || state.combatLost) return

  state.lastTurnHadSkill = state.playedSkillThisTurn
  state.hand.forEach((c) => state.discard.push(c))
  state.hand = []

  for (const e of state.enemies) {
    if (!e.alive) continue
    const intent = e.intent
    switch (intent.kind) {
      case 'attack': {
        const dmg = Math.max(0, intent.value + e.atkBuff)
        applyDamageToPlayer(state.player, dmg)
        state.log.push(`${ENEMIES[e.defId].nameZh}：${intent.labelZh} → ${dmg}`)
        break
      }
      case 'defend':
        e.block += intent.value
        state.log.push(`${ENEMIES[e.defId].nameZh}：${intent.labelZh}`)
        break
      case 'buff':
        e.atkBuff += intent.value
        state.log.push(`${ENEMIES[e.defId].nameZh}：${intent.labelZh}`)
        break
      case 'disrupt':
        if (intent.labelZh.includes(COPY.hud.energy)) state.player.energyPenalty += intent.value
        else state.player.drawPenalty += intent.value
        state.log.push(`${ENEMIES[e.defId].nameZh}：${intent.labelZh}`)
        break
    }
    e.patternIndex++
    refreshIntent(e)
  }

  checkCombatEnd(state)
  if (!state.combatWon && !state.combatLost) startPlayerTurn(state, rng)
}

export { drawCards, livingEnemies }
