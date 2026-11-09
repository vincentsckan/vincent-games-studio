import { HEROES } from './heroes'
import { castE, castQ, castR, tryBasicAttack } from './combat'
import { dist } from './math'
import type { Difficulty, Fighter, MatchState } from './types'

export function tickBot(
  state: MatchState,
  bot: Fighter,
  player: Fighter,
  difficulty: Difficulty,
  now: number,
): void {
  if (!bot.alive || !player.alive) return
  const def = HEROES[bot.hero]
  const range = def.range
  const d = dist(bot.x, bot.y, player.x, player.y)
  bot.angle = Math.atan2(player.y - bot.y, player.x - bot.x)

  const react = difficulty === 'hard' ? 0.85 : 0.55
  const aimX = player.x + (Math.random() - 0.5) * (1 - react) * 80
  const aimY = player.y + (Math.random() - 0.5) * (1 - react) * 80

  if (d > range * 0.85 && bot.hero !== 'pofeng') {
    /* approach handled in movement */
  } else if (d < range && Math.random() < 0.12 * react) {
    tryBasicAttack(state, bot, aimX, aimY, now)
  }

  if (bot.cds.q <= 0.1 && d < range + 120 && Math.random() < 0.018 * react) {
    castQ(state, bot, aimX, aimY, now)
  }
  if (bot.cds.e <= 0.1 && Math.random() < 0.012 * react) {
    if (bot.hero === 'pofeng' && bot.hp < bot.maxHp * 0.5) castE(state, bot, aimX, aimY, now)
    else if (bot.hero === 'xianming' && d < 120) castE(state, bot, aimX, aimY, now)
    else if (bot.hero === 'dingchao' && d < range) castE(state, bot, aimX, aimY, now)
  }
  if (bot.cds.r <= 0.1 && d < range + 80 && Math.random() < 0.008 * react) {
    castR(state, bot, aimX, aimY, now)
  }
}

export function botMoveDir(bot: Fighter, player: Fighter, difficulty: Difficulty): { x: number; y: number } {
  if (!bot.alive || !player.alive) return { x: 0, y: 0 }
  const def = HEROES[bot.hero]
  const d = dist(bot.x, bot.y, player.x, player.y)
  let x = 0
  let y = 0
  const ideal = def.range * 0.75
  if (bot.hero === 'pofeng') {
    if (d > ideal) {
      x = player.x - bot.x
      y = player.y - bot.y
    } else {
      x = Math.cos(bot.angle + Math.PI / 2)
      y = Math.sin(bot.angle + Math.PI / 2)
      if (Math.random() < 0.02) {
        x *= -1
        y *= -1
      }
    }
  } else if (d < ideal * 0.7) {
    x = bot.x - player.x
    y = bot.y - player.y
  } else if (d > ideal * 1.15) {
    x = player.x - bot.x
    y = player.y - bot.y
  } else {
    x = Math.cos(bot.angle + Math.PI / 2)
    y = Math.sin(bot.angle + Math.PI / 2)
  }
  const l = Math.hypot(x, y) || 1
  const pace = difficulty === 'hard' ? 1 : 0.82
  return { x: (x / l) * pace, y: (y / l) * pace }
}
