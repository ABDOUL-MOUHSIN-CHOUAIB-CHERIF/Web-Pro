import { useEffect, useMemo, useState } from 'react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
} from 'recharts'
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react'
import MobileHeader from '../components/MobileHeader'
import { PageSpinner } from '../components/Spinner'
import { reportsApi, expensesApi } from '../services/api'
import { formatCurrency, monthLabel } from '../utils/format'

const RANGES = [
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: '3months', label: 'Last 3 Months' },
  { key: 'year', label: 'This Year' },
]

const PIE_COLORS = ['#15803d', '#8b5cf6', '#ef4444', '#06b6d4', '#f59e0b', '#ec4899']

export default function Reports() {
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState('month')
  const [monthlyExpenses, setMonthlyExpenses] = useState([])
  const [monthlyIncomes, setMonthlyIncomes] = useState([])
  const [categoryExpenses, setCategoryExpenses] = useState([])
  const [summary, setSummary] = useState(null)
  const [expenses, setExpenses] = useState([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [me, mi, ce, fs, ex] = await Promise.allSettled([
          reportsApi.monthlyExpenses(),
          reportsApi.monthlyIncomes(),
          reportsApi.categoryExpenses(),
          reportsApi.financialSummary(),
          expensesApi.list(),
        ])
        if (cancelled) return
        if (me.status === 'fulfilled') setMonthlyExpenses(asArray(me.value.data))
        if (mi.status === 'fulfilled') setMonthlyIncomes(asArray(mi.value.data))
        if (ce.status === 'fulfilled') setCategoryExpenses(asArray(ce.value.data))
        if (fs.status === 'fulfilled') setSummary(fs.value.data || null)
        if (ex.status === 'fulfilled') setExpenses(asArray(ex.value.data))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const trendData = useMemo(() => {
    const map = new Map()
    monthlyExpenses.forEach((r) => {
      const key = r.month ?? r.label ?? r._id
      map.set(key, { month: monthLabel(key) || String(key), expense: Number(r.total ?? r.amount ?? r.value ?? 0), income: 0 })
    })
    monthlyIncomes.forEach((r) => {
      const key = r.month ?? r.label ?? r._id
      const e = map.get(key) || { month: monthLabel(key) || String(key), expense: 0, income: 0 }
      e.income = Number(r.total ?? r.amount ?? r.value ?? 0)
      map.set(key, e)
    })
    return Array.from(map.values())
  }, [monthlyExpenses, monthlyIncomes])

  const pieData = useMemo(
    () =>
      categoryExpenses
        .map((c) => ({ name: c.name || c.category || c.categoryName || 'Other', value: Number(c.total ?? c.amount ?? c.value ?? 0) }))
        .filter((d) => d.value > 0),
    [categoryExpenses]
  )

  const totalCategory = pieData.reduce((s, x) => s + x.value, 0)

  const top5 = useMemo(
    () =>
      [...expenses]
        .sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))
        .slice(0, 5),
    [expenses]
  )
  const maxTop = top5[0]?.amount ? Number(top5[0].amount) : 1

  const totalIncome = Number(summary?.totalIncome ?? 0)
  const totalExpense = Number(summary?.totalExpense ?? 0)
  const balance = Number(summary?.balance ?? totalIncome - totalExpense)
  const savingsRate = totalIncome > 0 ? Math.max(0, ((totalIncome - totalExpense) / totalIncome) * 100) : 0

  return (
    <>
      <MobileHeader title="ExpenseWise" />

      <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-6 space-y-4 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-900 dark:text-white tracking-tight">
            Financial Analytics
          </h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
            Detailed breakdown of your spending habits and trends.
          </p>
        </div>

        {/* Range tabs */}
        <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-ink-100 dark:bg-ink-800">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                range === r.key
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'text-ink-600 dark:text-ink-300 hover:bg-white/50 dark:hover:bg-ink-700'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {loading ? (
          <PageSpinner />
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-3">
              <SmallStat
                Icon={TrendingUp}
                label="TOTAL INCOME"
                value={formatCurrency(totalIncome)}
                badge="+12.4%"
                tone="green"
              />
              <SmallStat
                Icon={TrendingDown}
                label="TOTAL EXPENSE"
                value={formatCurrency(totalExpense)}
                badge="+3.1%"
                tone="red"
              />
              <HeroStat label="NET BALANCE" value={formatCurrency(balance)} badge="STABLE" />
              <SmallStat
                Icon={PiggyBank}
                label="SAVINGS RATE"
                value={`${savingsRate.toFixed(1)}%`}
                badge="HEALTHY"
                tone="violet"
                valueColor="text-violet-700 dark:text-violet-300"
              />
            </div>

            {/* Trend area chart */}
            <section className="card p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-ink-900 dark:text-white">Income vs Expense Trends</h3>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-brand-600" /> Income
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" /> Expense
                  </span>
                </div>
              </div>
              <div className="h-44">
                {trendData.length === 0 ? (
                  <div className="h-full grid place-items-center text-sm text-ink-400">No data yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 6, right: 4, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="g-income" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#15803d" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#15803d" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="g-expense" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip content={<ChartTooltip />} />
                      <Area type="monotone" dataKey="income" stroke="#15803d" strokeWidth={2} fill="url(#g-income)" />
                      <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fill="url(#g-expense)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </section>

            {/* Expenses by Category */}
            <section className="card p-5">
              <h3 className="font-bold text-ink-900 dark:text-white mb-3">Expenses by Category</h3>
              {pieData.length === 0 ? (
                <div className="h-32 grid place-items-center text-sm text-ink-400">No data yet</div>
              ) : (
                <>
                  <div className="h-56 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={88} paddingAngle={1}>
                          {pieData.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 grid place-items-center pointer-events-none">
                      <div className="text-center">
                        <p className="text-xl font-extrabold text-ink-900 dark:text-white tracking-tight">
                          {formatCurrency(totalCategory)}
                        </p>
                        <p className="text-[11px] text-ink-500 dark:text-ink-400">Total</p>
                      </div>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {pieData.map((d, i) => {
                      const pct = totalCategory > 0 ? Math.round((d.value / totalCategory) * 100) : 0
                      return (
                        <li key={d.name} className="flex items-center gap-3 text-sm">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <span className="flex-1 text-ink-700 dark:text-ink-300 truncate">{d.name}</span>
                          <span className="text-ink-900 dark:text-white font-bold tabular-nums">{formatCurrency(d.value)}</span>
                          <span className="text-ink-500 dark:text-ink-400 w-10 text-right tabular-nums">{pct}%</span>
                        </li>
                      )
                    })}
                  </ul>
                </>
              )}
            </section>

            {/* Top 5 expenses */}
            <section className="card p-5">
              <h3 className="font-bold text-ink-900 dark:text-white mb-3">Top 5 Expenses</h3>
              {top5.length === 0 ? (
                <p className="text-sm text-ink-400">No expenses recorded.</p>
              ) : (
                <ul className="space-y-3">
                  {top5.map((x) => {
                    const pct = Math.min(100, (Number(x.amount || 0) / maxTop) * 100)
                    return (
                      <li key={x.id}>
                        <div className="flex items-center justify-between text-sm mb-1.5">
                          <span className="font-semibold text-ink-800 dark:text-ink-200 truncate">{x.title}</span>
                          <span className="font-extrabold text-ink-900 dark:text-white tabular-nums shrink-0 ml-3">
                            {formatCurrency(x.amount)}
                          </span>
                        </div>
                        <div className="h-1.5 bg-ink-100 dark:bg-ink-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-brand-500 to-brand-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </>
  )
}

function SmallStat({ Icon, label, value, badge, tone = 'green', valueColor }) {
  const tones = {
    green: 'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300',
    red: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',
    violet: 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300',
  }
  const badgeTones = {
    green: 'text-brand-700 dark:text-brand-300',
    red: 'text-rose-600 dark:text-rose-400',
    violet: 'text-violet-700 dark:text-violet-300',
  }
  const valColor = valueColor || (tone === 'red' ? 'text-rose-600 dark:text-rose-400' : 'text-brand-700 dark:text-brand-300')
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className={`w-9 h-9 rounded-xl grid place-items-center ${tones[tone]}`}>
          <Icon size={16} />
        </div>
        <span className={`text-[11px] font-bold ${badgeTones[tone]}`}>{badge}</span>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
        {label}
      </p>
      <p className={`mt-0.5 text-lg font-extrabold tabular-nums tracking-tight ${valColor}`}>{value}</p>
    </div>
  )
}

function HeroStat({ label, value, badge }) {
  return (
    <div className="relative rounded-2xl overflow-hidden p-4 text-white shadow-md shadow-brand-700/20">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800" />
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 100% 0%, rgba(255,255,255,0.4) 0, transparent 50%)',
        }}
      />
      <div className="relative">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur grid place-items-center">
            <Wallet size={16} />
          </div>
          <span className="text-[11px] font-bold text-white/90">{badge}</span>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-white/85">{label}</p>
        <p className="mt-0.5 text-lg font-extrabold tabular-nums tracking-tight">{value}</p>
      </div>
    </div>
  )
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 shadow-soft px-3 py-2 text-xs">
      {label && <p className="font-semibold text-ink-900 dark:text-white mb-1">{label}</p>}
      {payload.map((p) => (
        <div key={p.dataKey || p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span className="text-ink-500 dark:text-ink-400 capitalize">{p.name}</span>
          <span className="ml-auto font-semibold text-ink-900 dark:text-white">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

function asArray(d) {
  if (Array.isArray(d)) return d
  if (Array.isArray(d?.data)) return d.data
  if (Array.isArray(d?.results)) return d.results
  return []
}
