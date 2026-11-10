import { stageById, type StageDef } from './stages'

export interface CampaignProgress {
  cleared: number[]
}

const STORAGE_KEY = 'rift-arena.campaign.v1'

export function emptyProgress(): CampaignProgress {
  return { cleared: [] }
}

export function recordClear(progress: CampaignProgress, stageId: number): CampaignProgress {
  if (progress.cleared.includes(stageId)) return progress
  return { cleared: [...progress.cleared, stageId].sort((a, b) => a - b) }
}

export function isStageEnterable(stage: StageDef, progress: CampaignProgress): boolean {
  if (!stage.playable) return false
  if (progress.cleared.includes(stage.id)) return true
  if (stage.id === 1) return true
  return progress.cleared.includes(stage.id - 1)
}

export function loadProgress(): CampaignProgress {
  try {
    const store = globalThis.localStorage
    if (!store) return emptyProgress()
    const raw = store.getItem(STORAGE_KEY)
    if (!raw) return emptyProgress()
    const parsed = JSON.parse(raw) as { cleared?: unknown }
    if (!Array.isArray(parsed.cleared)) return emptyProgress()
    const cleared = parsed.cleared.filter(
      (n): n is number => typeof n === 'number' && n >= 1 && n <= 20 && stageById(n).playable,
    )
    return { cleared: [...new Set(cleared)].sort((a, b) => a - b) }
  } catch {
    return emptyProgress()
  }
}

export function saveProgress(progress: CampaignProgress): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    /* private mode or tests without storage */
  }
}
