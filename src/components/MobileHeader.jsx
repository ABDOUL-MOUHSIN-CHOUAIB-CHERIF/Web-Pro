import { Bell, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { initials } from '../utils/format'

export default function MobileHeader({ title, count, showBack = false, rightExtras = null }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  return (
    <header className="lg:hidden sticky top-0 z-20 bg-ink-50/90 dark:bg-ink-950/90 backdrop-blur-xl border-b border-ink-200 dark:border-ink-800">
      <div className="flex items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-2 min-w-0">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 -ml-1.5 rounded-lg text-brand-700 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-900/30"
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <h1 className="text-xl font-extrabold text-brand-800 dark:text-brand-300 tracking-tight truncate">
            {title}
          </h1>
          {typeof count === 'number' && (
            <span className="px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 text-xs font-bold">
              {count}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {rightExtras}
          <button
            className="p-2 rounded-full text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 relative"
            aria-label="Notifications"
          >
            <Bell size={19} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-ink-50 dark:ring-ink-950" />
          </button>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-white grid place-items-center font-bold text-xs">
            {initials(user?.name)}
          </div>
        </div>
      </div>
    </header>
  )
}
