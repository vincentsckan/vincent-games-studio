import { HERO_ORDER } from './heroes'
import type { EnemyTier, HeroId, MapId } from './types'

/**
 * 裂空擂台 v1 campaign data.
 * Names, win rules, hero gates, tiers, and batches follow the accepted 20-stage plan.
 * Stages 10 and 20 use the mm-stages-v1 layouts (S10 / S20), not the open practice arena.
 * Only stages 1–5 are enterable in this slice.
 */
export type EnemySpec = HeroId | 'mirror' | 'counter' | 'any'

export type WinRule = { kind: 'kills'; n: 3 | 5 | 7 } | { kind: 'time'; seconds: number }

export interface StageDef {
  id: number
  name: string
  batch: 1 | 2 | 3
  win: WinRule
  mapId: MapId
  enemyTier: EnemyTier
  enemy: EnemySpec
  heroes: readonly HeroId[]
  guidedHero: HeroId | null
  playable: boolean
  modifiers: readonly string[]
}

const ALL: readonly HeroId[] = ['pofeng', 'xianming', 'dingchao']
const EARLY: readonly HeroId[] = ['pofeng']
const WITH_XIAN: readonly HeroId[] = ['pofeng', 'xianming']
const DING_ONLY: readonly HeroId[] = ['dingchao']

export const STAGES: readonly StageDef[] = [
  {
    id: 1,
    name: '初入裂隙',
    batch: 1,
    win: { kind: 'kills', n: 3 },
    mapId: 'M0',
    enemyTier: 'T0',
    enemy: 'pofeng',
    heroes: EARLY,
    guidedHero: 'pofeng',
    playable: true,
    modifiers: [],
  },
  {
    id: 2,
    name: '冷卻的節奏',
    batch: 1,
    win: { kind: 'kills', n: 3 },
    mapId: 'M0',
    enemyTier: 'T0T1',
    enemy: 'pofeng',
    heroes: EARLY,
    guidedHero: 'pofeng',
    playable: true,
    modifiers: [],
  },
  {
    id: 3,
    name: '遠弦試探',
    batch: 1,
    win: { kind: 'kills', n: 5 },
    mapId: 'M1',
    enemyTier: 'T1',
    enemy: 'xianming',
    heroes: WITH_XIAN,
    guidedHero: 'xianming',
    playable: true,
    modifiers: [],
  },
  {
    id: 4,
    name: '潮勢卡住',
    batch: 1,
    win: { kind: 'kills', n: 5 },
    mapId: 'M1',
    enemyTier: 'T1',
    enemy: 'dingchao',
    heroes: DING_ONLY,
    guidedHero: 'dingchao',
    playable: true,
    modifiers: [],
  },
  {
    id: 5,
    name: '擂台初證',
    batch: 1,
    win: { kind: 'kills', n: 5 },
    mapId: 'M1',
    enemyTier: 'T1',
    enemy: 'any',
    heroes: ALL,
    guidedHero: null,
    playable: true,
    modifiers: [],
  },
  {
    id: 6,
    name: '狹路相逢',
    batch: 2,
    win: { kind: 'kills', n: 5 },
    mapId: 'M2',
    enemyTier: 'T1T2',
    enemy: 'dingchao',
    heroes: ALL,
    guidedHero: null,
    playable: false,
    modifiers: [],
  },
  {
    id: 7,
    name: '開闊風箏',
    batch: 2,
    win: { kind: 'kills', n: 5 },
    mapId: 'M3',
    enemyTier: 'T2',
    enemy: 'xianming',
    heroes: ALL,
    guidedHero: null,
    playable: false,
    modifiers: [],
  },
  {
    id: 8,
    name: '殘柱探頭',
    batch: 2,
    win: { kind: 'kills', n: 5 },
    mapId: 'M4',
    enemyTier: 'T2',
    enemy: 'any',
    heroes: ALL,
    guidedHero: null,
    playable: false,
    modifiers: [],
  },
  {
    id: 9,
    name: '裂縫緣邊',
    batch: 2,
    win: { kind: 'kills', n: 5 },
    mapId: 'M1C',
    enemyTier: 'T2',
    enemy: 'pofeng',
    heroes: ALL,
    guidedHero: null,
    playable: false,
    modifiers: [],
  },
  {
    id: 10,
    name: '中段試煉',
    batch: 2,
    win: { kind: 'kills', n: 5 },
    mapId: 'S10',
    enemyTier: 'T2T3',
    enemy: 'any',
    heroes: ALL,
    guidedHero: null,
    playable: false,
    modifiers: [],
  },
  {
    id: 11,
    name: '空窗更窄',
    batch: 3,
    win: { kind: 'kills', n: 5 },
    mapId: 'M2',
    enemyTier: 'T3',
    enemy: 'any',
    heroes: ALL,
    guidedHero: null,
    playable: false,
    modifiers: ['窄空窗'],
  },
  {
    id: 12,
    name: '七殺長局',
    batch: 3,
    win: { kind: 'kills', n: 7 },
    mapId: 'M1',
    enemyTier: 'T2T3',
    enemy: 'any',
    heroes: ALL,
    guidedHero: null,
    playable: false,
    modifiers: [],
  },
  {
    id: 13,
    name: '時限對決',
    batch: 3,
    win: { kind: 'time', seconds: 240 },
    mapId: 'M3',
    enemyTier: 'T3',
    enemy: 'xianming',
    heroes: ALL,
    guidedHero: null,
    playable: false,
    modifiers: ['限時對決'],
  },
  {
    id: 14,
    name: '鏡像高手',
    batch: 3,
    win: { kind: 'kills', n: 5 },
    mapId: 'M1',
    enemyTier: 'T3',
    enemy: 'mirror',
    heroes: ALL,
    guidedHero: null,
    playable: false,
    modifiers: ['鏡像'],
  },
  {
    id: 15,
    name: '逆風相性',
    batch: 3,
    win: { kind: 'kills', n: 5 },
    mapId: 'M3',
    enemyTier: 'T3',
    enemy: 'counter',
    heroes: ALL,
    guidedHero: null,
    playable: false,
    modifiers: ['逆風相性'],
  },
  {
    id: 16,
    name: '裂隙侵蝕',
    batch: 3,
    win: { kind: 'kills', n: 5 },
    mapId: 'M5',
    enemyTier: 'T3',
    enemy: 'any',
    heroes: ALL,
    guidedHero: null,
    playable: false,
    modifiers: ['裂隙侵蝕'],
  },
  {
    id: 17,
    name: '精英壓迫',
    batch: 3,
    win: { kind: 'kills', n: 5 },
    mapId: 'M4',
    enemyTier: 'T3',
    enemy: 'any',
    heroes: ALL,
    guidedHero: null,
    playable: false,
    modifiers: ['數值上調'],
  },
  {
    id: 18,
    name: '七殺深場',
    batch: 3,
    win: { kind: 'kills', n: 7 },
    mapId: 'M4',
    enemyTier: 'T3',
    enemy: 'any',
    heroes: ALL,
    guidedHero: null,
    playable: false,
    modifiers: [],
  },
  {
    id: 19,
    name: '多重試煉',
    batch: 3,
    win: { kind: 'kills', n: 5 },
    mapId: 'M4',
    enemyTier: 'T3',
    enemy: 'any',
    heroes: ALL,
    guidedHero: null,
    playable: false,
    modifiers: ['窄空窗', '短重生'],
  },
  {
    id: 20,
    name: '裂空之巔',
    batch: 3,
    win: { kind: 'kills', n: 7 },
    mapId: 'S20',
    enemyTier: 'T3+',
    enemy: 'any',
    heroes: ALL,
    guidedHero: null,
    playable: false,
    modifiers: ['巔峰'],
  },
]

