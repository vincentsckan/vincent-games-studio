import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { heroFull } from './assets'
import type { HeroId } from './types'

const ASSET_ROOT = join(import.meta.dirname, '..', 'assets')

const EXPECTED: Record<string, string> = {
  'pofeng-1': '5f9dd427bdcca0b913a7089625b0f45bc604c01c34bb5ec974f17ed331720198',
  'pofeng-2': 'dd88bb1a362aac8d1abdc8598c8db93db20263f18b561c519e6ee45a90f614e7',
  'xianming-1': '2632c2010facc92b785a684d37faf517026562324da835d2dd7b5f439e521efe',
  'xianming-2': 'b6a84f4acf1289d8744941f8a2be044f30746a3481045a50c8bf1ff30b824109',
  'dingchao-1': 'bc66014bb48320eba09d3d070d4a9c60805aa4dc979cbd82743079a56e27705f',
  'dingchao-2': '90231da6a2981d254d919c9543dcd637145385aa14ea0ef45e4b015ef37dbb8c',
}

describe('CoS accepted full-body RGBA sprites', () => {
  const heroes: HeroId[] = ['pofeng', 'xianming', 'dingchao']
  for (const h of heroes) {
    for (const team of [1, 2] as const) {
      it(`${h} p${team} sha256 matches accepted art`, () => {
        const rel = heroFull(h, team)
        const path = join(ASSET_ROOT, rel)
        const sha = createHash('sha256').update(readFileSync(path)).digest('hex')
        expect(sha).toBe(EXPECTED[`${h}-${team}`])
      })
    }
  }
})
