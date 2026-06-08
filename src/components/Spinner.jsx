import { Loader2 } from 'lucide-react'

export default function Spinner({ size = 20, className = '' }) {
  return <Loader2 size={size} className={`animate-spin ${className}`} />
}

export function PageSpinner() {
  return (
    <div className="min-h-[40vh] grid place-items-center text-ink-400">
      <Spinner size={28} />
    </div>
  )
}
