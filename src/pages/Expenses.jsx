import { useEffect, useMemo, useState } from 'react'
import {
  Plus, Search, Filter, Calendar, Pencil, Trash2, FileText, TrendingDown,
  Utensils, Car, ShoppingBag, Briefcase, Coffee, Wallet, Receipt,
} from 'lucide-react'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import Spinner, { PageSpinner } from '../components/Spinner'
import MobileHeader from '../components/MobileHeader'
import { useToast } from '../components/Toast'
import { expensesApi, categoriesApi } from '../services/api'
import { formatCurrency } from '../utils/format'

const empty = { title: '', amount: '', description: '', date: new Date().toISOString().slice(0, 10), categoryId: '' }

export default function Expenses() {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [period, setPeriod] = useState('month') // month | all

  const [modal, setModal] = useState({ open: false, mode: 'create', form: empty, editingId: null })
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [confirm, setConfirm] = useState({ open: false, id: null, loading: false })

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [ex, cats] = await Promise.allSettled([expensesApi.list(), categoriesApi.list()])
      if (ex.status === 'fulfilled') setItems(asArray(ex.value.data))
      if (cats.status === 'fulfilled') setCategories(asArray(cats.value.data))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const now = new Date()
  const filtered = useMemo(() => {
    return items.filter((x) => {
      if (search) {
        const s = search.toLowerCase()
        if (!`${x.title || ''} ${x.description || ''}`.toLowerCase().includes(s)) return false
      }
      if (categoryFilter !== 'all' && String(x.categoryId ?? x.category?.id) !== String(categoryFilter)) return false
      if (period === 'month') {
        const d = new Date(x.date)
        if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return false
      }
      return true
    }).sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
  }, [items, search, categoryFilter, period])

  const grouped = useMemo(() => groupByDay(filtered), [filtered])

  const monthlyTotal = useMemo(
    () => filtered.reduce((s, x) => s + Number(x.amount || 0), 0),
    [filtered]
  )

  const highest = useMemo(() => {
    if (!filtered.length) return null
    const totals = new Map()
    filtered.forEach((x) => {
      const id = x.categoryId ?? x.category?.id ?? '0'
      totals.set(id, (totals.get(id) || 0) + Number(x.amount || 0))
    })
    let bestId = null, bestVal = 0, sum = 0
    totals.forEach((v, k) => { sum += v; if (v > bestVal) { bestVal = v; bestId = k } })
    const name = categories.find((c) => String(c.id) === String(bestId))?.name || 'Other'
    const pct = sum > 0 ? Math.round((bestVal / sum) * 100) : 0
    return { name, pct, amount: bestVal }
  }, [filtered, categories])

  const validate = (f) => {
    const e = {}
    if (!f.title?.trim()) e.title = 'Required'
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
        title: modal.form.title.trim(),
        amount: Number(modal.form.amount),
        description: modal.form.description || '',
        date: modal.form.date,
        categoryId: modal.form.categoryId ? Number(modal.form.categoryId) : null,
      }
      if (modal.mode === 'edit') {
        await expensesApi.update(modal.editingId, payload)
        toast.success('Expense updated')
      } else {
        await expensesApi.create(payload)
        toast.success('Expense added')
      }
      setModal({ open: false, mode: 'create', form: empty, editingId: null })
      setErrors({})
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save expense')
    } finally {
      setSubmitting(false)
    }
  }

  const onDelete = async () => {
    setConfirm((c) => ({ ...c, loading: true }))
    try {
      await expensesApi.remove(confirm.id)
      toast.success('Expense deleted')
      setConfirm({ open: false, id: null, loading: false })
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
      setConfirm((c) => ({ ...c, loading: false }))
    }
  }

  const openEdit = (x) => {
    setModal({
      open: true,
      mode: 'edit',
      editingId: x.id,
      form: {
        title: x.title || '',
        amount: String(x.amount ?? ''),
        description: x.description || '',
        date: (x.date || '').slice(0, 10) || new Date().toISOString().slice(0, 10),
        categoryId: x.categoryId ?? x.category?.id ?? '',
      },
    })
    setErrors({})
  }

  const openCreate = () => {
    setModal({ open: true, mode: 'create', form: empty, editingId: null })
    setErrors({})
  }

  return (
    <>
      <MobileHeader
        title="Expenses"
        count={items.length}
        rightExtras={
          <button
            onClick={openCreate}
            className="w-10 h-10 rounded-xl bg-brand-700 text-white grid place-items-center shadow-md shadow-brand-700/20 hover:bg-brand-600 active:scale-95 transition-all"
            aria-label="Add expense"
          >
            <Plus size={18} />
          </button>
        }
      />

      <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-6 space-y-4 max-w-4xl mx-auto">
        {/* Filter chips */}
        <div className="flex items-center gap-2 overflow-x-auto -mx-1 px-1 pb-1 scrollbar-thin">
          <button className="w-10 h-10 shrink-0 rounded-full bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 grid place-items-center text-ink-600 hover:bg-ink-50">
            <Search size={16} />
          </button>
          <select
            className="shrink-0 px-3.5 py-2 rounded-full border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 text-sm font-semibold text-ink-700 dark:text-ink-300 appearance-none pr-8 bg-no-repeat focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              backgroundImage: "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' stroke='%2364748b' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
              backgroundPosition: 'right 0.75rem center',
              backgroundSize: '14px',
            }}
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button
            onClick={() => setPeriod(period === 'month' ? 'all' : 'month')}
            className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 text-sm font-semibold text-ink-700 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800"
          >
            <Calendar size={14} />
            {period === 'month' ? 'This Month' : 'All time'}
          </button>
          <input
            type="text"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[120px] px-3.5 py-2 rounded-full border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </div>

        {/* Empty/loading/list */}
        {loading ? (
          <PageSpinner />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No expenses yet"
            description={items.length === 0 ? 'Tap the + button to log your first expense.' : 'No matches for your filters.'}
            action={
              <button onClick={openCreate} className="btn-primary">
                <Plus size={16} /> Add expense
              </button>
            }
          />
        ) : (
          <div className="space-y-5">
            {grouped.map((g) => (
              <section key={g.key}>
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-ink-500 dark:text-ink-400 mb-2 px-1">
                  {g.label}
                </p>
                <ul className="space-y-2">
                  {g.items.map((x) => (
                    <ExpenseRow key={x.id} x={x} onEdit={openEdit} onDelete={(id) => setConfirm({ open: true, id, loading: false })} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        {/* Monthly spending hero */}
        {!loading && filtered.length > 0 && (
          <section className="relative rounded-3xl overflow-hidden p-5 text-white shadow-lg shadow-brand-700/20 mt-2">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900" />
            <div
              className="absolute right-2 top-2 text-white/15"
              aria-hidden="true"
            >
              <TrendingDown size={120} strokeWidth={1.2} />
            </div>
            <div className="relative">
              <p className="text-[11px] font-bold uppercase tracking-wider text-white/80">
                Monthly Spending
              </p>
              <p className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">
                {formatCurrency(monthlyTotal)}
              </p>
              <span className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur text-[11px] font-bold">
                ↑ 12% from last month
              </span>
            </div>
          </section>
        )}

        {/* Highest category */}
        {highest && (
          <section className="card p-5 flex items-center gap-5">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                Highest Category
              </p>
              <p className="mt-1 text-xl font-extrabold text-ink-900 dark:text-white tracking-tight">
                {highest.name}
              </p>
              <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
                {highest.pct}% of total expenses
              </p>
            </div>
            <DonutGauge pct={highest.pct} />
          </section>
        )}
      </div>

      <Modal
        open={modal.open}
        onClose={() => setModal({ ...modal, open: false })}
        title={modal.mode === 'edit' ? 'Edit expense' : 'Add expense'}
        description="Record where your money went."
      >
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div>
            <label className="label">Title</label>
            <div className="relative">
              <FileText size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                className={`input pl-10 ${errors.title ? '!border-red-400' : ''}`}
                placeholder="e.g. Groceries"
                value={modal.form.title}
                onChange={(e) => setModal({ ...modal, form: { ...modal.form, title: e.target.value } })}
              />
            </div>
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
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
          <div>
            <label className="label">Category</label>
            <select
              className="input"
              value={modal.form.categoryId}
              onChange={(e) => setModal({ ...modal, form: { ...modal.form, categoryId: e.target.value } })}
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Description (optional)</label>
            <textarea
              rows={3}
              className="input resize-none"
              placeholder="Notes about this expense…"
              value={modal.form.description}
              onChange={(e) => setModal({ ...modal, form: { ...modal.form, description: e.target.value } })}
            />
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={() => setModal({ ...modal, open: false })}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? <Spinner size={18} /> : modal.mode === 'edit' ? 'Save changes' : 'Add expense'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, id: null, loading: false })}
        onConfirm={onDelete}
        title="Delete this expense?"
        description="This will permanently remove the expense from your records."
        loading={confirm.loading}
      />

      {/* Floating + button on mobile */}
      <button
        onClick={openCreate}
        className="lg:hidden fixed bottom-20 right-5 z-20 w-14 h-14 rounded-full bg-brand-700 text-white grid place-items-center shadow-xl shadow-brand-800/40 hover:bg-brand-600 active:scale-95 transition-all"
        aria-label="Add expense"
      >
        <Plus size={22} />
      </button>
    </>
  )
}

function ExpenseRow({ x, onEdit, onDelete }) {
  const { Icon, tone } = guessIcon(x.title || '')
  return (
    <li className="card p-3.5 flex items-center gap-3 group">
      <div className={`w-11 h-11 rounded-2xl grid place-items-center shrink-0 ${tone}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-ink-900 dark:text-white truncate">{x.title}</p>
        {x.description && (
          <p className="text-xs text-ink-500 dark:text-ink-400 truncate">{x.description}</p>
        )}
      </div>
      <div className="text-right shrink-0">
        <p className="font-extrabold text-rose-600 dark:text-rose-400 tabular-nums">
          −{formatCurrency(x.amount)}
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

function DonutGauge({ pct }) {
  const r = 32
  const c = 2 * Math.PI * r
  const dash = (pct / 100) * c
  return (
    <div className="relative shrink-0">
      <svg width="84" height="84" viewBox="0 0 84 84">
        <circle cx="42" cy="42" r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
        <circle
          cx="42" cy="42" r={r}
          fill="none"
          stroke="#15803d"
          strokeWidth="8"
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="round"
          transform="rotate(-90 42 42)"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="text-sm font-extrabold text-ink-900 dark:text-white">{pct}%</span>
      </div>
    </div>
  )
}

function groupByDay(items) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
  const groups = new Map()
  items.forEach((x) => {
    const d = new Date(x.date); d.setHours(0, 0, 0, 0)
    let key, label
    if (d.getTime() === today.getTime()) { key = 'today'; label = 'Today' }
    else if (d.getTime() === yesterday.getTime()) { key = 'yesterday'; label = 'Yesterday' }
    else { key = d.toISOString().slice(0, 10); label = d.toLocaleDateString('en-US', { weekday: 'long', day: '2-digit', month: 'short' }) }
    if (!groups.has(key)) groups.set(key, { key, label, items: [] })
    groups.get(key).items.push(x)
  })
  return Array.from(groups.values())
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
  if (/(rent|office)/.test(n))
    return { Icon: Briefcase, tone: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700' }
  return { Icon: Wallet, tone: 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300' }
}

function asArray(d) {
  if (Array.isArray(d)) return d
  if (Array.isArray(d?.data)) return d.data
  if (Array.isArray(d?.results)) return d.results
  return []
}
