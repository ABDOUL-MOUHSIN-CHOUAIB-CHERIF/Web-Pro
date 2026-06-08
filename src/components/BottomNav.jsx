import { NavLink } from 'react-router-dom'
import { LayoutGrid, Receipt, Wallet, Target, BarChart3 } from 'lucide-react'

const items = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/incomes', label: 'Income', icon: Wallet },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
]

export default function BottomNav() {
  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-ink-900/95 backdrop-blur-xl border-t border-ink-200 dark:border-ink-800"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="grid grid-cols-5 max-w-md mx-auto">
        {items.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 px-1 transition-colors ${
                  isActive
                    ? 'text-brand-700 dark:text-brand-300'
                    : 'text-ink-500 dark:text-ink-400 hover:text-ink-800 dark:hover:text-ink-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`grid place-items-center px-4 py-1 rounded-full transition-all ${
                      isActive ? 'bg-brand-100 dark:bg-brand-900/40' : ''
                    }`}
                  >
                    <Icon size={20} strokeWidth={isActive ? 2.4 : 2} />
                  </span>
                  <span className={`text-[10px] font-semibold ${isActive ? '' : ''}`}>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
