/** Screen height of in-arena fighter sprite at camera scale 1 (top-down readable). */
export const FIGHTER_SPRITE_HEIGHT_PX = 108

export function fighterDrawSize(
  naturalWidth: number,
  naturalHeight: number,
  cameraScale: number,
): { w: number; h: number } {
  const h = FIGHTER_SPRITE_HEIGHT_PX * cameraScale
  const w = h * (naturalWidth / naturalHeight)
  return { w, h }
}
