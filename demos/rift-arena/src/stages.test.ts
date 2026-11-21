import { describe, expect, it } from 'vitest'
import { TIER_TUNING } from './bot'
import { isStageEnterable, nextEnterableStage, recordClear } from './campaign'
import { syncWinner } from './combat'
import { createMatchState, settleMatch, startCampaignMatch, startMatch } from './game'
import { coversFor, MAPS } from './maps'
import { COVER_RECTS } from './arena'
import { RESPAWN_SEC } from './types'
import { HEROES as HERO_DEFS } from './heroes'
import { pickCampaignEnemy, stageById, STAGES, type StageDef } from './stages'
import type { HeroId } from './types'

const HEROES: HeroId[] = ['pofeng', 'xianming', 'dingchao']

function kills(stage: StageDef): number | null {
  return stage.win.kind === 'kills' ? stage.win.n : null
}

describe('20-stage framework', () => {
  it('lists twenty stages in order with the plan fields', () => {
    expect(STAGES).toHaveLength(20)
    STAGES.forEach((stage, i) => {
      expect(stage.id).toBe(i + 1)
      expect(stage.name.length).toBeGreaterThan(0)
      expect(stage.mapId.length).toBeGreaterThan(0)
      expect(stage.enemyTier in TIER_TUNING).toBe(true)
      expect(stage.heroes.length).toBeGreaterThan(0)
      expect([1, 2, 3]).toContain(stage.batch)
    })
    expect(STAGES.filter((s) => s.batch === 1).map((s) => s.id)).toEqual([1, 2, 3, 4, 5])
    expect(STAGES.filter((s) => s.batch === 2).map((s) => s.id)).toEqual([6, 7, 8, 9, 10])
    expect(STAGES.filter((s) => s.batch === 3)).toHaveLength(10)
  })

  it('uses first-to-3, first-to-5, and first-to-7 where the plan says so', () => {
    expect(kills(stageById(1))).toBe(3)
    expect(kills(stageById(2))).toBe(3)
    for (const id of [3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 16, 17, 19]) {
      expect(kills(stageById(id))).toBe(5)
    }
    expect(kills(stageById(12))).toBe(7)
    expect(kills(stageById(18))).toBe(7)
    expect(kills(stageById(20))).toBe(7)
    expect(stageById(13).win).toEqual({ kind: 'time', seconds: 240 })
  })

  it('guides 破鋒, then 弦鳴, then 定潮, and opens all three from stage 5', () => {
    expect(stageById(1).heroes).toEqual(['pofeng'])
    expect(stageById(2).heroes).toEqual(['pofeng'])
    expect(stageById(3).heroes).toEqual(['pofeng', 'xianming'])
    expect(stageById(3).guidedHero).toBe('xianming')
    expect(stageById(4).heroes).toEqual(['dingchao'])
    expect(stageById(4).guidedHero).toBe('dingchao')
    for (let id = 5; id <= 20; id++) {
      expect(stageById(id).heroes).toEqual(HEROES)
    }
  })

  it('assigns the dense milestone maps to stages 10 and 20', () => {
    expect(stageById(1).mapId).toBe('M0')
    expect(stageById(5).mapId).toBe('M1')
    expect(stageById(10).mapId).toBe('S10')
    expect(stageById(20).mapId).toBe('S20')
    expect(stageById(10).mapId).not.toBe('practice')
    expect(stageById(20).mapId).not.toBe('M1')
    expect(MAPS.S10.name).toBe('斷線戰場')
    expect(MAPS.S20.name).toBe('裂空終局')
    expect(MAPS.M0.name).toBe('入門裂隙')
    expect(MAPS.M1.name).toBe('交錯走位')
  })

  it('tiers enemies on the same three kits', () => {
    expect(stageById(1).enemyTier).toBe('T0')
    expect(stageById(1).enemy).toBe('pofeng')
    expect(stageById(2).enemyTier).toBe('T0T1')
    expect(stageById(5).enemyTier).toBe('T1')
    expect(stageById(10).enemyTier).toBe('T2T3')
    expect(stageById(20).enemyTier).toBe('T3+')
    expect(pickCampaignEnemy(stageById(14), 'xianming')).toBe('xianming')
    expect(pickCampaignEnemy(stageById(15), 'pofeng')).toBe('dingchao')
    expect(pickCampaignEnemy(stageById(15), 'dingchao')).toBe('xianming')
    for (let i = 0; i < 8; i++) {
      expect(HEROES).toContain(pickCampaignEnemy(stageById(5), 'pofeng'))
    }
  })
})

