import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Wallet2, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import Spinner from '../components/Spinner'

export default function Login() {
  const { login, isAuthenticated } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) return <Navigate to={from === '/' ? '/dashboard' : from} replace />

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await login(form)
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell>
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 grid place-items-center text-white shadow-lg">
            <Wallet2 size={24} strokeWidth={2.4} />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-ink-900 dark:text-white">
            Expense<span className="text-brand-500">Wise</span>
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink-900 dark:text-white tracking-tight">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
          Log in to manage your money intelligently
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <div>
          <label htmlFor="email" className="block text-[11px] font-bold uppercase tracking-wider text-ink-700 dark:text-ink-300 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              id="email"
              type="text"
              autoComplete="email"
              className="w-full pl-10 pr-3.5 py-3.5 rounded-xl bg-ink-100/70 dark:bg-ink-800/50 border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-ink-900 dark:text-white"
              placeholder="name@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="block text-[11px] font-bold uppercase tracking-wider text-ink-700 dark:text-ink-300">
              Password
            </label>
            <button type="button" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline">
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              id="password"
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              className="w-full pl-10 pr-10 py-3.5 rounded-xl bg-ink-100/70 dark:bg-ink-800/50 border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-ink-900 dark:text-white"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink-400 hover:text-ink-700 dark:hover:text-ink-200"
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold bg-gradient-to-br from-brand-600 to-brand-800 shadow-lg shadow-brand-600/20 hover:shadow-brand-600/30 hover:from-brand-500 hover:to-brand-700 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none transition-all"
        >
          {submitting ? <Spinner size={18} /> : <>Log in <ArrowRight size={16} /></>}
        </button>

        <div className="flex items-center gap-3 py-2">
          <span className="flex-1 h-px bg-ink-200 dark:bg-ink-800" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
            Or continue with
          </span>
          <span className="flex-1 h-px bg-ink-200 dark:bg-ink-800" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <SocialButton brand="google" />
          <SocialButton brand="github" />
        </div>

        <p className="text-center text-sm text-ink-500 dark:text-ink-400 pt-2">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
            Sign up
          </Link>
        </p>
      </form>

      <div className="mt-10 flex items-center justify-center gap-1.5 text-ink-400 text-[11px] font-semibold uppercase tracking-wider">
        <ShieldCheck size={14} /> Secure Cloud Encryption
      </div>
    </AuthShell>
  )
}

function SocialButton({ brand }) {
  const click = (e) => {
    e.preventDefault()
  }
  return (
    <button
      type="button"
      onClick={click}
      className="inline-flex items-center justify-center gap-2 py-3 rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 text-ink-800 dark:text-ink-100 font-semibold text-sm hover:bg-ink-50 dark:hover:bg-ink-800 active:scale-[0.98] transition-all"
    >
      {brand === 'google' ? <GoogleIcon /> : <GithubIcon />}
      {brand === 'google' ? 'Google' : 'GitHub'}
    </button>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.85 0-5.27-1.92-6.13-4.51H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.87 14.13a6.6 6.6 0 0 1 0-4.26V7.03H2.18a11 11 0 0 0 0 9.94l3.69-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.03l3.69 2.84C6.73 7.3 9.15 5.38 12 5.38Z" />
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.1.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.15-1.1-1.46-1.1-1.46-.9-.62.07-.6.07-.6 1 .07 1.52 1.03 1.52 1.03.9 1.52 2.34 1.08 2.91.82.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.94 0-1.1.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.3 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.69-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.59.69.49A10 10 0 0 0 12 2Z" />
    </svg>
  )
}

export function AuthShell({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-cyan-50 dark:from-ink-950 dark:via-ink-900 dark:to-ink-950 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md card p-6 sm:p-8">
        {children}
      </div>
    </div>
  )
}
