import { ARENA_BG, getCached, heroBust, heroFull, TITLE_MOOD } from './assets'
import { fighterDrawSize } from './fighterSprite'
import type { CoverRect } from './arena'
import { isStageEnterable, nextEnterableStage } from './campaign'
import { HEROES } from './heroes'
import { coversFor } from './maps'
import { clamp, dist, lerp } from './math'
import { stageById, STAGES, tierLabel, winLabel } from './stages'
import type { Fighter, GamePhase, HeroId, MapId, MatchState } from './types'
import { ARENA_H, ARENA_W } from './types'

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
  const scale = Math.min(cw / ARENA_W, ch / ARENA_H) * 0.92
  return {
    x: focus?.x ?? ARENA_W / 2,
    y: focus?.y ?? ARENA_H / 2,
    scale,
  }
}

function drawArena(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  cw: number,
  ch: number,
  shake: number,
  covers: readonly CoverRect[],
  mapId: MapId,
): void {
  const bg = getCached(ARENA_BG)
  const ox = (Math.random() - 0.5) * shake * 12
  const oy = (Math.random() - 0.5) * shake * 12
  ctx.save()
  ctx.translate(ox, oy)
  const tl = worldToScreen(cam, 0, 0, cw, ch)
  const br = worldToScreen(cam, ARENA_W, ARENA_H, cw, ch)
  const w = br.x - tl.x
  const h = br.y - tl.y
  const practice = mapId === 'practice'
  if (practice && bg) {
    ctx.drawImage(bg, tl.x, tl.y, w, h)
  } else {
    ctx.fillStyle = '#101624'
    ctx.fillRect(tl.x, tl.y, w, h)
    const cx = tl.x + w / 2
    const cy = tl.y + h / 2
    const rad = Math.min(w, h) * 0.11
    ctx.strokeStyle = 'rgba(125,211,252,0.4)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(cx, cy, rad, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(cx, cy, rad * 0.28, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.lineWidth = 3
  if (practice) {
    ctx.strokeStyle = '#334155'
    ctx.strokeRect(tl.x, tl.y, w, h)
  } else {
    ctx.strokeStyle = '#22d3ee'
    ctx.beginPath()
    ctx.moveTo(tl.x, br.y)
    ctx.lineTo(tl.x, tl.y)
    ctx.lineTo(tl.x + w / 2, tl.y)
    ctx.moveTo(tl.x, br.y)
    ctx.lineTo(tl.x + w / 2, br.y)
    ctx.stroke()
    ctx.strokeStyle = '#e879f9'
    ctx.beginPath()
    ctx.moveTo(tl.x + w / 2, tl.y)
    ctx.lineTo(br.x, tl.y)
    ctx.lineTo(br.x, br.y)
    ctx.lineTo(tl.x + w / 2, br.y)
    ctx.stroke()
  }
  for (const c of covers) {
    const a = worldToScreen(cam, c.x, c.y, cw, ch)
    const b = worldToScreen(cam, c.x + c.w, c.y + c.h, cw, ch)
    const rift = c.kind === 'rift'
    const cyan = c.x < ARENA_W / 2
    if (rift) {
      ctx.fillStyle = cyan ? 'rgba(34,211,238,0.35)' : 'rgba(232,121,249,0.35)'
      ctx.strokeStyle = cyan ? '#22d3ee' : '#e879f9'
    } else if (practice) {
      ctx.fillStyle = 'rgba(15,23,42,0.55)'
      ctx.strokeStyle = '#64748b'
    } else {
      ctx.fillStyle = '#243044'
      ctx.strokeStyle = '#94a3b8'
    }
    ctx.fillRect(a.x, a.y, b.x - a.x, b.y - a.y)
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
  ctx.textAlign = 'left'
  if (state.mode === 'campaign' && state.stageId) {
    const stage = stageById(state.stageId)
    ctx.fillText(`第 ${stage.id} 關 ${stage.name}`, 18, 28)
    ctx.fillStyle = '#94a3b8'
    ctx.fillText(`先 ${state.killsToWin} 殺 · 對手 ${tierLabel(stage.enemyTier)}`, 18, 48)
    ctx.textAlign = 'left'
  } else {
    ctx.fillText(`先 ${state.killsToWin} 殺`, 18, 32)
  }
  const killY = state.mode === 'campaign' ? 70 : 54
  ctx.fillStyle = '#5eead4'
  ctx.fillText(`P1 ${state.p1Kills}`, 18, killY)
  ctx.fillStyle = '#f472b6'
  ctx.textAlign = 'right'
    ctx.fillText(`P2 ${state.p2Kills}`, cw - 18, killY)
  ctx.textAlign = 'left'
  const p1 = state.fighters.find((f) => f.team === 1)
  const p2 = state.fighters.find((f) => f.team === 2)
  const respawnY = killY + 22
  if (p1 && !p1.alive) {
    const left = Math.max(0, p1.respawnAt - performance.now() / 1000)
    ctx.fillStyle = '#94a3b8'
    ctx.fillText(`重生 ${left.toFixed(1)}s`, 18, respawnY)
  }
  if (p2 && !p2.alive) {
    const left = Math.max(0, p2.respawnAt - performance.now() / 1000)
    ctx.fillStyle = '#94a3b8'
    ctx.textAlign = 'right'
    ctx.fillText(`Bot 重生 ${left.toFixed(1)}s`, cw - 18, respawnY)
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
  stageId?: number
  action?: 'practice' | 'campaign' | 'diffNormal' | 'diffHard' | 'rematch' | 'title' | 'back' | 'next' | 'stages'
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
    const my = Math.min(ch * 0.06, 36)
    const mh = Math.min(mw * 0.5, Math.max(120, ch * 0.4))
    const mx = (cw - mw) / 2
    if (mood) ctx.drawImage(mood, mx, my, mw, mh)
    ctx.textAlign = 'center'
    ctx.font = '800 36px Syne, system-ui'
    ctx.fillStyle = '#f0fdfa'
    ctx.fillText('裂空擂台', cw / 2, my + mh + 48)
    ctx.font = '600 14px "Noto Sans TC"'
    ctx.fillStyle = '#94a3b8'
    ctx.fillText('Rift Arena · 1v1 技能決鬥', cw / 2, my + mh + 72)
    const practiceY = ch - 120
    if (menuButton(ctx, hover, cw / 2 - 100, practiceY, 200, 48, '自由對練', '#0d9488', '#14b8a6')) {
      hit = { action: 'practice' }
    }
    if (menuButton(ctx, hover, cw / 2 - 100, practiceY - 64, 200, 48, '戰役', '#115e59', '#0f766e')) {
      hit = { action: 'campaign' }
    }
    return hit
  }

  if (phase === 'campaign') {
    hit = drawCampaign(ctx, cw, ch, state, hover)
    return hit
  }

  if (phase === 'heroSelect') {
    const allowed = selectableHeroes(state)
    ctx.textAlign = 'center'
    ctx.font = '800 28px Syne'
    ctx.fillStyle = '#f8fafc'
    ctx.fillText('選擇英雄', cw / 2, 56)
    if (state.mode === 'campaign' && state.stageId) {
      const stage = stageById(state.stageId)
      ctx.font = '600 15px "Noto Sans TC"'
      ctx.fillStyle = '#5eead4'
      const guide = stage.guidedHero ? `本關引導：${HEROES[stage.guidedHero].nameZh}` : '三人可選'
      ctx.fillText(`第 ${stage.id} 關 ${stage.name} · ${winLabel(stage)} · ${guide}`, cw / 2, 88)
    }
    const cardW = Math.min(220, (cw - 80) / 3)
    const gap = 16
    const total = cardW * allowed.length + gap * Math.max(0, allowed.length - 1)
    const startX = (cw - total) / 2
    const y = ch * 0.22
    const h = ch * 0.52
    allowed.forEach((id, i) => {
      const def = HEROES[id]
      const x = startX + i * (cardW + gap)
      const over = pointInRect(hover.x, hover.y, x, y, cardW, h)
      const guided = state.mode === 'campaign' && state.stageId && stageById(state.stageId).guidedHero === id
      ctx.fillStyle = over ? '#1e3a5f' : '#0f172a'
      roundRect(ctx, x, y, cardW, h, 16)
      ctx.fill()
      ctx.strokeStyle = guided ? '#5eead4' : '#334155'
      ctx.lineWidth = guided ? 3 : 1
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
    if (menuButton(ctx, hover, 24, ch - 64, 120, 40, '返回', '#1e293b', '#334155')) {
      hit = { action: 'back' }
    }
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
    if (menuButton(ctx, hover, 24, ch - 64, 120, 40, '返回', '#1e293b', '#334155')) {
      hit = { action: 'back' }
    }
    return hit
  }

  if (phase === 'result' && state.winner) {
    ctx.textAlign = 'center'
    const win = state.winner === 1
    ctx.font = '800 32px Syne'
    ctx.fillStyle = win ? '#5eead4' : '#f472b6'
    ctx.fillText(win ? '勝利！' : '落敗', cw / 2, ch * 0.28)
    ctx.font = '600 16px "Noto Sans TC"'
    ctx.fillStyle = '#cbd5e1'
    const stage = state.mode === 'campaign' && state.stageId ? stageById(state.stageId) : null
    const rule = stage ? winLabel(stage) : `先 ${state.killsToWin} 殺`
    ctx.fillText(`${state.p1Kills} — ${state.p2Kills} 殺 · ${rule}`, cw / 2, ch * 0.35)
    const nextStage =
      win && stage ? nextEnterableStage(stage.id, { cleared: state.campaignCleared }) : null
    if (stage && win && !nextStage) {
      ctx.fillStyle = '#94a3b8'
      ctx.font = '600 14px "Noto Sans TC"'
      ctx.fillText(stage.id === 20 ? '裂空擂台戰役完成。' : '下一關尚未開放。', cw / 2, ch * 0.41)
    } else if (stage && win && nextStage && nextStage.id !== stage.id + 1) {
      ctx.fillStyle = '#94a3b8'
      ctx.font = '600 14px "Noto Sans TC"'
      ctx.fillText(`第 ${stage.id + 1} 關尚未開放。下一關是第 ${nextStage.id} 關。`, cw / 2, ch * 0.41)
    }
    const btns: { act: NonNullable<MenuHit['action']>; label: string; y: number }[] = []
    const nextOk = Boolean(nextStage)
    if (nextOk) btns.push({ act: 'next', label: '下一關', y: ch * 0.46 })
    btns.push({ act: 'rematch', label: '再戰', y: nextOk ? ch * 0.56 : ch * 0.48 })
    if (state.mode === 'campaign') btns.push({ act: 'stages', label: '返回關卡', y: nextOk ? ch * 0.66 : ch * 0.58 })
    else btns.push({ act: 'title', label: '返回標題', y: ch * 0.58 })
    for (const b of btns) {
      if (menuButton(ctx, hover, cw / 2 - 100, b.y, 200, 48, b.label, '#115e59', '#0d9488')) {
        hit = { action: b.act }
      }
    }
  }
  return hit
}

function selectableHeroes(state: MatchState): HeroId[] {
  if (state.mode === 'campaign' && state.stageId) return [...stageById(state.stageId).heroes]
  return ['pofeng', 'xianming', 'dingchao']
}

function drawCampaign(
  ctx: CanvasRenderingContext2D,
  cw: number,
  ch: number,
  state: MatchState,
  hover: { x: number; y: number },
): MenuHit | null {
  ctx.textAlign = 'center'
  ctx.font = '800 28px "Noto Sans TC", system-ui'
  ctx.fillStyle = '#f0fdfa'
  ctx.fillText('裂空擂台 · 戰役', cw / 2, 42)
  ctx.font = '600 13px "Noto Sans TC"'
  ctx.fillStyle = '#94a3b8'
  ctx.fillText('順序通關解鎖。第 13 關限時對決尚未開放。', cw / 2, 68)

  const cols = 5
  const gap = 10
  const top = 88
  const side = 28
  const bottom = 72
  const gridW = cw - side * 2
  const gridH = Math.max(160, ch - top - bottom)
  const cellW = (gridW - gap * (cols - 1)) / cols
  const cellH = (gridH - gap * 3) / 4
  let hit: MenuHit | null = null
  const progress = { cleared: state.campaignCleared }

  STAGES.forEach((stage, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = side + col * (cellW + gap)
    const y = top + row * (cellH + gap)
    const enterable = isStageEnterable(stage, progress)
    const cleared = progress.cleared.includes(stage.id)
    const over = enterable && pointInRect(hover.x, hover.y, x, y, cellW, cellH)
    ctx.fillStyle = over ? '#134e4a' : enterable ? '#0f172a' : '#111827'
    roundRect(ctx, x, y, cellW, cellH, 10)
    ctx.fill()
    ctx.strokeStyle = cleared ? '#5eead4' : enterable ? '#0f766e' : '#1f2937'
    ctx.lineWidth = cleared ? 2 : 1
    ctx.stroke()
    ctx.fillStyle = enterable ? '#e2e8f0' : '#64748b'
    ctx.font = '800 13px "Noto Sans TC"'
    ctx.fillText(`${stage.id} ${stage.name}`, x + cellW / 2, y + cellH * 0.38)
    ctx.font = '600 12px "Noto Sans TC"'
    ctx.fillStyle = '#94a3b8'
    const status = !stage.playable
      ? stage.win.kind === 'time'
        ? '限時未開放'
        : '未開放'
      : cleared
        ? '已通關'
        : enterable
          ? '可進入'
          : '未解鎖'
    ctx.fillText(`${winLabel(stage)} · ${status}`, x + cellW / 2, y + cellH * 0.68)
    if (over) hit = { stageId: stage.id }
  })

  if (menuButton(ctx, hover, cw / 2 - 70, ch - 56, 140, 40, '返回', '#1e293b', '#334155')) {
    hit = { action: 'back' }
  }
  return hit
}

function menuButton(
  ctx: CanvasRenderingContext2D,
  hover: { x: number; y: number },
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  fill: string,
  hoverFill: string,
): boolean {
  const over = pointInRect(hover.x, hover.y, x, y, w, h)
  ctx.fillStyle = over ? hoverFill : fill
  roundRect(ctx, x, y, w, h, 12)
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.font = '800 16px "Noto Sans TC"'
  ctx.textAlign = 'center'
  ctx.fillText(label, x + w / 2, y + h / 2 + 6)
  return over
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
  drawArena(ctx, cam, cw, ch, state.screenShake, coversFor(state.mapId), state.mapId)
  drawWorldFx(ctx, cam, cw, ch, state)
  for (const f of state.fighters) drawFighter(ctx, cam, cw, ch, f, now)
  drawHud(ctx, cw, state)
  if (player?.alive && state.playerHero) {
    drawCooldowns(ctx, cw, ch, player, HEROES[state.playerHero])
  }
}

export { dist }
