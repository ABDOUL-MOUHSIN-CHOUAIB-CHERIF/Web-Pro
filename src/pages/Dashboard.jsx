import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus, ArrowDownLeft, ArrowUpRight, Camera, ArrowRightLeft,
  Sparkles, Tag, Target, Receipt, Wallet, TrendingUp, ArrowRight,
  Utensils, Car, ShoppingBag, Briefcase, Coffee,
} from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, Cell } from 'recharts'
import MobileHeader from '../components/MobileHeader'
import EmptyState from '../components/EmptyState'
import { PageSpinner } from '../components/Spinner'
import { dashboardApi, expensesApi, incomesApi, reportsApi } from '../services/api'
import { formatCurrency, formatDate, monthLabel } from '../utils/format'

const RANGES = [
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
]

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 })
  const [counts, setCounts] = useState({ categories: 0, goals: 0, expenses: 0, incomes: 0 })
  const [monthlyExpenses, setMonthlyExpenses] = useState([])
  const [recent, setRecent] = useState([])
  const [range, setRange] = useState('week')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [s, c, me, ex, inc] = await Promise.allSettled([
          dashboardApi.summary(),
          dashboardApi.counts(),
          reportsApi.monthlyExpenses(),
          expensesApi.list(),
          incomesApi.list(),
        ])
        if (cancelled) return
        if (s.status === 'fulfilled') setSummary(s.value.data || {})
        if (c.status === 'fulfilled') setCounts(c.value.data || {})
        if (me.status === 'fulfilled') setMonthlyExpenses(asArray(me.value.data))
        const exItems = ex.status === 'fulfilled' ? asArray(ex.value.data).map(x => ({ ...x, _type: 'expense' })) : []
        const incItems = inc.status === 'fulfilled' ? asArray(inc.value.data).map(x => ({ ...x, _type: 'income' })) : []
        setRecent(
          [...exItems, ...incItems]
            .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
            .slice(0, 5)
        )
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const chartData = useMemo(() => {
    if (monthlyExpenses.length) {
      return monthlyExpenses.slice(-7).map((r) => ({
        label: monthLabel(r.month) || String(r.month || ''),
        value: Number(r.total ?? r.amount ?? r.value ?? 0),
      }))
    }
    const labels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
    return labels.map((l) => ({ label: l, value: 0 }))
  }, [monthlyExpenses])

  const maxVal = Math.max(...chartData.map((d) => d.value), 1)
  const peakIdx = chartData.reduce((best, d, i, arr) => (d.value > arr[best].value ? i : best), 0)

  if (loading) {
    return (
      <>
        <MobileHeader title="ExpenseWise" />
        <PageSpinner />
      </>
    )
  }

  return (
    <>
      <MobileHeader title="ExpenseWise" />
      <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-6 space-y-4 max-w-4xl mx-auto">
        {/* Balance hero */}
        <section className="relative rounded-3xl overflow-hidden p-5 text-white shadow-lg shadow-brand-600/20">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800" />
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 100% 0%, rgba(255,255,255,0.5) 0, transparent 40%), radial-gradient(circle at 0% 100%, rgba(255,255,255,0.2) 0, transparent 40%)',
            }}
          />
          <div className="relative">
            <div className="flex items-start justify-between gap-3 mb-1">
              <div className="flex items-center gap-1.5 text-white/90 text-xs font-semibold">
                <Wallet size={13} /> Total Balance
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur text-[11px] font-bold">
                <TrendingUp size={11} /> +12% vs last month
              </span>
            </div>
            <p className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight">
              {formatCurrency(summary.balance)}
            </p>
            <div className="mt-5 flex items-center gap-2">
              {[
                { Icon: Plus, label: 'Add', to: '/expenses' },
                { Icon: ArrowRightLeft, label: 'Move', to: '/incomes' },
                { Icon: Camera, label: 'Scan', to: '/expenses' },
              ].map(({ Icon, label, to }) => (
                <Link
                  key={label}
                  to={to}
                  className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur grid place-items-center hover:bg-white/25 active:scale-95 transition-all"
                  aria-label={label}
                >
                  <Icon size={17} />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Income vs Expense quick cards */}
        <div className="grid grid-cols-2 gap-3">
          <QuickCard
            Icon={ArrowDownLeft}
            label="Income this month"
            value={summary.totalIncome}
            tone="green"
          />
          <QuickCard
            Icon={ArrowUpRight}
            label="Expenses this month"
            value={summary.totalExpense}
            tone="red"
          />
        </div>

        {/* AI insight card */}
        <Link
          to="/reports"
          className="block rounded-2xl bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/50 p-4 hover:shadow-soft active:scale-[0.99] transition-all"
        >
          <div className="flex gap-3">
            <div className="w-14 h-14 shrink-0 rounded-2xl bg-violet-200/60 dark:bg-violet-800/40 grid place-items-center text-violet-700 dark:text-violet-300">
              <Sparkles size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-violet-900 dark:text-violet-200 leading-relaxed">
                Your spending on <strong>Fast Food</strong> is 25% higher than last week.
                Consider eating home more often to save around{' '}
                <strong>12,000 XAF</strong> monthly.
              </p>
              <p className="mt-2 text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300 flex items-center gap-1">
                Get Tips <ArrowRight size={12} />
              </p>
            </div>
          </div>
        </Link>

        {/* Stat tiles */}
        <div className="grid grid-cols-2 gap-3">
          <StatTile Icon={Tag} label="CATEGORIES" value={counts.categories} tone="green" />
          <StatTile Icon={Target} label="GOALS" value={counts.goals} tone="violet" />
          <StatTile Icon={Receipt} label="EXPENSES" value={counts.expenses} tone="red" />
          <StatTile Icon={Wallet} label="INCOMES" value={String(counts.incomes ?? 0).padStart(2, '0')} tone="green" />
        </div>

        {/* Spending overview */}
        <section className="card p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-lg font-extrabold text-ink-900 dark:text-white tracking-tight">
              Spending overview
            </h2>
            <div className="flex items-center gap-0.5 p-0.5 rounded-full bg-ink-100 dark:bg-ink-800">
              {RANGES.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setRange(r.key)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    range === r.key
                      ? 'bg-white dark:bg-ink-900 text-brand-700 dark:text-brand-300 shadow-sm'
                      : 'text-ink-500 hover:text-ink-800 dark:hover:text-ink-200'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-48">
            {chartData.every((d) => d.value === 0) ? (
              <div className="h-full grid place-items-center text-sm text-ink-400">
                No spending data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {chartData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={i === peakIdx ? '#dc2626' : '#10b981'}
                        opacity={i === peakIdx ? 1 : 0.85}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* Recent transactions */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-lg font-extrabold text-ink-900 dark:text-white tracking-tight">
              Recent Transactions
            </h2>
            <Link
              to="/expenses"
              className="text-xs font-extrabold uppercase tracking-wider text-brand-600 dark:text-brand-400 hover:underline"
            >
              View all
            </Link>
          </div>
          {recent.length === 0 ? (
            <EmptyState
              title="No transactions yet"
              description="Add your first transaction to get started."
            />
          ) : (
            <ul className="space-y-2.5">
              {recent.map((item) => (
                <TransactionRow key={`${item._type}-${item.id}`} item={item} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}

function QuickCard({ Icon, label, value, tone }) {
  const tones = {
    green: 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300',
    red: 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
  }
  const valColor = tone === 'green' ? 'text-brand-600 dark:text-brand-400' : 'text-rose-600 dark:text-rose-400'
  return (
    <div className="card p-3.5 sm:p-4">
      <div className={`w-9 h-9 rounded-xl grid place-items-center ${tones[tone]} mb-2`}>
        <Icon size={17} />
      </div>
      <p className="text-xs text-ink-500 dark:text-ink-400 font-medium leading-tight">{label}</p>
      <p className={`mt-1 text-lg font-extrabold tracking-tight ${valColor}`}>
        {formatCurrency(value)}
      </p>
    </div>
  )
}

function StatTile({ Icon, label, value, tone }) {
  const tones = {
    green: 'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300',
    violet: 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300',
    red: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',
  }
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className={`w-11 h-11 rounded-xl grid place-items-center shrink-0 ${tones[tone]}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
          {label}
        </p>
        <p className="text-xl font-extrabold text-ink-900 dark:text-white tracking-tight">
          {value}
        </p>
      </div>
    </div>
  )
}

function TransactionRow({ item }) {
  const isExpense = item._type === 'expense'
  const { Icon, tone } = guessIcon(item.title || item.source || '')
  return (
    <li className="card p-3.5 flex items-center gap-3">
      <div className={`w-11 h-11 rounded-2xl grid place-items-center shrink-0 ${tone}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-ink-900 dark:text-white truncate">
          {item.title || item.source}
        </p>
        <p className="text-xs text-ink-500 dark:text-ink-400 truncate">
          {isExpense ? 'Expense' : 'Income'} · {formatDate(item.date || item.createdAt)}
        </p>
      </div>
      <p className={`font-extrabold shrink-0 tabular-nums ${
        isExpense ? 'text-rose-600 dark:text-rose-400' : 'text-brand-600 dark:text-brand-400'
      }`}>
        {isExpense ? '−' : '+'}{formatCurrency(item.amount)}
      </p>
    </li>
  )
}

function guessIcon(name = '') {
  const n = name.toLowerCase()
  if (/(food|burger|restaurant|lunch|dinner|kfc|king|bakery)/.test(n))
    return { Icon: Utensils, tone: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' }
  if (/(transport|uber|taxi|ride|fuel|gas|yango)/.test(n))
    return { Icon: Car, tone: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600' }
  if (/(shop|store|apple|amazon|market)/.test(n))
    return { Icon: ShoppingBag, tone: 'bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600' }
  if (/(coffee|cafe|tea)/.test(n))
    return { Icon: Coffee, tone: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700' }
  if (/(salary|wage|payroll|income|client)/.test(n))
    return { Icon: Briefcase, tone: 'bg-brand-100 dark:bg-brand-900/30 text-brand-700' }
  return { Icon: Wallet, tone: 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300' }
}

function asArray(d) {
  if (Array.isArray(d)) return d
  if (Array.isArray(d?.data)) return d.data
  if (Array.isArray(d?.results)) return d.results
  return []
}