describe('playable stages 1–5', () => {
  it('unlocks the next ready stage after a clear and skips the timed stage', () => {
    let progress = { cleared: [] as number[] }
    expect(isStageEnterable(stageById(1), progress)).toBe(true)
    expect(isStageEnterable(stageById(2), progress)).toBe(false)
    progress = recordClear(progress, 1)
    expect(isStageEnterable(stageById(2), progress)).toBe(true)
    expect(isStageEnterable(stageById(3), progress)).toBe(false)
    for (let id = 1; id <= 5; id++) progress = recordClear(progress, id)
    expect(isStageEnterable(stageById(6), progress)).toBe(true)
    expect(isStageEnterable(stageById(7), progress)).toBe(false)
    for (let id = 6; id <= 9; id++) progress = recordClear(progress, id)
    expect(isStageEnterable(stageById(10), progress)).toBe(true)
    expect(isStageEnterable(stageById(11), progress)).toBe(false)
    for (let id = 10; id <= 12; id++) progress = recordClear(progress, id)
    expect(isStageEnterable(stageById(13), progress)).toBe(false)
    expect(isStageEnterable(stageById(14), progress)).toBe(true)
    expect(nextEnterableStage(12, progress)?.id).toBe(14)
    for (let id = 14; id <= 19; id++) progress = recordClear(progress, id)
    expect(isStageEnterable(stageById(20), progress)).toBe(true)
    expect(nextEnterableStage(20, progress)).toBeNull()
    expect(STAGES.filter((s) => !s.playable).map((s) => s.id)).toEqual([13])
  })

  it('starts each of stages 1–5 with that stage’s win rule, hero, and map', () => {
    const state = createMatchState()
    startCampaignMatch(state, 'pofeng', 1)
    expect(state.killsToWin).toBe(3)
    expect(state.mapId).toBe('M0')
    expect(state.botHero).toBe('pofeng')
    expect(state.enemyTier).toBe('T0')
    expect(state.mode).toBe('campaign')
    expect(state.fighters[1]!.maxHp).toBeLessThan(520)

    startCampaignMatch(state, 'xianming', 3)
    expect(state.killsToWin).toBe(5)
    expect(state.mapId).toBe('M1')
    expect(state.botHero).toBe('xianming')

    startCampaignMatch(state, 'dingchao', 4)
    expect(state.botHero).toBe('dingchao')
    expect(state.killsToWin).toBe(5)

    expect(() => startCampaignMatch(state, 'pofeng', 4)).toThrow(/does not allow/)
    expect(() => startCampaignMatch(state, 'pofeng', 13)).toThrow(/not playable/)
    expect(() => startCampaignMatch(state, 'xianming', 1)).toThrow(/does not allow/)
  })

  it('starts stages 6–12 and 14–20 on their own maps and tiers', () => {
    const state = createMatchState()
    startCampaignMatch(state, 'pofeng', 6)
    expect(state.mapId).toBe('M2')
    expect(state.killsToWin).toBe(5)
    expect(state.enemyTier).toBe('T1T2')
    expect(state.botHero).toBe('dingchao')
    expect(coversFor(state.mapId)).not.toBe(COVER_RECTS)

    startCampaignMatch(state, 'xianming', 7)
    expect(state.mapId).toBe('M3')
    expect(state.enemyTier).toBe('T2')
    expect(state.botHero).toBe('xianming')

    startCampaignMatch(state, 'dingchao', 8)
    expect(state.mapId).toBe('M4')
    expect(state.enemyTier).toBe('T2')

    startCampaignMatch(state, 'pofeng', 9)
    expect(state.mapId).toBe('M1C')
    expect(state.botHero).toBe('pofeng')
    expect(state.enemyTier).toBe('T2')

    startCampaignMatch(state, 'pofeng', 10)
    expect(state.mapId).toBe('S10')
    expect(state.killsToWin).toBe(5)
    expect(state.enemyTier).toBe('T2T3')
    expect(coversFor('S10')).not.toEqual(COVER_RECTS)
    expect(state.fighters[1]!.maxHp).toBe(Math.round(HERO_DEFS[state.botHero!].maxHp * 1.1))
    expect(state.fighters[1]!.damageMul).toBeGreaterThan(1)

    startCampaignMatch(state, 'pofeng', 11)
    expect(state.mapId).toBe('M2')
    expect(state.enemyTier).toBe('T3')
    expect(state.zones).toEqual([])

    startCampaignMatch(state, 'dingchao', 12)
    expect(state.mapId).toBe('M1')
    expect(state.killsToWin).toBe(7)

    startCampaignMatch(state, 'xianming', 14)
    expect(state.botHero).toBe('xianming')
    expect(state.mapId).toBe('M1')
    expect(state.enemyTier).toBe('T3')

    startCampaignMatch(state, 'pofeng', 15)
    expect(state.botHero).toBe('dingchao')
    expect(state.mapId).toBe('M3')

    startCampaignMatch(state, 'pofeng', 16)
    expect(state.mapId).toBe('M5')
    expect(state.zones).toEqual([])

    startCampaignMatch(state, 'pofeng', 18)
    expect(state.mapId).toBe('M4')
    expect(state.killsToWin).toBe(7)
    expect(state.enemyTier).toBe('T3')

    startCampaignMatch(state, 'pofeng', 19)
    expect(state.mapId).toBe('M4')
    expect(RESPAWN_SEC).toBe(2.2)
    expect(state.zones).toEqual([])

    startCampaignMatch(state, 'dingchao', 20)
    expect(state.mapId).toBe('S20')
    expect(state.killsToWin).toBe(7)
    expect(state.enemyTier).toBe('T3+')
    expect(coversFor('S20')).not.toEqual(COVER_RECTS)
    expect(coversFor('S20')).not.toEqual(coversFor('practice'))
    const bot = state.fighters[1]!
    expect(bot.maxHp).toBeGreaterThan(460)
    expect(bot.damageMul).toBeGreaterThan(1)
  })

  it('wins a teaching stage at 3 kills and still needs 5 in free practice', () => {
    const state = createMatchState()
    startCampaignMatch(state, 'pofeng', 1)
    state.p1Kills = 2
    syncWinner(state)
    expect(state.winner).toBeNull()
    state.p1Kills = 3
    syncWinner(state)
    expect(state.winner).toBe(1)

    startMatch(state, 'pofeng', 'normal')
    expect(state.mode).toBe('practice')
    expect(state.mapId).toBe('practice')
    expect(state.killsToWin).toBe(5)
    expect(state.enemyTier).toBeNull()
    expect(state.stageId).toBeNull()
    state.p1Kills = 4
    syncWinner(state)
    expect(state.winner).toBeNull()
    state.p1Kills = 5
    syncWinner(state)
    expect(state.winner).toBe(1)
  })

  it('records a campaign clear on a player win and leaves progress unchanged on a loss', () => {
    const won = createMatchState()
    startCampaignMatch(won, 'pofeng', 1)
    won.p1Kills = 3
    expect(settleMatch(won)).toBe(true)
    expect(won.winner).toBe(1)
    expect(won.campaignCleared).toEqual([1])
    expect(isStageEnterable(stageById(2), { cleared: won.campaignCleared })).toBe(true)

    const lost = createMatchState()
    startCampaignMatch(lost, 'pofeng', 1)
    lost.p2Kills = 3
    expect(settleMatch(lost)).toBe(true)
    expect(lost.winner).toBe(2)
    expect(lost.campaignCleared).toEqual([])
    expect(isStageEnterable(stageById(2), { cleared: lost.campaignCleared })).toBe(false)

    const practice = createMatchState()
    practice.campaignCleared = [1]
    startMatch(practice, 'dingchao', 'hard')
    practice.p1Kills = 5
    expect(settleMatch(practice)).toBe(true)
    expect(practice.campaignCleared).toEqual([1])
    expect(practice.mapId).toBe('practice')
    expect(practice.killsToWin).toBe(5)
  })
})
