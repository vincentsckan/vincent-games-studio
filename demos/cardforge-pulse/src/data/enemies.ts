import { COPY } from '../copy/zh-HK'

export type IntentKind = 'attack' | 'defend' | 'buff' | 'disrupt'

export interface IntentDef {
  kind: IntentKind
  value: number
  labelZh: string
}

export interface EnemyDef {
  id: string
  nameZh: string
  maxHp: number
  pattern: IntentDef[]
  elite?: boolean
  boss?: boolean
  flavorZh: string
}

export const ENEMIES: Record<string, EnemyDef> = {
  clutter_tick: {
    id: 'clutter_tick',
    nameZh: '雜拍蛛',
    maxHp: 28,
    flavorZh: '亂節奏小怪，意圖單純，專喺你手忙腳亂時咬一口。',
    pattern: [
      { kind: 'attack', value: 5, labelZh: '撲咬 5' },
      { kind: 'attack', value: 7, labelZh: '雜拍 7' },
      { kind: 'defend', value: 4, labelZh: '結網 +4 格擋' },
    ],
  },
  mute_shield: {
    id: 'mute_shield',
    nameZh: '靜默盾兵',
    maxHp: 34,
    flavorZh: '偏防禦，拖你輸出窗，逼你浪費節拍。',
    pattern: [
      { kind: 'defend', value: 8, labelZh: '舉盾 +8' },
      { kind: 'attack', value: 6, labelZh: '沉盾擊 6' },
      { kind: 'defend', value: 5, labelZh: '固守 +5' },
      { kind: 'attack', value: 9, labelZh: '重擊 9' },
    ],
  },
  echo_wisp: {
    id: 'echo_wisp',
    nameZh: '回聲妖',
    maxHp: 22,
    flavorZh: '先自我強化，再一記重擊——畀佢疊拍就麻煩。',
    pattern: [
      { kind: 'buff', value: 2, labelZh: '回響 +2 攻' },
      { kind: 'attack', value: 4, labelZh: '尖嘯 4' },
      { kind: 'attack', value: 6, labelZh: '殘響 6' },
    ],
  },
  two_beat_brute: {
    id: 'two_beat_brute',
    nameZh: '雙節拍獸',
    maxHp: 52,
    elite: true,
    flavorZh: '精英：攻擊同防禦交替，讀錯拍就硬食。',
    pattern: [
      { kind: 'buff', value: 3, labelZh: '蓄拍 +3 攻' },
      { kind: 'attack', value: 10, labelZh: '雙擊 10' },
      { kind: 'attack', value: 12, labelZh: '斷拍 12' },
      { kind: 'defend', value: 10, labelZh: '硬殼 +10' },
    ],
  },
  beatbreaker: {
    id: 'beatbreaker',
    nameZh: '斷拍者',
    maxHp: 72,
    boss: true,
    flavorZh: '最終節點：專拆你節奏，干擾節拍或逼你棄牌。',
    pattern: [
      { kind: 'disrupt', value: 1, labelZh: `斷拍：下回合 -1 ${COPY.hud.energy}` },
      { kind: 'attack', value: 11, labelZh: '裂鼓 11' },
      { kind: 'disrupt', value: 2, labelZh: '失序：少抽 2 張' },
      { kind: 'attack', value: 14, labelZh: '終拍 14' },
      { kind: 'defend', value: 15, labelZh: '芯殼 +15' },
    ],
  },
}

export function enemyIdsForNode(kind: string): string[] {
  switch (kind) {
    case 'battle':
      return ['clutter_tick', 'mute_shield', 'echo_wisp']
    case 'elite':
      return ['two_beat_brute']
    case 'boss':
      return ['beatbreaker']
    default:
      return ['clutter_tick']
  }
}

export function intentKindLabel(kind: IntentKind): string {
  switch (kind) {
    case 'attack':
      return COPY.hud.intentAttack
    case 'defend':
      return COPY.hud.intentDefend
    case 'buff':
      return COPY.hud.intentBuff
    case 'disrupt':
      return COPY.hud.intentDisrupt
    default:
      return COPY.hud.intent
  }
}
