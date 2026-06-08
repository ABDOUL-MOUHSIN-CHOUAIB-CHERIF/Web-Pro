import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import BottomNav from './BottomNav'

const meta = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview of your finances' },
  '/expenses': { title: 'Expenses', subtitle: 'Track every cent that leaves your wallet' },
  '/incomes': { title: 'Incomes', subtitle: 'All your sources of income' },
  '/goals': { title: 'Savings Goals', subtitle: 'Track progress toward what matters' },
  '/reports': { title: 'Reports', subtitle: 'Insights into your spending patterns' },
}

export default function AppLayout() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const current = meta[pathname] || { title: 'ExpenseWise', subtitle: '' }

  return (
    <div className="min-h-screen flex bg-ink-50 dark:bg-ink-950">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="hidden lg:block">
          <Topbar onMenu={() => setOpen(true)} title={current.title} subtitle={current.subtitle} />
        </div>
        <main className="flex-1 pb-24 lg:pb-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
