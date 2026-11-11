/**
 * Local author evidence for the stage-1 3D preview.
 * Does not deploy and does not open a pull request.
 */
import { chromium } from 'playwright'
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const outDir = process.env.ARTIFACT_DIR || '/cursor/stores/self/rift-arena-stage1-3d-preview'
const base = process.env.RIFT_PREVIEW_URL || 'http://127.0.0.1:5173/vincent-games-studio/demos/rift-arena/'
const forbidden = new Set([
  '3410db7458ef3213098394868d78909e356aae6ff3335ace62a665f467918a6b',
  '6669fcfa0b8a6ff45c1c967d9e19a4fc7f7aa5fbce99fb91e3b5c5763755b711',
  '7b7bed57154dda8b5644ce7294e217d4f42387893ca880a117b4bf9c812711f1',
  '84491c4131fb903ad805666f491f62bd67338aaeb02cc2d767fc65faf6497da7',
])

mkdirSync(outDir, { recursive: true })

function git(args) {
  const result = spawnSync('git', args, { cwd: repo, encoding: 'utf8' })
  if (result.status !== 0) throw new Error(result.stderr || `git ${args.join(' ')} failed`)
  return result.stdout.trim()
}

function sha256(file) {
  return createHash('sha256').update(readFileSync(file)).digest('hex')
}

function assertPng(file) {
  const buf = readFileSync(file)
  if (buf.toString('ascii', 1, 4) !== 'PNG') throw new Error(`${file} is not a PNG`)
  const width = buf.readUInt32BE(16)
  const height = buf.readUInt32BE(20)
  const bitDepth = buf[24]
  const colorType = buf[25]
  if (width !== 1280 || height !== 720 || bitDepth !== 8 || colorType !== 2) {
    throw new Error(`${file} is ${width}x${height} depth ${bitDepth} color ${colorType}, expected 1280x720 RGB`)
  }
  const digest = sha256(file)
  if (forbidden.has(digest)) throw new Error(`${file} reused a forbidden still hash ${digest}`)
  return digest
}

function assertNotBlank(file) {
  const raw = spawnSync(
    'ffmpeg',
    ['-v', 'error', '-i', file, '-f', 'rawvideo', '-pix_fmt', 'rgb24', 'pipe:1'],
    { maxBuffer: 32 * 1024 * 1024 },
  )
  if (raw.status !== 0) throw new Error(`ffmpeg read failed for ${file}`)
  const buf = raw.stdout
  let sum = 0
  let sum2 = 0
  let n = 0
  for (let i = 0; i < buf.length; i += 48) {
    const y = buf[i] * 0.2126 + buf[i + 1] * 0.7152 + buf[i + 2] * 0.0722
    sum += y
    sum2 += y * y
    n += 1
  }
  const mean = sum / n
  const variance = sum2 / n - mean * mean
  if (variance < 12) throw new Error(`${path.basename(file)} looks blank (variance ${variance.toFixed(1)})`)
}

