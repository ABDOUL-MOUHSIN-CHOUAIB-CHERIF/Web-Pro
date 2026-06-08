import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Tag as TagIcon, Search } from 'lucide-react'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import Spinner, { PageSpinner } from '../components/Spinner'
import { useToast } from '../components/Toast'
import { categoriesApi } from '../services/api'

const ACCENTS = [
  'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300',
  'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300',
]

const accentFor = (id) => ACCENTS[Number(id || 0) % ACCENTS.length]

export default function Categories() {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')

  const [modal, setModal] = useState({ open: false, mode: 'create', name: '', editingId: null })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [confirm, setConfirm] = useState({ open: false, id: null, loading: false })

  const fetchAll = async () => {
    setLoading(true)
    try {
      const { data } = await categoriesApi.list()
      setItems(asArray(data))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const filtered = items.filter((c) =>
    !search || (c.name || '').toLowerCase().includes(search.toLowerCase())
  )

  const onSubmit = async (ev) => {
    ev.preventDefault()
    if (!modal.name.trim()) { setError('Name is required'); return }
    setError('')
    setSubmitting(true)
    try {
      if (modal.mode === 'edit') {
        await categoriesApi.update(modal.editingId, { name: modal.name.trim() })
        toast.success('Category updated')
      } else {
        await categoriesApi.create({ name: modal.name.trim() })
        toast.success('Category created')
      }
      setModal({ open: false, mode: 'create', name: '', editingId: null })
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save category')
    } finally {
      setSubmitting(false)
    }
  }

  const onDelete = async () => {
    setConfirm((c) => ({ ...c, loading: true }))
    try {
      await categoriesApi.remove(confirm.id)
      toast.success('Category deleted')
      setConfirm({ open: false, id: null, loading: false })
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
      setConfirm((c) => ({ ...c, loading: false }))
    }
  }

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-5">
      <div className="card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 min-w-0">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            className="input pl-10"
            placeholder="Search categories…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => { setModal({ open: true, mode: 'create', name: '', editingId: null }); setError('') }}
          className="btn-primary"
        >
          <Plus size={16} /> New category
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={TagIcon}
          title="No categories yet"
          description="Create categories to organize how you spend (e.g. Food, Transport, Bills)."
          action={
            <button
              onClick={() => { setModal({ open: true, mode: 'create', name: '', editingId: null }); setError('') }}
              className="btn-primary"
            >
              <Plus size={16} /> New category
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="card p-5 hover:shadow-soft hover:-translate-y-0.5 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl grid place-items-center shrink-0 ${accentFor(c.id)}`}>
                  <TagIcon size={18} />
                </div>
                <p className="font-semibold text-ink-900 dark:text-white truncate flex-1">{c.name}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-ink-100 dark:border-ink-800 flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => { setModal({ open: true, mode: 'edit', name: c.name, editingId: c.id }); setError('') }}
                  className="btn-ghost !py-1.5 !px-2.5 text-xs"
                >
                  <Pencil size={13} /> Edit
                </button>
                <button
                  onClick={() => setConfirm({ open: true, id: c.id, loading: false })}
                  className="btn-ghost !py-1.5 !px-2.5 text-xs text-red-600 hover:!bg-red-50 dark:hover:!bg-red-950/40"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modal.open}
        onClose={() => setModal({ ...modal, open: false })}
        title={modal.mode === 'edit' ? 'Rename category' : 'New category'}
      >
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div>
            <label className="label">Name</label>
            <div className="relative">
              <TagIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                autoFocus
                className={`input pl-10 ${error ? '!border-red-400' : ''}`}
                placeholder="e.g. Food"
                value={modal.name}
                onChange={(e) => setModal({ ...modal, name: e.target.value })}
              />
            </div>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
            <button type="button" className="btn-secondary flex-1" onClick={() => setModal({ ...modal, open: false })}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? <Spinner size={18} /> : modal.mode === 'edit' ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, id: null, loading: false })}
        onConfirm={onDelete}
        title="Delete this category?"
        description="Expenses tied to this category may need to be re-categorized."
        loading={confirm.loading}
      />
    </div>
  )
}

function asArray(d) {
  if (Array.isArray(d)) return d
  if (Array.isArray(d?.data)) return d.data
  if (Array.isArray(d?.results)) return d.results
  return []
}
