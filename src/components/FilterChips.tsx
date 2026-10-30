import type { GameDimension } from '../data/games'

export type FilterValue = 'all' | GameDimension

const chips: { value: FilterValue; labelZh: string; labelEn: string }[] = [
  { value: 'all', labelZh: '全部', labelEn: 'All' },
  { value: '2D', labelZh: '2D', labelEn: '2D' },
  { value: '3D', labelZh: '3D', labelEn: '3D' },
]

export function FilterChips({
  value,
  onChange,
}: {
  value: FilterValue
  onChange: (v: FilterValue) => void
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="篩選遊戲維度">
      {chips.map((c) => {
        const active = value === c.value
        return (
          <button
            key={c.value}
            type="button"
            onClick={() => onChange(c.value)}
            aria-pressed={active}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
              active
                ? 'bg-gold text-ink shadow-[0_0_20px_rgba(240,193,74,0.3)]'
                : 'border border-white/15 bg-white/5 text-fog hover:border-white/30 hover:text-paper'
            }`}
          >
            {c.labelZh}
            {c.labelZh !== c.labelEn && (
              <span className="ml-1.5 font-en text-[10px] opacity-60">{c.labelEn}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
