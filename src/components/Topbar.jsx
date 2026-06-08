import { Menu, Moon, Sun, Bell } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function Topbar({ onMenu, title, subtitle }) {
  const { theme, toggle } = useTheme()
  return (
    <header className="sticky top-0 z-20 bg-ink-50/80 dark:bg-ink-950/80 backdrop-blur-xl border-b border-ink-200 dark:border-ink-800">
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenu}
            className="lg:hidden p-2 rounded-xl text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-ink-900 dark:text-white tracking-tight truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs sm:text-sm text-ink-500 dark:text-ink-400 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            className="p-2.5 rounded-xl text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors relative"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-ink-50 dark:ring-ink-950" />
          </button>
          <button
            onClick={toggle}
            className="p-2.5 rounded-xl text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  )
}
