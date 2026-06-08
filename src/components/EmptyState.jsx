import { Inbox } from 'lucide-react'

export default function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="card p-10 text-center">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-ink-100 dark:bg-ink-800 grid place-items-center text-ink-500 dark:text-ink-400 mb-4">
        <Icon size={24} />
      </div>
      <h3 className="text-base font-semibold text-ink-900 dark:text-white">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400 max-w-sm mx-auto">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
