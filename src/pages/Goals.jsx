import { useEffect, useMemo, useState } from 'react'
import {
  Plus, Pencil, Trash2, Target, Plane, Laptop, Home, PiggyBank, Sparkles,
} from 'lucide-react'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import Spinner, { PageSpinner } from '../components/Spinner'
import MobileHeader from '../components/MobileHeader'
import { useToast } from '../components/Toast'
import { goalsApi } from '../services/api'
import { formatCurrency } from '../utils/format'

const empty = { title: '', targetAmount: '', currentAmount: '0' }

export default function Goals() {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [modal, setModal] = useState({ open: false, mode: 'create', form: empty, editingId: null })
  const [addFundsModal, setAddFundsModal] = useState({ open: false, goal: null, amount: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [confirm, setConfirm] = useState({ open: false, id: null, loading: false })

  const fetchAll = async () => {
    setLoading(true)
    try {
      const { data } = await goalsApi.list()
      setItems(asArray(data))
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { fetchAll() }, [])

  const totals = useMemo(() => {
    const target = items.reduce((s, g) => s + Number(g.targetAmount || 0), 0)
    const saved = items.reduce((s, g) => s + Number(g.currentAmount || 0), 0)
    const pct = target > 0 ? Math.round((saved / target) * 100) : 0
    return { target, saved, pct }
  }, [items])

  const validate = (f) => {
    const e = {}
    if (!f.title?.trim()) e.title = 'Required'
    if (!f.targetAmount || Number(f.targetAmount) <= 0) e.targetAmount = 'Must be > 0'
    if (f.currentAmount && Number(f.currentAmount) < 0) e.currentAmount = 'Cannot be negative'
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
        targetAmount: Number(modal.form.targetAmount),
        currentAmount: Number(modal.form.currentAmount || 0),
      }
      if (modal.mode === 'edit') {
        await goalsApi.update(modal.editingId, payload)
        toast.success('Goal updated')
      } else {
        await goalsApi.create(payload)
        toast.success('Goal created')
      }
      setModal({ open: false, mode: 'create', form: empty, editingId: null })
      setErrors({})
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save goal')
    } finally {
      setSubmitting(false)
    }
  }

  const onDelete = async () => {
    setConfirm((c) => ({ ...c, loading: true }))
    try {
      await goalsApi.remove(confirm.id)
      toast.success('Goal deleted')
      setConfirm({ open: false, id: null, loading: false })
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
      setConfirm((c) => ({ ...c, loading: false }))
    }
  }

  const submitAddFunds = async (e) => {
    e.preventDefault()
    const g = addFundsModal.goal
    const add = Number(addFundsModal.amount)
    if (!g || !(add > 0)) return
    setSubmitting(true)
    try {
      await goalsApi.update(g.id, {
        title: g.title,
        targetAmount: Number(g.targetAmount || 0),
        currentAmount: Number(g.currentAmount || 0) + add,
      })
      toast.success('Funds added')
      setAddFundsModal({ open: false, goal: null, amount: '' })
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setSubmitting(false)
    }
  }

  const openCreate = () => { setModal({ open: true, mode: 'create', form: empty, editingId: null }); setErrors({}) }

  return (
    <>
      <MobileHeader title="ExpenseWise" />

      <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-6 space-y-4 max-w-4xl mx-auto">
        {/* Financial Mastery hero */}
        <section className="card p-5 sm:p-6 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-60 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 100% 0%, rgba(16,185,129,0.10) 0, transparent 50%)',
            }}
          />
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink-900 dark:text-white tracking-tight">
              Financial Mastery
            </h2>
            <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
              You&apos;ve saved <strong>{totals.pct}%</strong> of your total target across all{' '}
              <strong>{items.length}</strong> active goals.
            </p>
            <div className="mt-4">
              <div className="flex items-end justify-between gap-3 mb-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                  Total Savings Progress
                </p>
                <p className="font-extrabold text-brand-700 dark:text-brand-300 tabular-nums">
                  {formatCurrency(totals.saved)}{' '}
                  <span className="text-ink-400 font-medium">/ {formatCurrency(totals.target)}</span>
                </p>
              </div>
              <div className="h-2 bg-ink-100 dark:bg-ink-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 to-brand-700 transition-all duration-500"
                  style={{ width: `${totals.pct}%` }}
                />
              </div>
            </div>
            <button
              onClick={openCreate}
              className="mt-5 w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-white bg-gradient-to-br from-brand-600 to-brand-800 shadow-md shadow-brand-700/20 hover:from-brand-500 hover:to-brand-700 active:scale-[0.99] transition-all"
            >
              <Plus size={17} /> New goal
            </button>
          </div>
        </section>

        {loading ? (
          <PageSpinner />
        ) : items.length === 0 ? (
          <EmptyState
            icon={PiggyBank}
            title="No goals yet"
            description="Set a target and watch your savings grow."
            action={
              <button onClick={openCreate} className="btn-primary">
                <Plus size={16} /> Create your first goal
              </button>
            }
          />
        ) : (
          <div className="space-y-3 sm:grid sm:grid-cols-2 sm:gap-3 sm:space-y-0 lg:grid-cols-3">
            {items.map((g) => (
              <GoalCard
                key={g.id}
                g={g}
                onEdit={() => { setModal({ open: true, mode: 'edit', editingId: g.id, form: { title: g.title || '', targetAmount: String(g.targetAmount ?? ''), currentAmount: String(g.currentAmount ?? '0') } }); setErrors({}) }}
                onDelete={() => setConfirm({ open: true, id: g.id, loading: false })}
                onAddFunds={() => setAddFundsModal({ open: true, goal: g, amount: '' })}
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        open={modal.open}
        onClose={() => setModal({ ...modal, open: false })}
        title={modal.mode === 'edit' ? 'Edit goal' : 'New savings goal'}
        description="Set a target amount and track your progress."
      >
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div>
            <label className="label">Title</label>
            <div className="relative">
              <Target size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                className={`input pl-10 ${errors.title ? '!border-red-400' : ''}`}
                placeholder="e.g. Dream home"
                value={modal.form.title}
                onChange={(e) => setModal({ ...modal, form: { ...modal.form, title: e.target.value } })}
              />
            </div>
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Target amount</label>
              <input
                type="number" step="0.01" min="0"
                className={`input ${errors.targetAmount ? '!border-red-400' : ''}`}
                placeholder="0.00"
                value={modal.form.targetAmount}
                onChange={(e) => setModal({ ...modal, form: { ...modal.form, targetAmount: e.target.value } })}
              />
              {errors.targetAmount && <p className="mt-1 text-xs text-red-600">{errors.targetAmount}</p>}
            </div>
            <div>
              <label className="label">Current amount</label>
              <input
                type="number" step="0.01" min="0"
                className={`input ${errors.currentAmount ? '!border-red-400' : ''}`}
                placeholder="0.00"
                value={modal.form.currentAmount}
                onChange={(e) => setModal({ ...modal, form: { ...modal.form, currentAmount: e.target.value } })}
              />
              {errors.currentAmount && <p className="mt-1 text-xs text-red-600">{errors.currentAmount}</p>}
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={() => setModal({ ...modal, open: false })}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? <Spinner size={18} /> : modal.mode === 'edit' ? 'Save changes' : 'Create goal'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={addFundsModal.open}
        onClose={() => setAddFundsModal({ open: false, goal: null, amount: '' })}
        title="Add funds"
        description={addFundsModal.goal ? `Boost your "${addFundsModal.goal.title}" savings.` : ''}
        size="sm"
      >
        <form onSubmit={submitAddFunds} className="space-y-4" noValidate>
          <div>
            <label className="label">Amount</label>
            <input
              type="number" step="0.01" min="0"
              autoFocus
              className="input"
              placeholder="0.00"
              value={addFundsModal.amount}
              onChange={(e) => setAddFundsModal({ ...addFundsModal, amount: e.target.value })}
            />
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
            <button type="button" className="btn-secondary flex-1" onClick={() => setAddFundsModal({ open: false, goal: null, amount: '' })}>
              Cancel
            </button>
            <button type="submit" disabled={submitting || !addFundsModal.amount} className="btn-primary flex-1">
              {submitting ? <Spinner size={18} /> : 'Add funds'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, id: null, loading: false })}
        onConfirm={onDelete}
        title="Delete this goal?"
        loading={confirm.loading}
      />
    </>
  )
}

function GoalCard({ g, onEdit, onDelete, onAddFunds }) {
  const target = Number(g.targetAmount || 0)
  const current = Number(g.currentAmount || 0)
  const pct = target > 0 ? Math.round((current / target) * 100) : 0
  const done = pct >= 100
  const onTrack = pct >= 50 && !done
  const behind = pct < 50

  const { Icon, tone } = guessGoalIcon(g.title || '')

  return (
    <article className="card p-5 flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-11 h-11 rounded-2xl grid place-items-center shrink-0 ${tone}`}>
            <Icon size={18} />
          </div>
          <h3 className="font-extrabold text-ink-900 dark:text-white leading-tight truncate">
            {g.title}
          </h3>
        </div>
        <StatusPill state={done ? 'done' : onTrack ? 'on-track' : 'behind'} />
      </div>

      <p className="text-lg font-extrabold text-ink-900 dark:text-white tabular-nums">
        {formatCurrency(current)}{' '}
        <span className="text-sm text-ink-400 font-medium">/ {formatCurrency(target)}</span>
      </p>

      <div className="mt-3 h-2 bg-ink-100 dark:bg-ink-800 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            done
              ? 'bg-gradient-to-r from-brand-500 to-brand-700'
              : behind
              ? 'bg-gradient-to-r from-rose-400 to-rose-600'
              : 'bg-gradient-to-r from-brand-400 to-brand-600'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className={`font-bold ${done ? 'text-brand-600 dark:text-brand-400' : behind ? 'text-rose-600' : 'text-brand-700 dark:text-brand-300'}`}>
          {pct}% Complete
        </span>
        <span className="text-ink-500 dark:text-ink-400">
          {done ? 'Goal Achieved!' : `${formatCurrency(target - current)} to go`}
        </span>
      </div>

      <div className="mt-4 pt-4 border-t border-ink-100 dark:border-ink-800 flex items-center gap-2">
        {done ? (
          <button className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-bold uppercase tracking-wider bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 hover:bg-brand-200 dark:hover:bg-brand-900/60 transition-colors">
            <Sparkles size={14} /> Redeem
          </button>
        ) : (
          <button
            onClick={onAddFunds}
            className="flex-1 inline-flex items-center justify-center py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-ink-200 dark:border-ink-700 text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors"
          >
            Add funds
          </button>
        )}
        <button onClick={onEdit} className="p-2 rounded-lg text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30" aria-label="Edit">
          <Pencil size={16} />
        </button>
        <button onClick={onDelete} className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40" aria-label="Delete">
          <Trash2 size={16} />
        </button>
      </div>
    </article>
  )
}

function StatusPill({ state }) {
  const cfg = {
    done: { dot: '#10b981', cls: 'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300', label: 'Achieved' },
    'on-track': { dot: '#10b981', cls: 'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300', label: 'On track' },
    behind: { dot: '#f43f5e', cls: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300', label: 'Behind' },
  }[state]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 ${cfg.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  )
}

function guessGoalIcon(name = '') {
  const n = name.toLowerCase()
  if (/(home|house|apartment|downpayment)/.test(n))
    return { Icon: Home, tone: 'bg-brand-100 dark:bg-brand-900/30 text-brand-700' }
  if (/(vacation|travel|trip|holiday|summer)/.test(n))
    return { Icon: Plane, tone: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700' }
  if (/(macbook|laptop|computer|pc|mac)/.test(n))
    return { Icon: Laptop, tone: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700' }
  return { Icon: Target, tone: 'bg-brand-100 dark:bg-brand-900/30 text-brand-700' }
}

function asArray(d) {
  if (Array.isArray(d)) return d
  if (Array.isArray(d?.data)) return d.data
  if (Array.isArray(d?.results)) return d.results
  return []
}
