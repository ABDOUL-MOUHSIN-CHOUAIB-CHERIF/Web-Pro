export const formatCurrency = (value, currency = 'XAF') => {
  const num = Number(value || 0)
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(num)
  } catch {
    return `${num.toLocaleString()} ${currency}`
  }
}

export const formatNumber = (value) =>
  new Intl.NumberFormat('en-US').format(Number(value || 0))

export const formatDate = (date) => {
  if (!date) return '—'
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const formatShortDate = (date) => {
  if (!date) return '—'
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })
}

export const monthLabel = (m) => {
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return labels[Math.max(0, Math.min(11, Number(m) - 1))] || ''
}

export const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || '?'
