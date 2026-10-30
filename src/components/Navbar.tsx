import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { studio } from '../data/games'

const links = [
  { to: '/', label: '首頁', en: 'Home', end: true },
  { to: '/games', label: '遊戲', en: 'Games' },
  { to: '/about', label: '關於', en: 'About' },
  { to: '/contact', label: '聯絡', en: 'Contact' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const reduced = useReducedMotion()

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-ink/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-gold/40 bg-ink-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M2 13 L8 2 L14 13 Z" stroke="#f0c14a" strokeWidth="1.5" />
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
                  `rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                    isActive
                      ? 'bg-white/10 text-gold'
                      : 'text-fog/80 hover:bg-white/5 hover:text-paper'
                  }`
                }
              >
                <span className="font-medium">{l.label}</span>
                <span className="ml-1.5 font-en text-[10px] uppercase tracking-wider opacity-50">
                  {l.en}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-paper md:hidden"
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

      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduced ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.25 }}
            className="overflow-hidden border-t border-white/5 bg-ink/95 md:hidden"
          >
            <ul className="flex flex-col gap-1 px-4 py-4">
              {links.map((l) => (
                <li key={l.to}>
                  <NavLink
                    to={l.to}
                    end={l.end}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-xl px-4 py-3 text-base ${
                        isActive ? 'bg-white/10 text-gold' : 'text-fog hover:bg-white/5'
                      }`
                    }
                  >
                    {l.label}
                    <span className="ml-2 font-en text-xs opacity-50">{l.en}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
