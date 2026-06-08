import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, ArrowLeft, Wallet2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import Spinner from '../components/Spinner'

export default function Register() {
  const { register, isAuthenticated } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [agreed, setAgreed] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const strength = useMemo(() => scorePassword(form.password), [form.password])

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await register({ name: form.name.trim(), email: form.email, password: form.password })
      toast.success('Account created — welcome!')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-cyan-50 dark:from-ink-950 dark:via-ink-900 dark:to-ink-950">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-ink-900/80 backdrop-blur-xl border-b border-ink-200 dark:border-ink-800">
        <div className="max-w-md mx-auto flex items-center gap-2 px-4 py-3.5">
          <Link
            to="/login"
            className="p-1.5 -ml-1.5 rounded-lg text-brand-700 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-900/30"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-400 to-brand-700 grid place-items-center text-white">
              <Wallet2 size={15} strokeWidth={2.6} />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-brand-800 dark:text-brand-200">
              Expense<span className="text-brand-500">Wise</span>
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 sm:px-6 pt-6 pb-12">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-900 dark:text-white tracking-tight">
            Create account
          </h1>
          <p className="mt-2 text-sm text-ink-500 dark:text-ink-400 max-w-xs mx-auto">
            Join ExpenseWise to manage your finances with precision and clarity.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="card p-5 sm:p-6 space-y-5"
          noValidate
        >
          <FieldRow
            id="name"
            label="Full Name"
            Icon={User}
            placeholder="John Doe"
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
          />
          <FieldRow
            id="email"
            label="Email Address"
            Icon={Mail}
            placeholder="name@company.com"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
          />

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-ink-800 dark:text-ink-200 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-ink-50 dark:bg-ink-800/50 border border-ink-200 dark:border-ink-700 focus:border-brand-500 focus:bg-white dark:focus:bg-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-ink-900 dark:text-white placeholder-ink-400"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <StrengthMeter score={strength.score} />
            {form.password && (
              <p className="mt-1 text-xs font-bold text-ink-600 dark:text-ink-400">
                Security: <span style={{ color: strength.color }}>{strength.label}</span>
              </p>
            )}
          </div>

          <FieldRow
            id="confirm"
            label="Confirm Password"
            Icon={Lock}
            type="password"
            placeholder="••••••••"
            value={form.confirm}
            onChange={(v) => setForm({ ...form, confirm: v })}
          />

          <label className="flex items-start gap-3 text-sm text-ink-600 dark:text-ink-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-brand-600"
            />
            <span>
              I agree to the{' '}
              <button type="button" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
                Terms of Service
              </button>{' '}
              and{' '}
              <button type="button" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
                Privacy Policy
              </button>
              .
            </span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold uppercase tracking-wider bg-gradient-to-br from-brand-600 to-brand-800 shadow-lg shadow-brand-600/20 hover:shadow-brand-600/30 hover:from-brand-500 hover:to-brand-700 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none transition-all"
          >
            {submitting ? <Spinner size={18} /> : 'Create Account'}
          </button>

          <p className="text-center text-sm text-ink-500 dark:text-ink-400 pt-1 border-t border-ink-100 dark:border-ink-800 -mx-1 px-1 pt-4">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

function FieldRow({ id, label, Icon, type = 'text', placeholder, value, onChange }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-ink-800 dark:text-ink-200 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Icon size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          id={id}
          type={type}
          className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-ink-50 dark:bg-ink-800/50 border border-ink-200 dark:border-ink-700 focus:border-brand-500 focus:bg-white dark:focus:bg-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-ink-900 dark:text-white placeholder-ink-400"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  )
}

function StrengthMeter({ score }) {
  return (
    <div className="mt-2 grid grid-cols-3 gap-1">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-1.5 rounded-full bg-ink-200 dark:bg-ink-800 overflow-hidden"
        >
          <div
            className={`h-full transition-all duration-300 ${
              i <= score
                ? score === 1
                  ? 'bg-rose-500'
                  : score === 2
                  ? 'bg-amber-500'
                  : 'bg-brand-500'
                : ''
            }`}
            style={{ width: i <= score ? '100%' : '0' }}
          />
        </div>
      ))}
    </div>
  )
}

function scorePassword(pw) {
  if (!pw) return { score: 0, label: '—', color: '#94a3b8' }
  let s = 0
  if (pw.length >= 6) s++
  if (pw.length >= 10 && /[A-Z]/.test(pw) && /[0-9]/.test(pw)) s++
  if (pw.length >= 12 && /[^A-Za-z0-9]/.test(pw)) s++
  const map = [
    { label: 'Weak', color: '#f43f5e' },
    { label: 'Weak', color: '#f43f5e' },
    { label: 'Medium', color: '#f59e0b' },
    { label: 'Strong', color: '#10b981' },
  ]
  return { score: s, ...map[s] }
}
