import { HEROES } from './heroes'
import { moveWithCollision, SPAWN_P1, SPAWN_P2, lineHitsCover, type CoverRect } from './arena'
import { coversFor } from './maps'
import { angleBetween, dist, norm } from './math'
import type { Fighter, HeroId, MatchState, Projectile, Zone } from './types'
import { RESPAWN_SEC } from './types'

let nextProjId = 1
let nextZoneId = 1

function emptyCds() {
  return { basic: 0, q: 0, e: 0, r: 0 }
}

export function makeFighter(
  id: string,
  hero: HeroId,
  team: 1 | 2,
  isBot: boolean,
): Fighter {
  const def = HEROES[hero]
  const spawn = team === 1 ? SPAWN_P1 : SPAWN_P2
  return {
    id,
    hero,
    team,
    x: spawn.x,
    y: spawn.y,
    vx: 0,
    vy: 0,
    angle: team === 1 ? 0 : Math.PI,
    hp: def.maxHp,
    maxHp: def.maxHp,
    alive: true,
    respawnAt: 0,
    cds: emptyCds(),
    shieldUntil: 0,
    rootedUntil: 0,
    slowMul: 1,
    slowUntil: 0,
    dashUntil: 0,
    dashVx: 0,
    dashVy: 0,
    isBot,
    kills: 0,
    chargeR: 0,
    damageMul: 1,
  }
}

function activeCovers(state: MatchState): readonly CoverRect[] {
  return coversFor(state.mapId)
}

export function syncWinner(state: MatchState): void {
  if (state.p1Kills >= state.killsToWin) state.winner = 1
  else if (state.p2Kills >= state.killsToWin) state.winner = 2
}

export function tickCooldowns(f: Fighter, dt: number, mul = 1): void {
  f.cds.basic = Math.max(0, f.cds.basic - dt * mul)
  f.cds.q = Math.max(0, f.cds.q - dt * mul)
  f.cds.e = Math.max(0, f.cds.e - dt * mul)
  f.cds.r = Math.max(0, f.cds.r - dt * mul)
  const now = performance.now() / 1000
  if (now > f.slowUntil) f.slowMul = 1
  if (now > f.rootedUntil && f.dashUntil < now) {
    /* ok */
  }
}

function foe(state: MatchState, f: Fighter): Fighter | undefined {
  return state.fighters.find((x) => x.team !== f.team)
}

function applyDamage(
  state: MatchState,
  target: Fighter,
  amount: number,
  attacker: Fighter,
  now: number,
): void {
  if (!target.alive) return
  amount *= attacker.damageMul
  if (now < target.shieldUntil) amount *= 0.35
  target.hp -= amount
  if (target.hp <= 0) {
    killFighter(state, target, attacker, now)
  }
}

function killFighter(state: MatchState, victim: Fighter, killer: Fighter, now: number): void {
  victim.alive = false
  victim.hp = 0
  victim.respawnAt = now + RESPAWN_SEC
  killer.kills += 1
  if (killer.team === 1) state.p1Kills += 1
  else state.p2Kills += 1
  state.fx.push({
    x: victim.x,
    y: victim.y,
    life: 0.55,
    maxLife: 0.55,
    color: victim.team === 1 ? '#5eead4' : '#f472b6',
    radius: 48,
  })
  state.screenShake = 0.35
  syncWinner(state)
}

export function respawnIfNeeded(f: Fighter, now: number): void {
  if (f.alive || now < f.respawnAt) return
  const def = HEROES[f.hero]
  const spawn = f.team === 1 ? SPAWN_P1 : SPAWN_P2
  f.x = spawn.x
  f.y = spawn.y
  f.hp = def.maxHp
  f.alive = true
  f.cds = emptyCds()
  f.shieldUntil = 0
  f.rootedUntil = 0
  f.slowMul = 1
  f.dashUntil = 0
}

function spawnProj(p: Omit<Projectile, 'id'>): Projectile {
  return { ...p, id: nextProjId++ }
}

function spawnZone(z: Omit<Zone, 'id'>): Zone {
  return { ...z, id: nextZoneId++ }
}

