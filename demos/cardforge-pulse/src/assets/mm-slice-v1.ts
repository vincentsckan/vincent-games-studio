import paletteJson from '../../assets/mm-slice-v1/palette/palette.json'
import frameCommon from '../../assets/mm-slice-v1/frames/frame-common.png'
import frameUncommon from '../../assets/mm-slice-v1/frames/frame-uncommon.png'
import frameRare from '../../assets/mm-slice-v1/frames/frame-rare.png'
import intentAttack from '../../assets/mm-slice-v1/icons/intent-attack.png'
import intentDefend from '../../assets/mm-slice-v1/icons/intent-defend.png'
import intentBuff from '../../assets/mm-slice-v1/icons/intent-buff.png'
import enemyClutter from '../../assets/mm-slice-v1/enemies/enemy-clutter-tick.png'
import enemyMute from '../../assets/mm-slice-v1/enemies/enemy-mute-shield.png'
import enemyEcho from '../../assets/mm-slice-v1/enemies/enemy-echo-wisp.png'
import enemyBeatbreaker from '../../assets/mm-slice-v1/enemies/enemy-beatbreaker.png'
import type { IntentKind } from '../data/enemies'
import type { CardDef } from '../data/cards'

export const PALETTE = paletteJson.colors as Record<string, string>

export const FRAMES = {
  common: frameCommon,
  uncommon: frameUncommon,
  rare: frameRare,
} as const

export function frameForCard(def: CardDef): string {
  if (def.kind === 'power') return FRAMES.rare
  if (def.reward) return FRAMES.uncommon
  return FRAMES.common
}

export function intentIcon(kind: IntentKind): string {
  switch (kind) {
    case 'attack':
      return intentAttack
    case 'defend':
      return intentDefend
    case 'buff':
    case 'disrupt':
      return intentBuff
    default:
      return intentAttack
  }
}

const ENEMY_SPRITES: Record<string, string> = {
  clutter_tick: enemyClutter,
  mute_shield: enemyMute,
  echo_wisp: enemyEcho,
  beatbreaker: enemyBeatbreaker,
  two_beat_brute: enemyMute,
}

/** Elite has no dedicated art — reuse mute sprite with CSS tint in UI. */
export function enemySprite(defId: string): string | null {
  return ENEMY_SPRITES[defId] ?? enemyClutter
}

export function enemySpriteNeedsEliteTint(defId: string): boolean {
  return defId === 'two_beat_brute'
}
