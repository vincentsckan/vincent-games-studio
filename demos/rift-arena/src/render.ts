import { isAuthorTestCoverPassive } from './authorTest'
import { ARENA_BG, getCached, heroBust, heroFull, TITLE_MOOD } from './assets'
import { fighterDrawSize } from './fighterSprite'
import { COVER_RECTS } from './arena'
import { HEROES, HERO_ORDER } from './heroes'
import { clamp, dist, lerp } from './math'
import type { Fighter, GamePhase, HeroId, MatchState } from './types'
import { ARENA_H, ARENA_W, KILLS_TO_WIN } from './types'

export interface Camera {
  x: number
  y: number
  scale: number
}

export function worldToScreen(
  cam: Camera,
  wx: number,
  wy: number,
  cw: number,
  ch: number,
): { x: number; y: number } {
  const sx = (wx - cam.x) * cam.scale + cw / 2
  const sy = (wy - cam.y) * cam.scale + ch / 2
  return { x: sx, y: sy }
}

export function screenToWorld(
  cam: Camera,
  sx: number,
  sy: number,
  cw: number,
  ch: number,
): { x: number; y: number } {
  return {
    x: (sx - cw / 2) / cam.scale + cam.x,
    y: (sy - ch / 2) / cam.scale + cam.y,
  }
}

export function computeCamera(cw: number, ch: number, focus?: Fighter): Camera {
  const fitScale = Math.min(cw / ARENA_W, ch / ARENA_H) * 0.92
  const fx = focus?.x ?? ARENA_W / 2
  const fy = focus?.y ?? ARENA_H / 2

  if (!isAuthorTestCoverPassive()) {
    return { x: fx, y: fy, scale: fitScale }
  }

  const followScale = Math.max(cw / ARENA_W, ch / ARENA_H) * 1.08
  const scale = followScale
  const halfW = cw / (2 * scale)
  const halfH = ch / (2 * scale)
  let x = fx
  let y = fy
  if (halfW < ARENA_W / 2) {
    x = clamp(x, halfW, ARENA_W - halfW)
  } else {
    x = ARENA_W / 2
  }
  if (halfH < ARENA_H / 2) {
    y = clamp(y, halfH, ARENA_H - halfH)
  } else {
    y = ARENA_H / 2
  }
  return { x, y, scale }
}

function drawArena(ctx: CanvasRenderingContext2D, cam: Camera, cw: number, ch: number, shake: number): void {
  const bg = getCached(ARENA_BG)
  const ox = (Math.random() - 0.5) * shake * 12
  const oy = (Math.random() - 0.5) * shake * 12
  ctx.save()
  ctx.translate(ox, oy)
  const tl = worldToScreen(cam, 0, 0, cw, ch)
  const br = worldToScreen(cam, ARENA_W, ARENA_H, cw, ch)
  if (bg) {
    ctx.drawImage(bg, tl.x, tl.y, br.x - tl.x, br.y - tl.y)
  } else {
    ctx.fillStyle = '#1a2438'
    ctx.fillRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y)
  }
  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 3
  ctx.strokeRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y)
  for (const c of COVER_RECTS) {
    const a = worldToScreen(cam, c.x, c.y, cw, ch)
    const b = worldToScreen(cam, c.x + c.w, c.y + c.h, cw, ch)
    ctx.fillStyle = 'rgba(15,23,42,0.55)'
    ctx.fillRect(a.x, a.y, b.x - a.x, b.y - a.y)
    ctx.strokeStyle = '#64748b'
    ctx.strokeRect(a.x, a.y, b.x - a.x, b.y - a.y)
  }
  ctx.restore()
}