function trimLeadingBlack(src, dest) {
  const fps = 8
  const raw = spawnSync(
    'ffmpeg',
    ['-v', 'error', '-i', src, '-t', '8', '-vf', `fps=${fps},scale=160:90`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', 'pipe:1'],
    { maxBuffer: 64 * 1024 * 1024 },
  )
  if (raw.status !== 0) throw new Error('failed to scan video lead-in')
  const frameBytes = 160 * 90 * 3
  const frames = Math.floor(raw.stdout.length / frameBytes)
  let cut = 0
  for (let i = 0; i < frames; i += 1) {
    const start = i * frameBytes
    let sum = 0
    let n = 0
    for (let p = start; p < start + frameBytes; p += 12) {
      sum += raw.stdout[p] * 0.2126 + raw.stdout[p + 1] * 0.7152 + raw.stdout[p + 2] * 0.0722
      n += 1
    }
    if (sum / n > 8) {
      cut = i
      break
    }
  }
  const ss = Math.max(0, cut / fps - 0.12)
  console.log(`trim leading black: frame ${cut}/${frames}, ss=${ss.toFixed(3)}`)
  const encoded = spawnSync(
    'ffmpeg',
    [
      '-y',
      '-ss',
      ss.toFixed(3),
      '-i',
      src,
      '-an',
      '-c:v',
      'libvpx-vp9',
      '-b:v',
      '3M',
      '-deadline',
      'good',
      '-cpu-used',
      '4',
      dest,
    ],
    { stdio: 'inherit' },
  )
  if (encoded.status !== 0) throw new Error('video trim encode failed')
}

const heroes = ['pofeng', 'xianming', 'dingchao']
const sides = ['p1', 'p2']
const angles = [
  ['front', 'front'],
  ['back', 'back'],
  ['left', 'left'],
  ['right', 'right'],
  ['threeq', 'three-quarter'],
]

const launch = {
  headless: true,
  channel: 'chrome',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'],
}

async function hold(page, code, ms) {
  await page.keyboard.down(code)
  await page.waitForTimeout(ms)
  await page.keyboard.up(code)
}

const browser = await chromium.launch(launch)
const official = []

try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 })
  page.on('pageerror', (error) => console.error('PAGE', error.message))
  const failed = []
  page.on('response', (res) => {
    if (res.status() >= 400 && !res.url().includes('fonts.')) failed.push(`${res.status()} ${res.url()}`)
  })

  await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForFunction(() => window.__PREVIEW_READY === true && window.__rift, null, { timeout: 180000 })
  const titleCheck = await page.evaluate(() => {
    const title = window.__arenaPreview.title
    return { title, point: title.codePointAt(2) }
  })
  if (titleCheck.point !== 0x64c2) throw new Error(`title glyph drifted: ${titleCheck.title}`)
  await page.waitForTimeout(400)

  const practiceY = 720 - 120
  await page.mouse.click(640, practiceY - 64 + 24)
  await page.waitForFunction(() => window.__rift.phase === 'campaign')
  const stage1 = await page.evaluate(() => {
    const canvas = document.getElementById('game')
    const cw = canvas.width
    const ch = canvas.height
    const cols = 5
    const gap = 10
    const top = 88
    const side = 28
    const bottom = 72
    const gridW = cw - side * 2
    const gridH = Math.max(160, ch - top - bottom)
    const cellW = (gridW - gap * (cols - 1)) / cols
    const cellH = (gridH - gap * 3) / 4
    return { x: side + cellW / 2, y: top + cellH / 2 }
  })
  await page.mouse.click(stage1.x, stage1.y)
  await page.waitForFunction(() => window.__rift.phase === 'heroSelect' && window.__rift.stageId === 1)
  await page.waitForTimeout(350)
  const heroSelect = path.join(outDir, 'hero-select.png')
  await page.screenshot({ path: heroSelect })
  official.push(heroSelect)

  const hero = await page.evaluate(() => {
    const canvas = document.getElementById('game')
    const ch = canvas.height
    return { x: canvas.width / 2, y: ch * 0.22 + (ch * 0.52) / 2 }
  })
  await page.mouse.click(hero.x, hero.y)
  await page.waitForFunction(() => window.__rift.phase === 'match' && window.__rift.playerHero === 'pofeng')
  await page.waitForTimeout(500)
  await hold(page, 'KeyW', 500)
  await hold(page, 'KeyD', 350)
  await page.mouse.move(980, 280)
  await page.waitForTimeout(250)
  const stageShot = path.join(outDir, 'stage1-gameplay.png')
  await page.screenshot({ path: stageShot })
  official.push(stageShot)

  for (const heroId of heroes) {
    for (const side of sides) {
      for (const [angle, fileAngle] of angles) {
        await page.evaluate(
          ([id, variant, view]) => {
            window.__SHOT_READY = false
            window.__arenaPreview.shoot(id, variant, view)
          },
          [heroId, side, angle],
        )
        await page.waitForFunction(() => window.__SHOT_READY === true && window.__SHOT_FRAME >= 3, null, {
          timeout: 20000,
        })
        await page.waitForTimeout(180)
        const file = path.join(outDir, `rift-${heroId}-${side}-${fileAngle}.png`)
        await page.screenshot({ path: file })
        official.push(file)
      }
    }
  }
  if (failed.length) console.warn('non-font http failures', failed)
  await page.close()

  const videoDir = path.join(tmpdir(), 'rift-stage1-video')
  mkdirSync(videoDir, { recursive: true })
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
    recordVideo: { dir: videoDir, size: { width: 1280, height: 720 } },
  })
  const live = await context.newPage()
  live.on('pageerror', (error) => console.error('PAGE', error.message))
  await live.goto(base, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await live.waitForFunction(() => window.__PREVIEW_READY === true && window.__rift, null, { timeout: 180000 })
  await live.waitForTimeout(700)
  await live.mouse.click(108, 44)
  await live.waitForFunction(() => window.__arenaPreview.mode === 'figurines')
  await live.waitForTimeout(400)
  await hold(live, 'KeyW', 800)
  await hold(live, 'KeyD', 600)
  await live.keyboard.press('Digit2')
  await live.waitForTimeout(350)
  await hold(live, 'KeyW', 650)
  await live.keyboard.press('KeyF')
  await live.waitForTimeout(300)
  await hold(live, 'KeyA', 600)
  await live.keyboard.press('Digit3')
  await live.waitForTimeout(350)
  await hold(live, 'KeyD', 600)
  await live.keyboard.press('KeyF')
  await live.waitForTimeout(300)
  await hold(live, 'KeyS', 550)
  await live.keyboard.press('Digit1')
  await live.waitForTimeout(250)
  await live.keyboard.press('KeyF')
  await live.waitForTimeout(300)
  await hold(live, 'KeyW', 650)
  await live.mouse.move(480, 420)
  await live.mouse.down()
  await live.mouse.move(760, 300, { steps: 14 })
  await live.mouse.up()
  await live.waitForTimeout(350)
  await live.keyboard.press('Escape')
  await live.waitForFunction(() => window.__arenaPreview.mode === 'game')
  await live.waitForTimeout(400)
  await live.mouse.click(640, practiceY - 64 + 24)
  await live.waitForFunction(() => window.__rift.phase === 'campaign')
  await live.waitForTimeout(250)
  await live.mouse.click(stage1.x, stage1.y)
  await live.waitForFunction(() => window.__rift.phase === 'heroSelect' && window.__rift.stageId === 1)
  await live.waitForTimeout(600)
  await live.mouse.click(hero.x, hero.y)
  await live.waitForFunction(() => window.__rift.phase === 'match')
  await live.waitForTimeout(400)
  await hold(live, 'KeyW', 700)
  await hold(live, 'KeyD', 500)
  await hold(live, 'KeyS', 400)
  await live.mouse.move(1000, 260)
  await live.mouse.down()
  await live.waitForTimeout(200)
  await live.mouse.up()
  await live.waitForTimeout(500)
  const recorded = live.video()
  await context.close()
  const rawVideo = path.join(outDir, 'rift-stage1-preview-raw.webm')
  await recorded.saveAs(rawVideo)
  const video = path.join(outDir, 'rift-stage1-3d-preview.webm')
  trimLeadingBlack(rawVideo, video)
  rmSync(rawVideo, { force: true })
  official.push(video)
} finally {
  await browser.close()
}

const lines = []
for (const file of official) {
  if (file.endsWith('.png')) {
    assertNotBlank(file)
    const digest = assertPng(file)
    lines.push(`${digest}  ${path.basename(file)}`)
  } else {
    const digest = sha256(file)
    lines.push(`${digest}  ${path.basename(file)}`)
  }
}

const head = git(['rev-parse', 'HEAD'])
const parent = git(['rev-parse', 'HEAD^'])
const branch = git(['rev-parse', '--abbrev-ref', 'HEAD'])
const status = git(['status', '--porcelain'])
if (status) throw new Error(`working tree is not clean:\n${status}`)
const hashes = [
  '# 裂空擂台 stage-1 3D preview — author self-test',
  '',
  `Branch: ${branch}`,
  `HEAD: ${head}`,
  `Parent: ${parent}`,
  `Compare: https://github.com/vincentsckan/vincent-games-studio/compare/main...${branch}`,
  '',
  'Official stills are 1280×720 RGB PNGs. The video is the trimmed WebM.',
  'This is author self-test evidence, not a visual-review pass.',
  '',
  ...lines,
  '',
].join('\n')
const hashFile = path.join(outDir, 'HASHES.md')
writeFileSync(hashFile, hashes)
console.log(hashes)
