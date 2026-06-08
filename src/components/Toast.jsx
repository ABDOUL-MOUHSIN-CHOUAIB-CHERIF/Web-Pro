import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

let _id = 0

export function ToastProvider({ children }) {
  const [items, setItems] = useState([])

  const remove = useCallback((id) => {
    setItems((arr) => arr.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (toast) => {
      const id = ++_id
      setItems((arr) => [...arr, { id, type: 'info', duration: 3500, ...toast }])
      setTimeout(() => remove(id), toast.duration ?? 3500)
    },
    [remove]
  )

  const api = {
    success: (message, opts = {}) => push({ ...opts, message, type: 'success' }),
    error: (message, opts = {}) => push({ ...opts, message, type: 'error' }),
    info: (message, opts = {}) => push({ ...opts, message, type: 'info' }),
  }

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2 max-w-[90vw] sm:max-w-sm">
        {items.map((t) => (
          <ToastItem key={t.id} item={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ item, onClose }) {
  const config = {
    success: { Icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', ring: 'border-emerald-200 dark:border-emerald-800/50' },
    error: { Icon: AlertCircle, color: 'text-red-600 dark:text-red-400', ring: 'border-red-200 dark:border-red-800/50' },
    info: { Icon: Info, color: 'text-brand-600 dark:text-brand-400', ring: 'border-brand-200 dark:border-brand-800/50' },
  }
  const { Icon, color, ring } = config[item.type] || config.info
  return (
    <div
      className={`card ${ring} flex items-start gap-3 p-3.5 pr-3 animate-slide-in shadow-soft`}
      role="status"
    >
      <Icon size={18} className={`${color} shrink-0 mt-0.5`} />
      <p className="text-sm text-ink-800 dark:text-ink-100 flex-1">{item.message}</p>
      <button
        onClick={onClose}
        className="p-1 rounded-md text-ink-400 hover:text-ink-700 dark:hover:text-white hover:bg-ink-100 dark:hover:bg-ink-800"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