function drawFighter(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  cw: number,
  ch: number,
  f: Fighter,
  now: number,
): void {
  if (!f.alive) return
  const p = worldToScreen(cam, f.x, f.y, cw, ch)
  const spriteKey = heroFull(f.hero, f.team)
  const full = getCached(spriteKey)
  const r = 38 * cam.scale
  ctx.save()
  ctx.translate(p.x, p.y)
  if (full?.naturalWidth && full.naturalHeight) {
    const { w, h } = fighterDrawSize(full.naturalWidth, full.naturalHeight, cam.scale)
    ctx.globalAlpha = now < f.shieldUntil ? 0.85 : 1
    ctx.drawImage(full, -w / 2, -h, w, h)
    ctx.globalAlpha = 1
  } else {
    console.warn('[rift-arena] missing in-arena sprite', spriteKey, f.hero, 'team', f.team)
    ctx.fillStyle = f.team === 1 ? '#2dd4bf' : '#e879f9'
    ctx.beginPath()
    ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.strokeStyle = f.team === 1 ? '#5eead4' : '#f472b6'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(Math.cos(f.angle) * r, Math.sin(f.angle) * r)
  ctx.stroke()
  if (now < f.shieldUntil) {
    ctx.strokeStyle = '#cbd5e1'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(0, 0, r * 1.1, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.restore()
  const barW = 56 * cam.scale
  const bx = p.x - barW / 2
  const by = p.y - r * 1.35
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(bx, by, barW, 5 * cam.scale)
  ctx.fillStyle = f.team === 1 ? '#14b8a6' : '#db2777'
  ctx.fillRect(bx, by, barW * clamp(f.hp / f.maxHp, 0, 1), 5 * cam.scale)
}

function drawWorldFx(ctx: CanvasRenderingContext2D, cam: Camera, cw: number, ch: number, state: MatchState): void {
  for (const z of state.zones) {
    const p = worldToScreen(cam, z.x, z.y, cw, ch)
    const rad = z.radius * cam.scale
    ctx.beginPath()
    ctx.arc(p.x, p.y, rad, 0, Math.PI * 2)
    if (z.kind === 'slow') ctx.fillStyle = 'rgba(56,189,248,0.18)'
    else if (z.kind === 'tide') ctx.fillStyle = 'rgba(168,85,247,0.22)'
    else ctx.fillStyle = 'rgba(251,146,60,0.28)'
    ctx.fill()
  }
  for (const pr of state.projectiles) {
    const p = worldToScreen(cam, pr.x, pr.y, cw, ch)
    ctx.fillStyle = pr.kind === 'ult' ? '#fef08a' : '#7dd3fc'
    ctx.beginPath()
    ctx.arc(p.x, p.y, pr.radius * cam.scale, 0, Math.PI * 2)
    ctx.fill()
  }
  for (const fx of state.fx) {
    const p = worldToScreen(cam, fx.x, fx.y, cw, ch)
    const t = fx.life / fx.maxLife
    ctx.globalAlpha = lerp(0.85, 0, 1 - t)
    ctx.fillStyle = fx.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, fx.radius * cam.scale * (1 + (1 - t) * 0.5), 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  }
}

function drawHud(ctx: CanvasRenderingContext2D, cw: number, state: MatchState): void {
  ctx.save()
  ctx.font = '700 15px "Noto Sans TC", system-ui'
  ctx.fillStyle = '#e2e8f0'
  ctx.fillText(`先 ${KILLS_TO_WIN} 殺`, 18, 32)
  ctx.fillStyle = '#5eead4'
  ctx.fillText(`P1 ${state.p1Kills}`, 18, 54)
  ctx.fillStyle = '#f472b6'
  ctx.textAlign = 'right'
  ctx.fillText(`P2 ${state.p2Kills}`, cw - 18, 54)
  ctx.textAlign = 'left'
  const p1 = state.fighters.find((f) => f.team === 1)
  const p2 = state.fighters.find((f) => f.team === 2)
  if (p1 && !p1.alive) {
    const left = Math.max(0, p1.respawnAt - performance.now() / 1000)
    ctx.fillStyle = '#94a3b8'
    ctx.fillText(`重生 ${left.toFixed(1)}s`, 18, 76)
  }
  if (p2 && !p2.alive) {
    const left = Math.max(0, p2.respawnAt - performance.now() / 1000)
    ctx.fillStyle = '#94a3b8'
    ctx.textAlign = 'right'
    ctx.fillText(`Bot 重生 ${left.toFixed(1)}s`, cw - 18, 76)
  }
  ctx.restore()
}

function drawCooldowns(ctx: CanvasRenderingContext2D, cw: number, ch: number, f: Fighter, def: typeof HEROES.pofeng): void {
  const labels = ['LMB', 'Q', 'E', 'R']
  const cds = [f.cds.basic, f.cds.q, f.cds.e, f.cds.r]
  const max = [def.basicCd, def.qCd, def.eCd, def.rCd]
  const y = ch - 28
  labels.forEach((lab, i) => {
    const x = cw / 2 - 140 + i * 70
    ctx.fillStyle = 'rgba(15,23,42,0.75)'
    ctx.fillRect(x, y - 22, 58, 26)
    ctx.strokeStyle = '#475569'
    ctx.strokeRect(x, y - 22, 58, 26)
    ctx.fillStyle = '#cbd5e1'
    ctx.font = '700 12px Syne, system-ui'
    ctx.fillText(lab, x + 8, y - 6)
    if (cds[i] > 0) {
      ctx.fillStyle = '#f87171'
      ctx.font = '700 11px system-ui'
      ctx.fillText(cds[i].toFixed(1), x + 32, y - 6)
    }
    void max[i]
  })
}

export interface MenuHit {
  hero?: HeroId
  action?: 'start' | 'diffNormal' | 'diffHard' | 'rematch' | 'title'
}

export function drawOverlay(
  ctx: CanvasRenderingContext2D,
  cw: number,
  ch: number,
  phase: GamePhase,
  state: MatchState,
  hover: { x: number; y: number },
): MenuHit | null {
  ctx.fillStyle = 'rgba(8,12,22,0.82)'
  ctx.fillRect(0, 0, cw, ch)
  let hit: MenuHit | null = null

  if (phase === 'title') {
    const mood = getCached(TITLE_MOOD)
    const mw = Math.min(cw * 0.88, 720)
    const mh = mw * 0.56
    const mx = (cw - mw) / 2
    const my = ch * 0.12
    if (mood) ctx.drawImage(mood, mx, my, mw, mh)
    ctx.textAlign = 'center'
    ctx.font = '800 36px Syne, system-ui'
    ctx.fillStyle = '#f0fdfa'
    ctx.fillText('裂空擂台', cw / 2, my + mh + 48)
    ctx.font = '600 14px "Noto Sans TC"'
    ctx.fillStyle = '#94a3b8'
    ctx.fillText('Rift Arena · 1v1 技能決鬥', cw / 2, my + mh + 72)
    const bx = cw / 2 - 100
    const by = ch - 120
    const btn = pointInRect(hover.x, hover.y, bx, by, 200, 48)
    ctx.fillStyle = btn ? '#14b8a6' : '#0d9488'
    roundRect(ctx, bx, by, 200, 48, 24)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = '800 16px "Noto Sans TC"'
    ctx.fillText('開始', cw / 2, by + 31)
    if (btn) hit = { action: 'start' }
    return hit
  }

  if (phase === 'heroSelect') {
    ctx.textAlign = 'center'
    ctx.font = '800 28px Syne'
    ctx.fillStyle = '#f8fafc'
    ctx.fillText('選擇英雄', cw / 2, 56)
    const cardW = Math.min(220, (cw - 80) / 3)
    const gap = 16
    const total = cardW * 3 + gap * 2
    const startX = (cw - total) / 2
    HERO_ORDER.forEach((id, i) => {
      const def = HEROES[id]
      const x = startX + i * (cardW + gap)
      const y = ch * 0.22
      const h = ch * 0.52
      const over = pointInRect(hover.x, hover.y, x, y, cardW, h)
      ctx.fillStyle = over ? '#1e3a5f' : '#0f172a'
      roundRect(ctx, x, y, cardW, h, 16)
      ctx.fill()
      ctx.strokeStyle = state.playerHero === id ? '#5eead4' : '#334155'
      ctx.lineWidth = state.playerHero === id ? 3 : 1
      ctx.stroke()
      const bust = getCached(heroBust(id, 1))
      if (bust) {
        const bh = h * 0.55
        const bw = (bust.naturalWidth / bust.naturalHeight) * bh
        ctx.drawImage(bust, x + (cardW - bw) / 2, y + 12, bw, bh)
      }
      ctx.fillStyle = '#e2e8f0'
      ctx.font = '800 18px "Noto Sans TC"'
      ctx.fillText(def.nameZh, x + cardW / 2, y + h - 52)
      ctx.fillStyle = '#94a3b8'
      ctx.font = '600 12px "Noto Sans TC"'
      ctx.fillText(def.role, x + cardW / 2, y + h - 32)
      if (over) hit = { hero: id }
    })
    return hit
  }

  if (phase === 'difficulty') {
    ctx.textAlign = 'center'
    ctx.font = '800 26px Syne'
    ctx.fillStyle = '#f8fafc'
    ctx.fillText('對手難度', cw / 2, 80)
    const opts: { key: MenuHit['action']; label: string; y: number }[] = [
      { key: 'diffNormal', label: '一般', y: ch * 0.38 },
      { key: 'diffHard', label: '上級', y: ch * 0.52 },
    ]
    for (const o of opts) {
      const w = 200
      const x = cw / 2 - w / 2
      const over = pointInRect(hover.x, hover.y, x, o.y, w, 48)
      ctx.fillStyle = over ? '#6366f1' : '#4338ca'
      roundRect(ctx, x, o.y, w, 48, 12)
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.font = '800 16px "Noto Sans TC"'
      ctx.fillText(o.label, cw / 2, o.y + 31)
      if (over) hit = { action: o.key }
    }
    return hit
  }

  if (phase === 'result' && state.winner) {
    ctx.textAlign = 'center'
    const win = state.winner === 1
    ctx.font = '800 32px Syne'
    ctx.fillStyle = win ? '#5eead4' : '#f472b6'
    ctx.fillText(win ? '勝利！' : '落敗', cw / 2, ch * 0.32)
    ctx.font = '600 16px "Noto Sans TC"'
    ctx.fillStyle = '#cbd5e1'
    ctx.fillText(`${state.p1Kills} — ${state.p2Kills} 殺`, cw / 2, ch * 0.38)
    const btns = [
      { act: 'rematch' as const, label: '再戰', y: ch * 0.48 },
      { act: 'title' as const, label: '返回標題', y: ch * 0.58 },
    ]
    for (const b of btns) {
      const w = 200
      const x = cw / 2 - w / 2
      const over = pointInRect(hover.x, hover.y, x, b.y, w, 48)
      ctx.fillStyle = over ? '#0d9488' : '#115e59'
      roundRect(ctx, x, b.y, w, 48, 12)
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.fillText(b.label, cw / 2, b.y + 31)
      if (over) hit = { action: b.act }
    }
  }
  return hit
}

function pointInRect(px: number, py: number, x: number, y: number, w: number, h: number): boolean {
  return px >= x && px <= x + w && py >= y && py <= y + h
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export function renderMatch(
  ctx: CanvasRenderingContext2D,
  cw: number,
  ch: number,
  state: MatchState,
  now: number,
): void {
  const player = state.fighters.find((f) => f.team === 1)
  const cam = computeCamera(cw, ch, player)
  ctx.clearRect(0, 0, cw, ch)
  drawArena(ctx, cam, cw, ch, state.screenShake)
  drawWorldFx(ctx, cam, cw, ch, state)
  for (const f of state.fighters) drawFighter(ctx, cam, cw, ch, f, now)
  drawHud(ctx, cw, state)
  if (player?.alive && state.playerHero) {
    drawCooldowns(ctx, cw, ch, player, HEROES[state.playerHero])
  }
}

export { dist }