export function tryBasicAttack(state: MatchState, f: Fighter, aimX: number, aimY: number, now: number): void {
  const def = HEROES[f.hero]
  if (!f.alive || f.cds.basic > 0) return
  f.angle = angleBetween(f.x, f.y, aimX, aimY)
  f.cds.basic = def.basicCd

  if (f.hero === 'pofeng') {
    const enemy = foe(state, f)
    if (enemy?.alive && dist(f.x, f.y, enemy.x, enemy.y) < def.range + 20) {
      const facing = Math.abs(f.angle - angleBetween(f.x, f.y, enemy.x, enemy.y)) < 0.9
      if (facing) applyDamage(state, enemy, def.basicDamage, f, now)
    }
    state.fx.push({ x: f.x + Math.cos(f.angle) * 40, y: f.y + Math.sin(f.angle) * 40, life: 0.2, maxLife: 0.2, color: '#fb923c', radius: 28 })
    return
  }

  const n = norm(aimX - f.x, aimY - f.y)
  const speed = f.hero === 'xianming' ? 720 : 560
  state.projectiles.push(
    spawnProj({
      owner: f.id,
      team: f.team,
      x: f.x + n.x * 28,
      y: f.y + n.y * 28,
      vx: n.x * speed,
      vy: n.y * speed,
      damage: def.basicDamage,
      radius: 10,
      life: 1.4,
      kind: 'basic',
      pierce: 0,
    }),
  )
}

export function castQ(state: MatchState, f: Fighter, aimX: number, aimY: number, now: number): void {
  const def = HEROES[f.hero]
  if (!f.alive || f.cds.q > 0) return
  f.cds.q = def.qCd
  f.angle = angleBetween(f.x, f.y, aimX, aimY)

  if (f.hero === 'pofeng') {
    const n = norm(aimX - f.x, aimY - f.y)
    f.dashUntil = now + 0.22
    f.dashVx = n.x * 520
    f.dashVy = n.y * 520
    const enemy = foe(state, f)
    if (enemy?.alive && dist(f.x, f.y, enemy.x, enemy.y) < 200) {
      applyDamage(state, enemy, 55, f, now)
    }
    return
  }
  if (f.hero === 'xianming') {
    const n = norm(aimX - f.x, aimY - f.y)
    const len = 680
    const ex = f.x + n.x * len
    const ey = f.y + n.y * len
    if (!lineHitsCover(f.x, f.y, ex, ey, activeCovers(state))) {
      for (const t of state.fighters) {
        if (t.team === f.team || !t.alive) continue
        if (segmentNearPlayer(f.x, f.y, ex, ey, t.x, t.y, 36)) {
          applyDamage(state, t, 75, f, now)
        }
      }
    }
    state.fx.push({ x: (f.x + ex) / 2, y: (f.y + ey) / 2, life: 0.35, maxLife: 0.35, color: '#38bdf8', radius: 60 })
    return
  }
  state.zones.push(
    spawnZone({
      owner: f.id,
      team: f.team,
      x: aimX,
      y: aimY,
      radius: 110,
      life: 3.5,
      kind: 'slow',
    }),
  )
}

export function castE(state: MatchState, f: Fighter, aimX: number, aimY: number, now: number): void {
  const def = HEROES[f.hero]
  if (!f.alive || f.cds.e > 0) return
  f.cds.e = def.eCd

  if (f.hero === 'pofeng') {
    f.shieldUntil = now + 2.8
    state.fx.push({ x: f.x, y: f.y, life: 0.5, maxLife: 0.5, color: '#94a3b8', radius: 40 })
    return
  }
  if (f.hero === 'xianming') {
    const n = norm(aimX - f.x, aimY - f.y)
    const back = moveWithCollision(f.x - n.x * 140, f.y - n.y * 140, 0, 0, activeCovers(state))
    f.x = back.x
    f.y = back.y
    const n2 = norm(aimX - f.x, aimY - f.y)
    state.projectiles.push(
      spawnProj({
        owner: f.id,
        team: f.team,
        x: f.x,
        y: f.y,
        vx: n2.x * 640,
        vy: n2.y * 640,
        damage: 42,
        radius: 8,
        life: 1,
        kind: 'basic',
        pierce: 0,
      }),
    )
    return
  }
  const enemy = foe(state, f)
  if (enemy?.alive && dist(f.x, f.y, enemy.x, enemy.y) < def.range + 40) {
    enemy.rootedUntil = now + 1.6
    applyDamage(state, enemy, 35, f, now)
  }
}

