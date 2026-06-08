import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title="" size="sm">
      <div className="-mt-3 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 grid place-items-center mb-4">
          <AlertTriangle size={22} />
        </div>
        <h3 className="text-lg font-bold text-ink-900 dark:text-white">{title}</h3>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">{description}</p>
        <div className="mt-6 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="btn-danger flex-1"
          >
            {loading ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
