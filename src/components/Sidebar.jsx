import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  Tags,
  Target,
  BarChart3,
  LogOut,
  Wallet2,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { initials } from '../utils/format'

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/incomes', label: 'Incomes', icon: Wallet },
  { to: '/categories', label: 'Categories', icon: Tags },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
]

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-30 bg-ink-900/50 backdrop-blur-sm lg:hidden transition-opacity ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-72 shrink-0
          bg-white dark:bg-ink-900 border-r border-ink-200 dark:border-ink-800
          flex flex-col transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex items-center justify-between p-5 border-b border-ink-200 dark:border-ink-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center text-white shadow-sm">
              <Wallet2 size={20} strokeWidth={2.4} />
            </div>
            <div>
              <p className="font-extrabold text-ink-900 dark:text-white leading-none tracking-tight">ExpenseWise</p>
              <p className="text-[11px] text-ink-500 dark:text-ink-400 mt-0.5">Smart finance tracker</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <p className="px-3.5 pt-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
            Menu
          </p>
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : ''}`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={isActive ? 2.4 : 2} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-ink-200 dark:border-ink-800">
          <div className="flex items-center gap-3 p-2.5 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white grid place-items-center font-semibold text-sm shrink-0">
              {initials(user?.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink-900 dark:text-white truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-ink-500 dark:text-ink-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg text-ink-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