export function castR(state: MatchState, f: Fighter, aimX: number, aimY: number, now: number): void {
  const def = HEROES[f.hero]
  if (!f.alive || f.cds.r > 0) return
  f.cds.r = def.rCd
  f.angle = angleBetween(f.x, f.y, aimX, aimY)

  if (f.hero === 'pofeng') {
    state.zones.push(
      spawnZone({
        owner: f.id,
        team: f.team,
        x: aimX,
        y: aimY,
        radius: 130,
        life: 0.35,
        kind: 'slam',
        damage: 120,
      }),
    )
    state.screenShake = 0.5
    return
  }
  if (f.hero === 'xianming') {
    f.chargeR = 0
    const n = norm(aimX - f.x, aimY - f.y)
    state.projectiles.push(
      spawnProj({
        owner: f.id,
        team: f.team,
        x: f.x + n.x * 32,
        y: f.y + n.y * 32,
        vx: n.x * 520,
        vy: n.y * 520,
        damage: 145,
        radius: 18,
        life: 2.2,
        kind: 'ult',
        pierce: 1,
      }),
    )
    return
  }
  state.zones.push(
    spawnZone({
      owner: f.id,
      team: f.team,
      x: aimX,
      y: aimY,
      radius: 150,
      life: 2.8,
      kind: 'tide',
      damage: 55,
    }),
  )
}

function segmentNearPlayer(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  px: number,
  py: number,
  r: number,
): boolean {
  const dx = x2 - x1
  const dy = y2 - y1
  const len2 = dx * dx + dy * dy
  if (len2 < 1e-6) return dist(x1, y1, px, py) <= r
  let t = ((px - x1) * dx + (py - y1) * dy) / len2
  t = Math.max(0, Math.min(1, t))
  return dist(x1 + t * dx, y1 + t * dy, px, py) <= r
}

export function tickProjectiles(state: MatchState, dt: number, now: number): void {
  const keep: Projectile[] = []
  for (const p of state.projectiles) {
    const nx = p.x + p.vx * dt
    const ny = p.y + p.vy * dt
    if (lineHitsCover(p.x, p.y, nx, ny, activeCovers(state))) continue
    p.x = nx
    p.y = ny
    p.life -= dt
    if (p.life <= 0) continue
    let hit = false
    for (const t of state.fighters) {
      if (t.team === p.team || !t.alive) continue
      if (dist(p.x, p.y, t.x, t.y) < p.radius + 26) {
        const owner = state.fighters.find((f) => f.id === p.owner)
        if (owner) applyDamage(state, t, p.damage, owner, now)
        hit = true
        if (p.pierce <= 0) break
        p.pierce -= 1
      }
    }
    if (!hit) keep.push(p)
    else if (p.pierce > 0) {
      p.pierce -= 1
      keep.push(p)
    }
  }
  state.projectiles = keep
}

export function tickZones(state: MatchState, dt: number, now: number): void {
  const keep: Zone[] = []
  for (const z of state.zones) {
    z.life -= dt
    if (z.life <= 0) continue
  for (const t of state.fighters) {
      if (t.team === z.team || !t.alive) continue
      if (dist(z.x, z.y, t.x, t.y) > z.radius + 20) continue
      const owner = state.fighters.find((f) => f.id === z.owner)
      if (z.kind === 'slow') {
        t.slowMul = 0.55
        t.slowUntil = now + 0.25
      }
      if (z.kind === 'tide') {
        t.rootedUntil = Math.max(t.rootedUntil, now + 0.35)
        t.slowMul = 0.4
        t.slowUntil = now + 0.4
        if (owner && z.damage) applyDamage(state, t, z.damage * dt * 0.9, owner, now)
      }
      if (z.kind === 'slam' && z.damage && owner) {
        applyDamage(state, t, z.damage, owner, now)
        z.life = 0
      }
    }
    if (z.life > 0) keep.push(z)
  }
  state.zones = keep
}

export function tickFx(state: MatchState, dt: number): void {
  state.fx = state.fx.filter((f) => {
    f.life -= dt
    return f.life > 0
  })
  state.screenShake = Math.max(0, state.screenShake - dt * 1.2)
}
