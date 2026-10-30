import { CtaButton } from '../components/CtaButton'
import { PageHeading } from '../components/ui/States'
import { studio, games } from '../data/games'

export function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <PageHeading eyebrow="關於" title={studio.nameZh} subtitle={`${studio.nameEn} · ${studio.studioZh} · ${studio.location}`} />

      <div
        className="mt-10 aspect-[21/9] overflow-hidden rounded-2xl border border-white/10"
        style={{
          background:
            'linear-gradient(135deg, #0a1628 0%, #1a3a5c 40%, #4c1d95 75%, #08080f 100%)',
        }}
        aria-hidden
      />

      <div className="mt-10 space-y-6 text-base leading-relaxed text-fog">
        {studio.aboutZh.split('\n\n').map((para) => (
          <p key={para.slice(0, 24)}>{para}</p>
        ))}
        <div className="rounded-xl border border-white/10 bg-panel/40 p-5">
          <p className="font-en text-sm leading-relaxed text-mist">{studio.aboutEn}</p>
        </div>
      </div>

      <div className="mt-14">
        <h2 className="font-display text-2xl font-bold text-paper">目前作品線</h2>
        <ul className="mt-4 space-y-3">
          {games.map((g) => (
            <li
              key={g.id}
              className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-4"
            >
              <span>
                <span className="font-semibold text-paper">{g.titleZh}</span>
                <span className="ml-2 font-en text-xs text-mist">{g.titleEn}</span>
              </span>
              <span className="font-en text-xs text-teal">
                {g.dimension} · {g.year}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        <CtaButton to="/games" variant="primary">
          瀏覽遊戲
        </CtaButton>
        <CtaButton to="/contact" variant="ghost">
          聯絡／Press Kit
        </CtaButton>
      </div>
    </div>
  )
}
