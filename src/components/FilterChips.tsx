import type { GameDimension } from '../data/games'

export type FilterValue = 'all' | GameDimension

const chips: { value: FilterValue; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: '2D', label: '2D' },
  { value: '3D', label: '3D' },
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
            className={`inline-flex min-h-11 items-center rounded-full px-5 text-base font-semibold transition-colors ${
              active
                ? 'bg-gold text-ink'
                : 'border border-white/15 bg-white/5 text-fog hover:border-white/30 hover:text-paper'
            }`}
          >
            {c.label}
          </button>
        )
      })}
    </div>
  )
}
