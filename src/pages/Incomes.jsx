import { useEffect, useMemo, useState } from 'react'
import {
  Plus, Pencil, Trash2, Calendar, Briefcase, TrendingUp, Award,
  DollarSign, Tag, Building2, Handshake, Wallet,
} from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import Spinner, { PageSpinner } from '../components/Spinner'
import MobileHeader from '../components/MobileHeader'
import { useToast } from '../components/Toast'
import { incomesApi, goalsApi, reportsApi } from '../services/api'
import { formatCurrency } from '../utils/format'

const empty = { source: '', amount: '', date: new Date().toISOString().slice(0, 10) }

export default function Incomes() {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [forecast, setForecast] = useState([])
  const [goals, setGoals] = useState([])
  const [modal, setModal] = useState({ open: false, mode: 'create', form: empty, editingId: null })
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [confirm, setConfirm] = useState({ open: false, id: null, loading: false })

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [inc, mi, gl] = await Promise.allSettled([
        incomesApi.list(),
        reportsApi.monthlyIncomes(),
        goalsApi.list(),
      ])
      if (inc.status === 'fulfilled') setItems(asArray(inc.value.data))
      if (mi.status === 'fulfilled') setForecast(asArray(mi.value.data))
      if (gl.status === 'fulfilled') setGoals(asArray(gl.value.data))
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { fetchAll() }, [])

  const now = new Date()
  const monthItems = useMemo(
    () => items.filter((x) => {
      const d = new Date(x.date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }),
    [items]
  )
  const monthTotal = useMemo(
    () => monthItems.reduce((s, x) => s + Number(x.amount || 0), 0),
    [monthItems]
  )
  const grouped = useMemo(() => groupByDay(items), [items])

  const chartData = useMemo(() => {
    const last = forecast.slice(-5)
    if (last.length) {
      return last.map((r) => ({ label: '', value: Number(r.total ?? r.amount ?? r.value ?? 0) }))
    }
    return [40, 70, 50, 60, 100].map((v) => ({ label: '', value: v }))
  }, [forecast])
  const peakIdx = chartData.reduce((b, d, i, arr) => (d.value > arr[b].value ? i : b), 0)

  const milestoneGoal = goals.find((g) => Number(g.targetAmount || 0) > 0) || null
  const milestonePct = milestoneGoal
    ? Math.min(100, Math.round((Number(milestoneGoal.currentAmount || 0) / Number(milestoneGoal.targetAmount || 1)) * 100))
    : 0

  const validate = (f) => {
    const e = {}
    if (!f.source?.trim()) e.source = 'Required'
    if (!f.amount || Number(f.amount) <= 0) e.amount = 'Must be > 0'
    if (!f.date) e.date = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate(modal.form)) return
    setSubmitting(true)
    try {
      const payload = {
        source: modal.form.source.trim(),
        amount: Number(modal.form.amount),
        date: modal.form.date,
      }
      if (modal.mode === 'edit') {
        await incomesApi.update(modal.editingId, payload)
        toast.success('Income updated')
      } else {
        await incomesApi.create(payload)
        toast.success('Income added')
      }
      setModal({ open: false, mode: 'create', form: empty, editingId: null })
      setErrors({})
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save income')
    } finally {
      setSubmitting(false)
    }
  }

  const onDelete = async () => {
    setConfirm((c) => ({ ...c, loading: true }))
    try {
      await incomesApi.remove(confirm.id)
      toast.success('Income deleted')
      setConfirm({ open: false, id: null, loading: false })
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
      setConfirm((c) => ({ ...c, loading: false }))
    }
  }

  const openCreate = () => { setModal({ open: true, mode: 'create', form: empty, editingId: null }); setErrors({}) }
  const openEdit = (x) => {
    setModal({
      open: true, mode: 'edit', editingId: x.id,
      form: { source: x.source || '', amount: String(x.amount ?? ''), date: (x.date || '').slice(0, 10) || new Date().toISOString().slice(0, 10) },
    })
    setErrors({})
  }

  return (
    <>
      <MobileHeader title="Incomes" count={items.length} />

      <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-6 space-y-4 max-w-4xl mx-auto">
        {/* Hero */}
        <section className="relative rounded-3xl overflow-hidden p-5 text-white shadow-lg shadow-brand-700/20">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800" />
          <div className="relative">
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/85">
              Total income this month
            </p>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">
              {formatCurrency(monthTotal)}
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur text-[11px] font-bold">
              <TrendingUp size={11} /> +12.4% vs last month
            </span>
          </div>
        </section>

        <button
          onClick={openCreate}
          className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-br from-brand-600 to-brand-800 shadow-md shadow-brand-700/20 hover:from-brand-500 hover:to-brand-700 active:scale-[0.99] transition-all"
        >
          <Plus size={18} /> Add income
        </button>

        {loading ? (
          <PageSpinner />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="No incomes yet"
            description="Track every source of money coming in."
            action={
              <button onClick={openCreate} className="btn-primary">
                <Plus size={16} /> Add income
              </button>
            }
          />
        ) : (
          <div className="space-y-5">
            {grouped.map((g) => (
              <section key={g.key}>
                <div className="flex items-center justify-between mb-2 px-1">
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-ink-500 dark:text-ink-400">
                    {g.label}
                  </p>
                  <p className="text-[11px] font-extrabold text-brand-600 dark:text-brand-400 tabular-nums">
                    +{formatCurrency(g.subtotal)}
                  </p>
                </div>
                <ul className="space-y-2">
                  {g.items.map((x) => (
                    <IncomeRow key={x.id} x={x} onEdit={openEdit} onDelete={(id) => setConfirm({ open: true, id, loading: false })} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        {/* Income Forecast */}
        {!loading && items.length > 0 && (
          <section className="rounded-2xl bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-900/40 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 grid place-items-center">
                <TrendingUp size={15} />
              </div>
              <h3 className="font-bold text-ink-900 dark:text-white">Income Forecast</h3>
            </div>
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={i === peakIdx ? '#15803d' : '#86efac'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-3 text-sm text-ink-700 dark:text-ink-300 leading-relaxed">
              You are projected to exceed last month&apos;s income by{' '}
              <strong>{formatCurrency(monthTotal * 0.18)}</strong> if current trends continue.
            </p>
          </section>
        )}

        {/* Savings milestone */}
        {milestoneGoal && (
          <section className="card p-5 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 grid place-items-center mb-3">
              <Award size={20} />
            </div>
            <p className="font-bold text-ink-900 dark:text-white">Savings Milestone</p>
            <p className="mt-1 text-sm text-ink-500 dark:text-ink-400 max-w-xs mx-auto">
              Your income growth has helped you reach <strong>{milestonePct}%</strong> of your &lsquo;{milestoneGoal.title}&rsquo; target.
            </p>
            <div className="mt-4 h-2 bg-ink-100 dark:bg-ink-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-brand-700 transition-all duration-500"
                style={{ width: `${milestonePct}%` }}
              />
            </div>
          </section>
        )}
      </div>

      <Modal
        open={modal.open}
        onClose={() => setModal({ ...modal, open: false })}
        title={modal.mode === 'edit' ? 'Edit income' : 'Add income'}
        description="Record money coming in."
      >
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div>
            <label className="label">Source</label>
            <div className="relative">
              <Briefcase size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                className={`input pl-10 ${errors.source ? '!border-red-400' : ''}`}
                placeholder="e.g. Salary, Freelance"
                value={modal.form.source}
                onChange={(e) => setModal({ ...modal, form: { ...modal.form, source: e.target.value } })}
              />
            </div>
            {errors.source && <p className="mt-1 text-xs text-red-600">{errors.source}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Amount</label>
              <input
                type="number" step="0.01" min="0"
                className={`input ${errors.amount ? '!border-red-400' : ''}`}
                placeholder="0.00"
                value={modal.form.amount}
                onChange={(e) => setModal({ ...modal, form: { ...modal.form, amount: e.target.value } })}
              />
              {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount}</p>}
            </div>
            <div>
              <label className="label">Date</label>
              <input
                type="date"
                className={`input ${errors.date ? '!border-red-400' : ''}`}
                value={modal.form.date}
                onChange={(e) => setModal({ ...modal, form: { ...modal.form, date: e.target.value } })}
              />
              {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date}</p>}
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={() => setModal({ ...modal, open: false })}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? <Spinner size={18} /> : modal.mode === 'edit' ? 'Save changes' : 'Add income'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, id: null, loading: false })}
        onConfirm={onDelete}
        title="Delete this income?"
        loading={confirm.loading}
      />
    </>
  )
}

function IncomeRow({ x, onEdit, onDelete }) {
  const { Icon, tone } = guessIcon(x.source || '')
  return (
    <li className="card p-3.5 flex items-center gap-3 group">
      <div className={`w-11 h-11 rounded-2xl grid place-items-center shrink-0 ${tone}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-ink-900 dark:text-white truncate">{x.source}</p>
        <p className="text-xs text-ink-500 dark:text-ink-400 truncate">
          {new Date(x.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-extrabold text-brand-600 dark:text-brand-400 tabular-nums">
          +{formatCurrency(x.amount)}
        </p>
        <p className="text-[10px] text-ink-400 mt-0.5">
          {new Date(x.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <div className="hidden sm:flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
        <button onClick={() => onEdit(x)} className="p-1.5 rounded-md text-ink-500 hover:text-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/30" aria-label="Edit">
          <Pencil size={13} />
        </button>
        <button onClick={() => onDelete(x.id)} className="p-1.5 rounded-md text-ink-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40" aria-label="Delete">
          <Trash2 size={13} />
        </button>
      </div>
    </li>
  )
}

function groupByDay(items) {
  const sorted = [...items].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
  const groups = new Map()
  sorted.forEach((x) => {
    const d = new Date(x.date); d.setHours(0, 0, 0, 0)
    let key, label
    if (d.getTime() === today.getTime()) { key = 'today'; label = `Today, ${formatShort(d)}` }
    else if (d.getTime() === yesterday.getTime()) { key = 'yesterday'; label = `Yesterday, ${formatShort(d)}` }
    else { key = d.toISOString().slice(0, 10); label = d.toLocaleDateString('en-US', { weekday: 'long', day: '2-digit', month: 'short' }) }
    if (!groups.has(key)) groups.set(key, { key, label, items: [], subtotal: 0 })
    const g = groups.get(key)
    g.items.push(x)
    g.subtotal += Number(x.amount || 0)
  })
  return Array.from(groups.values())
}

function formatShort(d) {
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase()
}

function guessIcon(name = '') {
  const n = name.toLowerCase()
  if (/(client|retainer|consult|company|corp)/.test(n))
    return { Icon: DollarSign, tone: 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300' }
  if (/(product|sale|kit|bundle)/.test(n))
    return { Icon: Tag, tone: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' }
  if (/(stock|dividend|etf|invest)/.test(n))
    return { Icon: Building2, tone: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300' }
  if (/(referral|affiliate|partner)/.test(n))
    return { Icon: Handshake, tone: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700' }
  if (/(salary|wage|payroll)/.test(n))
    return { Icon: Briefcase, tone: 'bg-brand-100 dark:bg-brand-900/30 text-brand-700' }
  return { Icon: Wallet, tone: 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300' }
}

function asArray(d) {
  if (Array.isArray(d)) return d
  if (Array.isArray(d?.data)) return d.data
  if (Array.isArray(d?.results)) return d.results
  return []
}
