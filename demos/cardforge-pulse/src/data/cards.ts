export type CardKind = 'attack' | 'skill' | 'power'

export interface CardDef {
  id: string
  nameZh: string
  cost: number
  kind: CardKind
  descZh: string
  starter?: boolean
  reward?: boolean
}

export const CARD_DEFS: Record<string, CardDef> = {
  forge_hammer: {
    id: 'forge_hammer',
    nameZh: '鍛錘',
    cost: 1,
    kind: 'attack',
    descZh: '造成 {d:6} 傷害',
    starter: true,
  },
  iron_wall: {
    id: 'iron_wall',
    nameZh: '鐵壁',
    cost: 1,
    kind: 'skill',
    descZh: '獲得 {b:5} 格擋',
    starter: true,
  },
  tempo_beat: {
    id: 'tempo_beat',
    nameZh: '加速拍',
    cost: 1,
    kind: 'skill',
    descZh: '抽 {n:2} 張牌',
    starter: true,
  },
  block_pose: {
    id: 'block_pose',
    nameZh: '擋拍姿',
    cost: 1,
    kind: 'skill',
    descZh: '獲得 {b:7} 格擋；敵人本拍 -2 攻擊',
    starter: true,
  },
  pulse_thrust: {
    id: 'pulse_thrust',
    nameZh: '脈衝刺',
    cost: 2,
    kind: 'attack',
    descZh: '造成 {d:10} 傷害',
    starter: true,
  },
  chain_hammer: {
    id: 'chain_hammer',
    nameZh: '連錘',
    cost: 1,
    kind: 'attack',
    descZh: '造成 {d:4} 傷害 ×2',
    reward: true,
  },
  heavy_drop: {
    id: 'heavy_drop',
    nameZh: '重落錘',
    cost: 2,
    kind: 'attack',
    descZh: '造成 {d:14} 傷害',
    reward: true,
  },
  shard_beat: {
    id: 'shard_beat',
    nameZh: '碎拍擊',
    cost: 1,
    kind: 'attack',
    descZh: '對全體敵人 {d:5} 傷害',
    reward: true,
  },
  double_shell: {
    id: 'double_shell',
    nameZh: '雙層護',
    cost: 2,
    kind: 'skill',
    descZh: '獲得 {b:12} 格擋',
    reward: true,
  },
  furnace_latch: {
    id: 'furnace_latch',
    nameZh: '爐門閂',
    cost: 1,
    kind: 'skill',
    descZh: '獲得 {b:4} 格擋；敵人下拍若攻擊，再 +{b:4}',
    reward: true,
  },
  full_guard_beat: {
    id: 'full_guard_beat',
    nameZh: '全防一拍',
    cost: 1,
    kind: 'skill',
    descZh: '獲得 {b:8} 格擋',
    reward: true,
  },
  advance_beat: {
    id: 'advance_beat',
    nameZh: '預支節拍',
    cost: 0,
    kind: 'skill',
    descZh: '抽 {n:1}；本拍每打一張再抽 {n:1}',
    reward: true,
  },
  hand_swap: {
    id: 'hand_swap',
    nameZh: '換手',
    cost: 0,
    kind: 'skill',
    descZh: '抽 {n:2} 張；棄 {n:1} 張',
    reward: true,
  },
  fast_forward: {
    id: 'fast_forward',
    nameZh: '快進',
    cost: 0,
    kind: 'skill',
    descZh: '本拍 +{n:1} 節拍',
    reward: true,
  },
  rhythm_tidy: {
    id: 'rhythm_tidy',
    nameZh: '節奏整理',
    cost: 1,
    kind: 'skill',
    descZh: '抽 {n:3} 張牌',
    reward: true,
  },
  synergy_strike: {
    id: 'synergy_strike',
    nameZh: '共鳴擊',
    cost: 1,
    kind: 'power',
    descZh: '每打 {n:3} 張牌：對全體敵人 {d:3} 傷',
    reward: true,
  },
  double_ring: {
    id: 'double_ring',
    nameZh: '雙響',
    cost: 1,
    kind: 'attack',
    descZh: '造成 {d:7} 傷害；若上拍打過技能 +{d:4}',
    reward: true,
  },
  chain_beat: {
    id: 'chain_beat',
    nameZh: '連鎖拍',
    cost: 1,
    kind: 'attack',
    descZh: '造成 {d:8} 傷害',
    reward: true,
  },
  triple_align: {
    id: 'triple_align',
    nameZh: '三拍齊',
    cost: 2,
    kind: 'attack',
    descZh: '造成 {d:8} 傷害；若節拍未用晒 +{d:6}',
    reward: true,
  },
  overheat_hammer: {
    id: 'overheat_hammer',
    nameZh: '過熱錘',
    cost: 2,
    kind: 'attack',
    descZh: '造成 {d:12} 傷害',
    reward: true,
  },
  furnace_burst: {
    id: 'furnace_burst',
    nameZh: '爆爐',
    cost: 1,
    kind: 'power',
    descZh: '本戰 +{n:1} 節拍上限（可疊）',
    reward: true,
  },
  red_hot_beat: {
    id: 'red_hot_beat',
    nameZh: '紅熱一拍',
    cost: 1,
    kind: 'attack',
    descZh: '造成 {d:9} 傷害',
    reward: true,
  },
  coolant_fluid: {
    id: 'coolant_fluid',
    nameZh: '冷卻液',
    cost: 1,
    kind: 'skill',
    descZh: '清除減益；抽 {n:1} 張',
    reward: true,
  },
  cool_down: {
    id: 'cool_down',
    nameZh: '降溫',
    cost: 1,
    kind: 'skill',
    descZh: '移除下拍節拍／抽牌懲罰；+{b:5} 格擋',
    reward: true,
  },
  vein_rest: {
    id: 'vein_rest',
    nameZh: '靜脈',
    cost: 0,
    kind: 'skill',
    descZh: '回復 {d:4} 脈壓（僅戰鬥中）',
    reward: true,
  },
}

export function formatCardDesc(desc: string): string {
  return desc.replace(/\{([dbn]):(\d+)\}/g, (_, _k, n) => n)
}

export function starterDeckInstances(): string[] {
  return [
    'forge_hammer',
    'forge_hammer',
    'forge_hammer',
    'forge_hammer',
    'forge_hammer',
    'iron_wall',
    'iron_wall',
    'iron_wall',
    'iron_wall',
    'tempo_beat',
    'block_pose',
    'pulse_thrust',
  ]
}

/** Reward pool — copy pack priority first */
export function rewardPoolIds(): string[] {
  const priority = [
    'chain_hammer',
    'synergy_strike',
    'overheat_hammer',
    'advance_beat',
    'coolant_fluid',
    'heavy_drop',
    'double_shell',
    'furnace_latch',
    'double_ring',
    'fast_forward',
    'rhythm_tidy',
    'shard_beat',
    'furnace_burst',
    'triple_align',
    'cool_down',
  ]
  const all = Object.values(CARD_DEFS)
    .filter((c) => c.reward)
    .map((c) => c.id)
  const rest = all.filter((id) => !priority.includes(id))
  return [...priority, ...rest]
}
