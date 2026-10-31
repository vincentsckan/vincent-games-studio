import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Game } from '../data/games'
import { isExternalPlayHref, resolvePlayHref } from '../lib/demoPlay'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { GameArt } from './GameArt'
import { CtaButton } from './CtaButton'

const RESULT_LINES = [
  '今晚就係呢款——去玩啦！',
  '抽中啦，即刻開波？',
  '啱晒今晚氣氛。',
] as const

function pickRandom<T>(items: readonly T[], avoid?: T): T {
  if (items.length === 0) throw new Error('empty')
  if (items.length === 1) return items[0]
  let next = items[Math.floor(Math.random() * items.length)]
  let guard = 0
  while (avoid !== undefined && next === avoid && guard < 8) {
    next = items[Math.floor(Math.random() * items.length)]
    guard += 1
  }
  return next
}

function isPlayable(game: Game): boolean {
  const href = resolvePlayHref(game.links.play)
  return Boolean(href && !href.startsWith('#'))
}

export function TonightPick({ games, loading }: { games: Game[]; loading?: boolean }) {
  const reduced = usePrefersReducedMotion()
  const pool = useMemo(() => {
    const playable = games.filter(isPlayable)
    return playable.length > 0 ? playable : games
  }, [games])

  const [picked, setPicked] = useState<Game | null>(null)
  const [invite, setInvite] = useState<string>('')
  const [spinning, setSpinning] = useState(false)

  const draw = useCallback(() => {
    if (pool.length === 0 || spinning) return
    const doPick = () => {
      const next = pickRandom(pool, picked ?? undefined)
      setPicked(next)
      setInvite(pickRandom(RESULT_LINES))
      setSpinning(false)
    }
    if (reduced) {
      doPick()
      return
    }
    setSpinning(true)
    window.setTimeout(doPick, 420)
  }, [pool, picked, spinning, reduced])

  const playHref = picked ? resolvePlayHref(picked.links.play) : undefined
  const openTab = isExternalPlayHref(playHref)

  return (
    <section
      id="tonight-pick"
      className="border-y border-white/8 bg-ink-2/60"
      aria-labelledby="tonight-pick-title"
    >
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold tracking-wide text-gold">今晚</p>
          <h2
            id="tonight-pick-title"
            className="mt-2 font-display text-3xl font-bold text-paper sm:text-4xl"
          >
            今晚玩邊款？
          </h2>
          <p className="mt-3 text-base leading-relaxed text-mist">
            唔知揀邊款？撳一下，我哋幫你抽。
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-xl">
          <div
            className={`rounded-2xl border border-white/10 bg-panel/60 p-6 sm:p-8 transition-transform duration-300 ${
              spinning && !reduced ? 'scale-[0.98] opacity-80' : ''
            }`}
            aria-live="polite"
            aria-atomic="true"
          >
            {loading ? (
              <p className="text-center text-mist">載入緊作品目錄…</p>
            ) : pool.length === 0 ? (
              <p className="text-center text-mist">暫時未有可抽嘅遊戲，遲啲再嚟啦。</p>
            ) : !picked ? (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <div
                  className="flex h-28 w-28 items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/[0.03] text-3xl"
                  aria-hidden
                >
                  ✦
                </div>
                <p className="text-sm text-fog">準備好未？一撳就抽。</p>
              </div>
            ) : (
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <Link
                  to={`/games/${picked.slug}`}
                  className="group block w-full shrink-0 overflow-hidden rounded-xl sm:w-40"
                >
                  <GameArt game={picked} variant="card" showCaption={false} className="rounded-xl" />
                </Link>
                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <p className="text-sm font-semibold text-teal">{invite}</p>
                  <h3 className="mt-1 font-display text-2xl font-bold text-paper">
                    {picked.titleZh}
                  </h3>
                  <p className="mt-0.5 font-en text-sm text-mist">{picked.titleEn}</p>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-fog">
                    {picked.taglineZh}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
            <button
              type="button"
              onClick={draw}
              disabled={loading || pool.length === 0 || spinning}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-gold px-6 text-base font-bold tracking-wide text-ink transition-colors hover:bg-gold-dim focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {picked ? '再抽一次' : '抽一款試試'}
            </button>

            {picked && playHref ? (
              <CtaButton
                href={playHref}
                variant="secondary"
                external={openTab}
                className="w-full sm:w-auto"
              >
                即刻試玩
              </CtaButton>
            ) : null}

            <CtaButton to="/games" variant="ghost" className="w-full sm:w-auto">
              返去自己揀
            </CtaButton>
          </div>
        </div>
      </div>
    </section>
  )
}
