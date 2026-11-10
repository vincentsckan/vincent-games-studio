import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { heroFull } from './assets'
import type { HeroId } from './types'

const ASSET_ROOT = join(import.meta.dirname, '..', 'assets')

describe('mm-real2d-v1 on disk', () => {
  const heroes: HeroId[] = ['pofeng', 'xianming', 'dingchao']
  for (const h of heroes) {
    for (const team of [1, 2] as const) {
      it(`has ${h} full p${team} png`, () => {
        const rel = heroFull(h, team)
        const path = join(ASSET_ROOT, rel)
        expect(existsSync(path), path).toBe(true)
      })
    }
  }
})
