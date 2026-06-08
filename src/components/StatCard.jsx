export default function StatCard({ icon: Icon, label, value, hint, accent = 'brand', trend }) {
  const accents = {
    brand: 'from-brand-500 to-brand-700 text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30',
    green: 'from-emerald-500 to-emerald-700 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30',
    red: 'from-rose-500 to-rose-700 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30',
    amber: 'from-amber-500 to-amber-700 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30',
    violet: 'from-violet-500 to-violet-700 text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30',
  }
  const [gradFrom, gradTo, textCls, textDark, bg, bgDark] = accents[accent].split(' ')

  return (
    <div className="card p-5 sm:p-6 group hover:shadow-soft hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div
          className={`w-11 h-11 rounded-xl ${bg} ${bgDark} grid place-items-center ${textCls} ${textDark} group-hover:scale-105 transition-transform`}
        >
          {Icon && <Icon size={20} strokeWidth={2.2} />}
        </div>
        {trend && (
          <span
            className={`chip ${
              trend.positive
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
            }`}
          >
            {trend.label}
          </span>
        )}
      </div>
      <p className="text-sm text-ink-500 dark:text-ink-400 font-medium">{label}</p>
      <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-ink-900 dark:text-white tracking-tight">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">{hint}</p>}
    </div>
  )
}
