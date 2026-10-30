import { Reveal } from '../components/Reveal'
import { CtaButton } from '../components/CtaButton'
import { studio } from '../data/games'

const pressAssets = [
  { name: 'Studio Logo (SVG)', note: '佔位 — 替換為正式標誌' },
  { name: 'Key Art Pack', note: '每款遊戲主視覺（即將提供）' },
  { name: 'Screenshots ZIP', note: '高解析截圖包（即將提供）' },
  { name: 'Fact Sheet (PDF)', note: '作品規格與簡介（即將提供）' },
]

export function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <Reveal>
        <p className="font-en text-xs font-semibold uppercase tracking-[0.2em] text-teal">
          Contact
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold text-paper sm:text-5xl">
          聯絡
        </h1>
        <p className="mt-2 font-en text-lg text-fog">Press · Partnerships · Feedback</p>
      </Reveal>

      <Reveal delay={0.05} className="mt-10 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-panel/50 p-6">
          <h2 className="font-display text-lg font-bold text-paper">電郵 Email</h2>
          <a
            href={`mailto:${studio.email}`}
            className="mt-3 block font-en text-teal hover:text-teal-dim break-all"
          >
            {studio.email}
          </a>
          <p className="mt-4 text-sm text-mist">媒體採訪、實況合作、發行洽談歡迎來信。</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-panel/50 p-6">
          <h2 className="font-display text-lg font-bold text-paper">據點 Location</h2>
          <p className="mt-3 text-fog">{studio.location}</p>
          <p className="mt-4 text-sm text-mist">
            {studio.nameZh} / {studio.nameEn}
          </p>
          <p className="font-en text-xs text-mist/70">{studio.studioEn}</p>
        </div>
      </Reveal>

      <Reveal delay={0.08} className="mt-14">
        <h2 className="font-display text-2xl font-bold text-paper">
          Press Kit
          <span className="ml-2 text-base font-normal text-mist">媒體素材（Stub）</span>
        </h2>
        <p className="mt-2 text-sm text-fog">
          以下為佔位清單。上線前替換為可下載連結即可。
        </p>
        <ul className="mt-6 divide-y divide-white/10 rounded-2xl border border-white/10 overflow-hidden">
          {pressAssets.map((a) => (
            <li
              key={a.name}
              className="flex flex-col gap-1 bg-white/[0.02] px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="font-semibold text-paper">{a.name}</span>
              <span className="text-xs text-mist">{a.note}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <CtaButton href={`mailto:${studio.email}?subject=Press%20Kit%20Request`} variant="secondary">
            索取 Press Kit
          </CtaButton>
        </div>
      </Reveal>
    </div>
  )
}
