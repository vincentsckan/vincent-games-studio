import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { studio } from '../data/games'

const links = [
  { to: '/', label: '首頁', end: true },
  { to: '/games', label: '遊戲' },
  { to: '/about', label: '關於' },
  { to: '/contact', label: '聯絡' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/8 bg-ink/85 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          to="/"
          className="group flex min-h-11 items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold/40 bg-ink-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M2 13 L8 2 L14 13 Z" stroke="#efc04a" strokeWidth="1.5" />
              <circle cx="8" cy="10" r="1.5" fill="#5eead4" />
            </svg>
          </span>
          <span className="font-display text-sm font-bold tracking-tight text-paper sm:text-base">
            {studio.studioZh}
          </span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `inline-flex min-h-11 items-center rounded-full px-4 text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-white/10 text-gold'
                      : 'text-fog hover:bg-white/5 hover:text-paper'
                  }`
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="hidden md:block">
          <Link
            to="/games"
            className="inline-flex min-h-11 items-center rounded-full bg-gold px-5 text-sm font-bold text-ink hover:bg-gold-dim"
          >
            瀏覽遊戲
          </Link>
        </div>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/12 text-paper md:hidden"
          aria-label={open ? '關閉選單' : '開啟選單'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
            {open ? (
              <path d="M5 5 L15 15 M15 5 L5 15" stroke="currentColor" strokeWidth="1.5" />
            ) : (
              <path d="M4 6 H16 M4 10 H16 M4 14 H16" stroke="currentColor" strokeWidth="1.5" />
            )}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/8 bg-ink/98 md:hidden">
          <ul className="flex flex-col gap-1 px-4 py-3">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex min-h-12 items-center rounded-xl px-4 text-lg font-medium ${
                      isActive ? 'bg-white/10 text-gold' : 'text-fog hover:bg-white/5'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
            <li className="pt-2">
              <Link
                to="/games"
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center justify-center rounded-xl bg-gold text-base font-bold text-ink"
              >
                嚟玩吓
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
