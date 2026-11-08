/** zh-HK 短局文案包 v1 — single source for player-facing strings. */

export const COPY = {
  title: '牌鍛脈搏',
  subtitle: '在心跳之間鍛造牌面',
  forgeName: '脈搏鍛造所',
  apprentice: '鍛徒',
  furnaceAuntie: '司爐阿姨',

  menu: {
    newRun: '開新鍛局',
    howToPlay: '點樣打',
    backCatalog: '← 返回目錄',
  },

  openLine: '今晚鍛造所失控——我要奪回主脈核。',

  hud: {
    playerHp: '脈壓',
    enemyHp: '殘響',
    energy: '節拍',
    energySpent: '節拍用晒',
    block: '格擋',
    drawPile: '牌庫',
    discard: '棄牌',
    hand: '手牌',
    intent: '意圖',
    intentAttack: '攻擊',
    intentDefend: '防禦',
    intentBuff: '強化',
    intentDisrupt: '異常',
    yourBeat: '你嘅拍',
    enemyBeat: '對方拍子',
    endTurn: '結束回合',
    endTurnConfirm: '交俾對方打拍？',
    drawFive: '抽五張',
  },

  map: {
    header: '今晚鍛道',
    battle: '雜拍戰',
    elite: '強節點',
    rest: '司爐休息',
    boss: '主脈爐心',
    pickNext: '揀下一節',
    locked: '未開通',
    continue: '繼續落去',
  },

  combat: {
    victory: '節奏到手',
    pickReward: '揀一張帶走上路',
    skipReward: '今轉唔揀',
    nextNode: '下一節',
    bossEnter: '「你的拍子，我來拆。」',
    bossDefeated: '「……主脈，還你。」',
    winLine: '主脈核到手。這一拍，我接住了。',
  },

  rest: {
    title: '司爐休息',
    heal: '穩一穩脈',
    tuneDeck: '調一調牌',
    enter: '坐低。脈亂咗就唔好硬撞。',
    afterHeal: '穩返啲。下一節小心讀意圖。',
    leave: '去啦，鍛徒。唔好斷拍。',
    lowHp: '你幾乎斷晒。飲啖氣先。',
    healAmount: 15,
  },

  death: {
    title: '斷拍',
    subtitles: [
      '節奏斷裂——鍛造所關上了。',
      '這一拍，接不住。',
      '主脈核仍在深處。',
      '手慢一拍，爐火吞咗你。',
    ],
    summaryFail: '失敗唔帶走局內牌組——重鍛就返到起點。',
    tip: '斷拍之後可以立刻重鍛。讀敵人意圖，比硬撞更緊要。',
  },

  victory: {
    title: '主脈到手',
    summary: '短鍛完成。要唔要再煉一局？',
  },

  summary: {
    thisRun: '本局',
    nodeReached: '行到第',
    nodeSuffix: '節',
    foesBroken: '擊破',
    newRun: '再開一局',
    newRunFlavor: '重鍛',
    confirmNew: '重鍛？新一局會重置局內牌組同地圖。確定？',
    seed: '種子',
    transition: ['深呼吸——下一拍，由你起。', '調校爐心…', '凝結脈牌…', '對齊節拍…'],
  },

  howTo: `牌鍛脈搏 — 點樣打
每回合有 3 節拍，抽 5 張手牌。點牌打出，再按「結束回合」。
讀敵人意圖：攻擊／防禦／強化／異常。
脈壓歸零 → 斷拍。清空路線五節 → 主脈到手。`,
} as const

export function deathSubtitle(seed: number): string {
  const pool = COPY.death.subtitles
  return pool[seed % pool.length]
}

export function summaryTransition(seed: number): string {
  return COPY.summary.transition[seed % COPY.summary.transition.length]
}