export function stageById(id: number): StageDef {
  const stage = STAGES.find((s) => s.id === id)
  if (!stage) throw new Error(`裂空擂台 stage ${id} is missing`)
  return stage
}

export function pickCampaignEnemy(stage: StageDef, player: HeroId): HeroId {
  if (stage.enemy === 'pofeng' || stage.enemy === 'xianming' || stage.enemy === 'dingchao') {
    return stage.enemy
  }
  if (stage.enemy === 'mirror') return player
  if (stage.enemy === 'counter') {
    if (player === 'xianming') return 'pofeng'
    if (player === 'pofeng') return 'dingchao'
    return 'xianming'
  }
  const index = Math.floor(Math.random() * HERO_ORDER.length)
  return HERO_ORDER[index]!
}

export function winLabel(stage: StageDef): string {
  if (stage.win.kind === 'time') return '限時 4 分鐘'
  return `先 ${stage.win.n} 殺`
}

export function tierLabel(tier: EnemyTier): string {
  switch (tier) {
    case 'T0':
      return '教學'
    case 'T0T1':
      return '教學+'
    case 'T1':
      return '標準'
    case 'T1T2':
      return '標準+'
    case 'T2':
      return '進階'
    case 'T2T3':
      return '精英前夜'
    case 'T3':
      return '精英'
    case 'T3+':
      return '巔峰'
  }
}
