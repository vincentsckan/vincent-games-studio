import { Link } from 'react-router-dom'
import { studio } from '../data/games'

export function Footer() {
  return (
    <footer className="border-t border-white/8 bg-ink-2">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-display text-lg font-bold text-paper">{studio.studioZh}</p>
          <p className="mt-1 text-sm text-mist">
            {studio.nameZh}
            <span className="mx-1.5 text-white/20">·</span>
            <span className="font-en">{studio.nameEn}</span>
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-mist/85">{studio.taglineZh}</p>
        </div>
        <div className="flex flex-wrap gap-10 text-base">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-mist">探索</span>
            <Link to="/games" className="text-fog hover:text-gold">
              遊戲
            </Link>
            <Link to="/about" className="text-fog hover:text-gold">
              關於
            </Link>
            <Link to="/contact" className="text-fog hover:text-gold">
              聯絡／媒體
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-mist">聯絡</span>
            <a href={`mailto:${studio.email}`} className="text-fog hover:text-teal">
              {studio.email}
            </a>
            <span className="text-mist/70">{studio.location}</span>
          </div>
        </div>
      </div>
      <div className="border-t border-white/8 py-4 text-center text-xs text-mist/55">
        © {new Date().getFullYear()} {studio.studioEn}
      </div>
    </footer>
  )
}
