import { Link } from 'react-router-dom'
import { studio } from '../data/games'

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-ink-2">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-display text-lg font-bold text-paper">{studio.studioZh}</p>
          <p className="mt-1 font-en text-sm text-mist">
            {studio.nameZh} · {studio.nameEn}
          </p>
          <p className="mt-3 max-w-sm text-sm text-mist/80">{studio.taglineZh}</p>
        </div>
        <div className="flex flex-wrap gap-8 text-sm">
          <div className="flex flex-col gap-2">
            <span className="font-en text-xs uppercase tracking-widest text-mist">Explore</span>
            <Link to="/games" className="text-fog hover:text-gold">
              遊戲 Games
            </Link>
            <Link to="/about" className="text-fog hover:text-gold">
              關於 About
            </Link>
            <Link to="/contact" className="text-fog hover:text-gold">
              聯絡 / Press
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-en text-xs uppercase tracking-widest text-mist">Connect</span>
            <a href={`mailto:${studio.email}`} className="text-fog hover:text-teal">
              {studio.email}
            </a>
            <span className="text-mist/70">{studio.location}</span>
          </div>
        </div>
      </div>
      <div className="border-t border-white/5 py-4 text-center font-en text-xs text-mist/60">
        © {new Date().getFullYear()} {studio.studioEn}. Demo showcase — placeholder content.
      </div>
    </footer>
  )
}
