import { COPY } from '../copy/zh-HK'

export type NodeKind = 'battle' | 'rest' | 'elite' | 'boss'

export interface MapNodeTemplate {
  id: string
  kind: NodeKind
  labelZh: string
  sceneZh: string
}

export const RUN_MAP: MapNodeTemplate[] = [
  { id: 'n1', kind: 'battle', labelZh: COPY.map.battle, sceneZh: '入門鍛道' },
  { id: 'n2', kind: 'battle', labelZh: COPY.map.battle, sceneZh: '共鳴庫房' },
  { id: 'n3', kind: 'rest', labelZh: COPY.map.rest, sceneZh: '靜默冷卻室' },
  { id: 'n4', kind: 'elite', labelZh: COPY.map.elite, sceneZh: '強節點' },
  { id: 'n5', kind: 'boss', labelZh: COPY.map.boss, sceneZh: '主脈爐心' },
]
