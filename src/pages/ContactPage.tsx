import { CtaButton } from '../components/CtaButton'
import { PageHeading } from '../components/ui/States'
import { studio } from '../data/games'
import { usePageMeta } from '../hooks/usePageMeta'

const pressAssets = [
  { name: '工作室標誌（SVG）', note: '佔位 — 替換為正式標誌' },
  { name: '主視覺素材包', note: '每款遊戲主視覺（即將提供）' },
  { name: '截圖 ZIP', note: '高解析截圖包（即將提供）' },
  { name: 'Fact Sheet（PDF）', note: '作品規格與簡介（即將提供）' },
]

export function ContactPage() {
  usePageMeta({
    image: 'og-default.jpg',
    title: '聯絡｜Vincent Games Studio',
    description:
      '想合作／採訪？歡迎聯絡 Vincent Games Studio（香港）。',
  })

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-20">
      <PageHeading
        eyebrow="聯絡"
        title="有嘢想傾？歡迎嚟信"
        subtitle="想合作／採訪？寫信過嚟——我哋好樂意聽吓你嘅想法。"
      />

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-panel/50 p-6 sm:p-7">
          <h2 className="font-display text-lg font-bold text-paper">電郵</h2>
          <a
            href={`mailto:${studio.email}`}
            className="mt-4 inline-flex min-h-11 items-center break-all font-en text-lg text-teal hover:text-teal-dim"
          >
            {studio.email}
          </a>
          <p className="mt-3 text-sm leading-relaxed text-mist">一般會喺幾個工作天內回覆。</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-panel/50 p-6 sm:p-7">
          <h2 className="font-display text-lg font-bold text-paper">據點</h2>
          <p className="mt-4 text-lg text-fog">{studio.location}</p>
          <p className="mt-2 text-sm text-mist">{studio.studioZh}</p>
        </div>
      </div>

      <div className="mt-14">
        <h2 className="font-display text-2xl font-bold text-paper">媒體／合作素材</h2>
        <p className="mt-2 text-sm leading-relaxed text-fog">
          以下係準備中嘅清單。想合作／採訪？電郵我哋，會盡快提供標誌同截圖。
        </p>
        <ul className="mt-6 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10">
          {pressAssets.map((a) => (
            <li
              key={a.name}
              className="flex flex-col gap-1 bg-white/[0.02] px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="font-semibold text-paper">{a.name}</span>
              <span className="text-sm text-mist">{a.note}</span>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <CtaButton
            href={`mailto:${studio.email}?subject=%E5%90%88%E4%BD%9C%EF%BC%8F%E6%8E%A1%E8%A8%AA`}
            variant="secondary"
          >
            想合作／採訪？聯絡我哋
          </CtaButton>
          <CtaButton to="/games" variant="ghost">
            先睇遊戲
          </CtaButton>
        </div>
      </div>
    </div>
  )
}
