import { describe, it, expect, beforeEach } from 'vitest'
import {
  _resetAuthorTestForTests,
  initAuthorTestFromUrl,
  isAuthorTestCoverPassive,
  isAuthorTestMeleeMirror,
  resolveBotHeroForMatch,
} from './authorTest'
describe('authorTest melee mirror', () => {
  beforeEach(() => _resetAuthorTestForTests())

  it('default 自由對練 still uses randomBotHero (破鋒 never vs 破鋒)', () => {
    expect(isAuthorTestMeleeMirror()).toBe(false)
    for (let i = 0; i < 20; i++) {
      const bot = resolveBotHeroForMatch('pofeng')
      expect(bot).not.toBe('pofeng')
      expect(['xianming', 'dingchao']).toContain(bot)
    }
  })

  it('?authorTest=melee mirrors 破鋒 only', () => {
    initAuthorTestFromUrl('?authorTest=melee')
    expect(isAuthorTestMeleeMirror()).toBe(true)
    expect(isAuthorTestCoverPassive()).toBe(false)
    expect(resolveBotHeroForMatch('pofeng')).toBe('pofeng')
    const other = resolveBotHeroForMatch('xianming')
    expect(['pofeng', 'dingchao']).toContain(other)
  })

  it('?authorTest=cover keeps randomBotHero and passive bot flag only', () => {
    initAuthorTestFromUrl('?authorTest=cover')
    expect(isAuthorTestCoverPassive()).toBe(true)
    expect(isAuthorTestMeleeMirror()).toBe(false)
    const bot = resolveBotHeroForMatch('pofeng')
    expect(bot).not.toBe('pofeng')
  })
})
