export type HeroId = 'pofeng' | 'xianming' | 'dingchao'

export type GamePhase =
  | 'title'
  | 'heroSelect'
  | 'difficulty'
  | 'match'
  | 'result'

export type Difficulty = 'normal' | 'hard'

export interface Vec2 {
  x: number
  y: number
}

export interface HeroDef {
  id: HeroId
  nameZh: string
  nameEn: string
  role: string
  maxHp: number
  moveSpeed: number
  basicCd: number
  qCd: number
  eCd: number
  rCd: number
  basicDamage: number
  range: number
}

export interface Cooldowns {
  basic: number
  q: number
  e: number
  r: number
}

export interface Fighter {
  id: string
  hero: HeroId
  team: 1 | 2
  x: number
  y: number
  vx: number
  vy: number
  angle: number
  hp: number
  maxHp: number
  alive: boolean
  respawnAt: number
  cds: Cooldowns
  shieldUntil: number
  rootedUntil: number
  slowMul: number
  slowUntil: number
  dashUntil: number
  dashVx: number
  dashVy: number
  isBot: boolean
  kills: number
  chargeR: number
}

export interface Projectile {
  id: number
  owner: string
  team: 1 | 2
  x: number
  y: number
  vx: number
  vy: number
  damage: number
  radius: number
  life: number
  kind: 'basic' | 'line' | 'ult' | 'orb'
  pierce: number
}

export interface Zone {
  id: number
  owner: string
  team: 1 | 2
  x: number
  y: number
  radius: number
  life: number
  kind: 'slow' | 'rootField' | 'slam' | 'tide'
  damage?: number
}

export interface MatchState {
  phase: GamePhase
  playerHero: HeroId | null
  botHero: HeroId | null
  difficulty: Difficulty
  p1Kills: number
  p2Kills: number
  winner: 1 | 2 | null
  fighters: Fighter[]
  projectiles: Projectile[]
  zones: Zone[]
  fx: FxBurst[]
  screenShake: number
  matchStartedAt: number
}

export interface FxBurst {
  x: number
  y: number
  life: number
  maxLife: number
  color: string
  radius: number
}

export const KILLS_TO_WIN = 5
export const RESPAWN_SEC = 2.2
export const ARENA_W = 1400
export const ARENA_H = 1050
