import type { HeroDef, HeroId } from './types'

export const HEROES: Record<HeroId, HeroDef> = {
  pofeng: {
    id: 'pofeng',
    nameZh: '破鋒',
    nameEn: 'Pòfēng',
    role: '近戰突擊',
    maxHp: 520,
    moveSpeed: 265,
    basicCd: 0.45,
    qCd: 5.5,
    eCd: 8,
    rCd: 18,
    basicDamage: 38,
    range: 72,
  },
  xianming: {
    id: 'xianming',
    nameZh: '弦鳴',
    nameEn: 'Xiánmíng',
    role: '遠程消耗',
    maxHp: 420,
    moveSpeed: 245,
    basicCd: 0.55,
    qCd: 6,
    eCd: 7,
    rCd: 16,
    basicDamage: 32,
    range: 520,
  },
  dingchao: {
    id: 'dingchao',
    nameZh: '定潮',
    nameEn: 'Dìngcháo',
    role: '控制',
    maxHp: 460,
    moveSpeed: 235,
    basicCd: 0.6,
    qCd: 7,
    eCd: 9,
    rCd: 20,
    basicDamage: 28,
    range: 380,
  },
}

export const HERO_ORDER: HeroId[] = ['pofeng', 'xianming', 'dingchao']

export function randomBotHero(exclude?: HeroId): HeroId {
  const pool = HERO_ORDER.filter((h) => h !== exclude)
  return pool[Math.floor(Math.random() * pool.length)]!
}
