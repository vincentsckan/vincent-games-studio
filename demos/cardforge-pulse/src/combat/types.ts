import type { IntentKind } from '../data/enemies'

export interface CardInstance {
  uid: number
  defId: string
}

export interface EnemyInstance {
  uid: number
  defId: string
  hp: number
  maxHp: number
  block: number
  atkBuff: number
  patternIndex: number
  intent: { kind: IntentKind; value: number; labelZh: string }
  alive: boolean
}

export interface PlayerCombat {
  hp: number
  maxHp: number
  block: number
  energy: number
  maxEnergy: number
  /** next turn energy penalty from disrupt */
  energyPenalty: number
  /** next turn draw penalty */
  drawPenalty: number
  weakTurns: number
}

export interface CombatState {
  deck: CardInstance[]
  hand: CardInstance[]
  discard: CardInstance[]
  drawPile: CardInstance[]
  exhaust: CardInstance[]
  player: PlayerCombat
  enemies: EnemyInstance[]
  turn: number
  cardsPlayedThisTurn: number
  lastTurnHadSkill: boolean
  playedSkillThisTurn: boolean
  overclockStacks: number
  beatSynergy: boolean
  ironPulse: boolean
  echoBlockPending: boolean
  syncDrawBonus: number
  combatWon: boolean
  combatLost: boolean
  log: string[]
  bossLineShown: boolean
}

export type Screen =
  | 'title'
  | 'map'
  | 'combat'
  | 'reward'
  | 'rest'
  | 'summary'

export interface RunState {
  seed: number
  seedLabel: string
  screen: Screen
  mapNodes: { id: string; kind: string; labelZh: string; sceneZh: string; cleared: boolean }[]
  mapIndex: number
  deck: string[]
  maxHp: number
  hp: number
  fightsWon: number
  overclockCarry: number
  ironPulseCarry: boolean
  beatSynergyCarry: boolean
  runWon: boolean
  runLost: boolean
  combat: CombatState | null
  rewardChoices: string[] | null
  nextUid: number
  runStartedAt: number
  heaviestHit: number
}
