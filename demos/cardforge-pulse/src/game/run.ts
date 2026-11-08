import { RUN_MAP } from '../data/map'
import { starterDeckInstances, rewardPoolIds, CARD_DEFS } from '../data/cards'
import { createCombat, endPlayerTurn, playCard } from '../combat/engine'
import type { RunState } from '../combat/types'
import { Rng, seedFromString } from '../rng'
import { COPY, deathSubtitle, summaryTransition } from '../copy/zh-HK'

export function newRun(seedLabel?: string): RunState {
  const seedLabelFinal = seedLabel ?? String(Date.now())
  const seed = seedFromString(seedLabelFinal)
  return {
    seed,
    seedLabel: seedLabelFinal,
    screen: 'title',
    mapNodes: RUN_MAP.map((n) => ({ ...n, cleared: false })),
    mapIndex: 0,
    deck: starterDeckInstances(),
    maxHp: 70,
    hp: 70,
    fightsWon: 0,
    overclockCarry: 0,
    ironPulseCarry: false,
    beatSynergyCarry: false,
    runWon: false,
    runLost: false,
    combat: null,
    rewardChoices: null,
    nextUid: 1,
    runStartedAt: Date.now(),
    heaviestHit: 0,
  }
}

export type RunStateExt = RunState

function rngFor(state: RunState): Rng {
  return new Rng(state.seed ^ (state.mapIndex * 997) ^ state.fightsWon)
}

export function startRun(state: RunStateExt): RunStateExt {
  const fresh = newRun(state.seedLabel) as RunStateExt
  fresh.screen = 'map'
  return fresh
}

export function enterCurrentNode(state: RunStateExt): RunStateExt {
  const node = state.mapNodes[state.mapIndex]
  if (!node || node.cleared) return state
  if (node.kind === 'rest') {
    return { ...state, screen: 'rest' }
  }
  const combat = createCombat(
    state.deck,
    node.kind,
    state.hp,
    state.maxHp,
    rngFor(state),
    state.overclockCarry,
    state.ironPulseCarry,
    state.beatSynergyCarry,
  )
  return { ...state, screen: 'combat', combat }
}

export function playCardOnRun(
  state: RunStateExt,
  handIndex: number,
  targetUid: number | null,
): RunStateExt {
  if (!state.combat) return state
  const beforeHp = state.combat.enemies.map((e) => e.hp)
  const ok = playCard(state.combat, handIndex, targetUid, rngFor(state))
  if (!ok) return state
  state.combat.enemies.forEach((e, i) => {
    const drop = beforeHp[i] - e.hp
    if (drop > state.heaviestHit) state.heaviestHit = drop
  })
  return afterCombatCheck({ ...state })
}

export function endTurnOnRun(state: RunStateExt): RunStateExt {
  if (!state.combat) return state
  endPlayerTurn(state.combat, rngFor(state))
  return afterCombatCheck({ ...state })
}

function afterCombatCheck(state: RunStateExt): RunStateExt {
  const c = state.combat
  if (!c) return state
  if (c.combatLost) {
    state.hp = 0
    return {
      ...state,
      screen: 'summary',
      runLost: true,
      combat: c,
      overclockCarry: c.overclockStacks,
      beatSynergyCarry: c.beatSynergy,
    }
  }
  if (c.combatWon) {
    state.hp = c.player.hp
    state.overclockCarry = c.overclockStacks
    state.beatSynergyCarry = c.beatSynergy
    state.fightsWon++
    const node = state.mapNodes[state.mapIndex]
    if (node?.kind === 'boss') {
      return {
        ...state,
        screen: 'summary',
        runWon: true,
        combat: null,
        mapNodes: state.mapNodes.map((n, i) => (i === state.mapIndex ? { ...n, cleared: true } : n)),
      }
    }
    const choices = pickRewards(state, 3)
    return {
      ...state,
      screen: 'reward',
      combat: null,
      rewardChoices: choices,
      mapNodes: state.mapNodes.map((n, i) => (i === state.mapIndex ? { ...n, cleared: true } : n)),
    }
  }
  return state
}

function pickRewards(state: RunStateExt, n: number): string[] {
  const pool = rewardPoolIds().filter((id) => !state.deck.includes(id) || true)
  const rng = rngFor(state)
  const picked = new Set<string>()
  const out: string[] = []
  let guard = 0
  while (out.length < n && guard < 50) {
    guard++
    const id = rng.pick(pool)
    if (picked.has(id)) continue
    picked.add(id)
    out.push(id)
  }
  return out
}

export function pickReward(state: RunStateExt, cardId: string | null): RunStateExt {
  if (cardId) state.deck = [...state.deck, cardId]
  state.rewardChoices = null
  state.mapIndex++
  if (state.mapIndex >= state.mapNodes.length) {
    return { ...state, screen: 'summary', runWon: true }
  }
  return { ...state, screen: 'map' }
}

function advanceFromRest(state: RunStateExt): RunStateExt {
  const mapNodes = state.mapNodes.map((n, i) => (i === state.mapIndex ? { ...n, cleared: true } : n))
  const nextIndex = state.mapIndex + 1
  const runWon = nextIndex >= state.mapNodes.length
  return {
    ...state,
    mapNodes,
    mapIndex: nextIndex,
    screen: runWon ? 'summary' : 'map',
    runWon: runWon || state.runWon,
  }
}

export function restWithHeal(state: RunStateExt): RunStateExt {
  const hp = Math.min(state.maxHp, state.hp + COPY.rest.healAmount)
  return advanceFromRest({ ...state, hp })
}

export function restLeave(state: RunStateExt): RunStateExt {
  return advanceFromRest(state)
}

export function summaryLines(state: RunStateExt): { title: string; body: string; subtitle: string } {
  if (state.runWon) {
    return {
      title: COPY.victory.title,
      body: COPY.victory.summary,
      subtitle: COPY.combat.winLine,
    }
  }
  return {
    title: COPY.death.title,
    body: COPY.death.summaryFail,
    subtitle: deathSubtitle(state.seed),
  }
}

export function runDurationSec(state: RunStateExt): number {
  return Math.floor((Date.now() - state.runStartedAt) / 1000)
}

export function transitionLine(state: RunStateExt): string {
  return summaryTransition(state.seed)
}

export function cardName(id: string): string {
  return CARD_DEFS[id]?.nameZh ?? id
}
