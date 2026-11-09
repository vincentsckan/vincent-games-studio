#!/usr/bin/env node
/**
 * Interactive browser acceptance (local preview). Requires:
 *   npx vite preview --host 127.0.0.1 --port 4173
 *   npm run build
 */
import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const BASE = process.env.RIFT_BASE || 'http://127.0.0.1:4173/vincent-games-studio/demos/rift-arena/'
const OUT = process.env.RIFT_ARTIFACTS || '/opt/cursor/artifacts/rift-arena-acceptance'

async function clickHero(page, index) {
  const box = await page.evaluate((i) => {
    const cw = window.innerWidth
    const ch = window.innerHeight
    const cardW = Math.min(220, (cw - 80) / 3)
    const gap = 16
    const total = cardW * 3 + gap * 2
    const startX = (cw - total) / 2
    const x = startX + i * (cardW + gap) + cardW / 2
    const y = ch * 0.22 + (ch * 0.52) / 2
    return { x, y }
  }, index)
  await page.mouse.click(box.x, box.y)
}

async function clickBtn(page, fracY) {
  const vp = page.viewportSize() || { width: 1280, height: 720 }
  await page.mouse.click(vp.width / 2, vp.height * fracY)
}

async function sampleFighterPixels(page) {
  return page.evaluate(() => {
    const c = document.getElementById('game')
    const ctx = c?.getContext('2d')
    if (!c || !ctx) return { ok: false, reason: 'no canvas' }
    const w = c.width
    const h = c.height
    const samples = []
    for (let i = 0; i < 12; i++) {
      const x = Math.floor(w * (0.22 + i * 0.05))
      const y = Math.floor(h * (0.35 + (i % 3) * 0.08))
      const d = ctx.getImageData(x, y, 1, 1).data
      samples.push([d[0], d[1], d[2]])
    }
    const magentaDiscOnly = samples.every(([r, g, b]) => r > 200 && g < 120 && b > 200)
    const veryNarrowDark = samples.filter(([r, g, b]) => r < 30 && g < 30 && b < 40).length > 8
    const colorVariance =
      samples.reduce((acc, [r, g, b], _, arr) => {
        const mr = arr.reduce((s, v) => s + v[0], 0) / arr.length
        return acc + Math.abs(r - mr)
      }, 0) / samples.length
    return {
      ok: !magentaDiscOnly && !veryNarrowDark && colorVariance > 8,
      magentaDiscOnly,
      veryNarrowDark,
      colorVariance,
      samples,
    }
  })
}

const heroes = [
  { id: 'pofeng', index: 0 },
  { id: 'xianming', index: 1 },
  { id: 'dingchao', index: 2 },
]

const results = []

async function run() {
  await mkdir(OUT, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })

  for (const hero of heroes) {
    await page.goto(BASE, { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)
    await clickBtn(page, 0.86)
    await page.waitForTimeout(400)
    await clickHero(page, hero.index)
    await page.waitForTimeout(300)
    await clickBtn(page, 0.44)
    await page.waitForTimeout(2500)
    const shot = join(OUT, `combat-${hero.id}-after.png`)
    await page.screenshot({ path: shot, fullPage: false })
    const pixels = await sampleFighterPixels(page)
    results.push({ hero: hero.id, screenshot: shot, pixels, pass: pixels.ok })
  }

  await browser.close()
  const summaryPath = join(OUT, 'browser-results.json')
  await writeFile(summaryPath, JSON.stringify({ base: BASE, results }, null, 2))
  console.log(JSON.stringify(results, null, 2))
  const failed = results.filter((r) => !r.pass)
  process.exit(failed.length ? 1 : 0)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
