import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Wallet2, ArrowRight, Menu, X, ChevronRight, BarChart3, FileText,
  Brain, Target, LineChart,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const MINT = '#3DD9A4'

export default function Landing() {
  const { isAuthenticated } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#0a0f17] text-white font-sans antialiased">
      <Nav menuOpen={menuOpen} setMenuOpen={setMenuOpen} isAuthenticated={isAuthenticated} />

      <Hero />
      <PressStrip />
      <Features />
      <Visualized />
      <CtaCard isAuthenticated={isAuthenticated} />
      <Footer />
    </div>
  )
}

/* ───────── Nav ───────── */
function Nav({ menuOpen, setMenuOpen, isAuthenticated }) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0a0f17]/80 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl grid place-items-center text-[#0a0f17] shadow-lg"
            style={{ background: MINT, boxShadow: `0 0 24px ${MINT}33` }}
          >
            <Wallet2 size={20} strokeWidth={2.5} />
          </div>
          <span className="text-lg font-extrabold tracking-tight">ExpenseWise</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8 text-sm text-slate-300">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#visualized" className="hover:text-white transition-colors">Visualized</a>
          <a href="#cta" className="hover:text-white transition-colors">Get Started</a>
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-[#0a0f17] hover:brightness-110 transition-all"
              style={{ background: MINT }}
            >
              Open Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="px-3 py-2 text-sm font-semibold text-slate-200 hover:text-white">
                Log in
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-[#0a0f17] hover:brightness-110 transition-all"
                style={{ background: MINT }}
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMenuOpen(true)}
          className="lg:hidden p-2 rounded-lg text-slate-200 hover:bg-white/5"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity ${
          menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
        <div
          className={`absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-[#0d1320] border-l border-white/5 p-6 transition-transform duration-300 ${
            menuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between mb-8">
            <span className="text-lg font-extrabold">Menu</span>
            <button onClick={() => setMenuOpen(false)} className="p-2 rounded-lg hover:bg-white/5" aria-label="Close menu">
              <X size={20} />
            </button>
          </div>
          <nav className="flex flex-col gap-1">
            {[
              ['#features', 'Features'],
              ['#visualized', 'Visualized'],
              ['#cta', 'Get Started'],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="px-3 py-3 rounded-xl text-slate-200 hover:bg-white/5 hover:text-white"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="mt-8 space-y-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="block text-center py-3 rounded-xl text-sm font-bold text-[#0a0f17]"
                style={{ background: MINT }}
              >
                Open Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block text-center py-3 rounded-xl text-sm font-semibold border border-white/15 hover:bg-white/5"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="block text-center py-3 rounded-xl text-sm font-bold text-[#0a0f17]"
                  style={{ background: MINT }}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

/* ───────── Hero ───────── */
function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage:
            `radial-gradient(circle at 50% 0%, ${MINT}22 0, transparent 50%), radial-gradient(circle at 80% 30%, ${MINT}11 0, transparent 40%)`,
        }}
      />
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 lg:pt-32 pb-16 sm:pb-20 text-center">
        <span
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold"
          style={{ background: `${MINT}1a`, color: MINT, border: `1px solid ${MINT}33` }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: MINT }} />
          Intelligent Finance Management
        </span>

        <h1 className="mt-6 text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
          Master Your <br className="sm:hidden" />Money with{' '}
          <span style={{ color: MINT }}>Precision</span>
        </h1>

        <p className="mt-5 max-w-xl mx-auto text-sm sm:text-base text-slate-400 leading-relaxed">
          ExpenseWise combines intelligent tracking with AI insights to help you save more and spend smarter.
          Take control of your financial destiny today.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-bold text-[#0a0f17] shadow-lg hover:brightness-110 active:scale-[0.98] transition-all"
            style={{ background: MINT, boxShadow: `0 10px 30px -10px ${MINT}aa` }}
          >
            Get Started
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="mt-10 flex items-center justify-center gap-3">
          <div className="flex -space-x-2">
            {[
              ['from-fuchsia-400 to-pink-600', 'A'],
              ['from-amber-300 to-orange-500', 'M'],
              ['from-sky-400 to-indigo-600', 'K'],
            ].map(([grad, ch], i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full bg-gradient-to-br ${grad} ring-2 ring-[#0a0f17] grid place-items-center text-[11px] font-bold text-white`}
              >
                {ch}
              </div>
            ))}
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            <span className="font-bold text-white">10,000+</span> wise savers
          </p>
        </div>
      </div>
    </section>
  )
}

/* ───────── Press strip ───────── */
function PressStrip() {
  const logos = ['Forbes', 'TechCrunch', 'Wired', 'Bloomberg', 'WSJ']
  return (
    <section className="border-y border-white/5 bg-white/[0.015]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
        {logos.map((l) => (
          <span key={l} className="text-sm sm:text-base font-bold text-slate-500 tracking-tight">
            {l}
          </span>
        ))}
      </div>
    </section>
  )
}

/* ───────── Features ───────── */
function Features() {
  const items = [
    {
      Icon: LineChart,
      title: 'Smart Tracking',
      text: 'Automatically categorize transactions and scan receipts with near-perfect accuracy using OCR.',
    },
    {
      Icon: Brain,
      title: 'AI Insights',
      text: 'Get personalized nudges and spending forecasts driven by machine learning tailored to your lifestyle.',
    },
    {
      Icon: Target,
      title: 'Goal Mastery',
      text: 'Set complex financial goals and track your progress with dynamic roadmaps and automated saving rules.',
    },
    {
      Icon: BarChart3,
      title: 'Deep Analytics',
      text: 'Visualize your net worth, cash flow, and asset allocation with professional-grade charting tools.',
    },
  ]

  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Precision Tools for Wealth
          </h2>
          <p className="mt-4 text-slate-400 text-sm sm:text-base">
            Everything you need to visualize, manage, and grow your capital in one unified interface.
          </p>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {items.map(({ Icon, title, text }) => (
            <div
              key={title}
              className="group p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 hover:bg-white/[0.05] transition-all hover:-translate-y-1 duration-300"
            >
              <div
                className="w-11 h-11 rounded-xl grid place-items-center mb-4 group-hover:scale-110 transition-transform"
                style={{ background: `${MINT}1a`, color: MINT, border: `1px solid ${MINT}33` }}
              >
                <Icon size={20} strokeWidth={2.2} />
              </div>
              <h3 className="font-bold text-white text-base mb-1.5">{title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ───────── Visualized ───────── */
function Visualized() {
  return (
    <section id="visualized" className="py-20 sm:py-28 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Your Entire Financial Life,{' '}
            <span className="relative inline-block">
              <span style={{ color: MINT }}>Visualized</span>
              <span
                className="absolute left-0 right-0 -bottom-1 h-1 rounded-full"
                style={{ background: MINT }}
              />
            </span>
          </h2>

          <ul className="mt-10 space-y-7">
            <li className="flex gap-4">
              <div
                className="w-11 h-11 rounded-xl grid place-items-center shrink-0"
                style={{ background: `${MINT}1a`, color: MINT, border: `1px solid ${MINT}33` }}
              >
                <BarChart3 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white">Unified Dashboard</h3>
                <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">
                  See all accounts, upcoming bills, and today&apos;s spending in one glance on your dashboard.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <div
                className="w-11 h-11 rounded-xl grid place-items-center shrink-0"
                style={{ background: `${MINT}1a`, color: MINT, border: `1px solid ${MINT}33` }}
              >
                <FileText size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white">Comprehensive Reports</h3>
                <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">
                  Drill down into specific categories and trends over time with our high-detail reports.
                </p>
              </div>
            </li>
          </ul>
        </div>

        <PhoneMockup />
      </div>
    </section>
  )
}

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[300px]">
      <div
        className="absolute -inset-8 rounded-[3rem] blur-3xl opacity-30 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${MINT} 0, transparent 70%)` }}
      />
      <div className="relative rounded-[2.2rem] p-2 bg-gradient-to-b from-white/10 to-white/0 border border-white/10 shadow-2xl">
        <div className="rounded-[1.9rem] bg-[#0a0f17] border border-white/10 overflow-hidden">
          <div className="h-5 grid place-items-center">
            <div className="w-16 h-1 rounded-full bg-white/20" />
          </div>
          <div className="px-4 pb-5 pt-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400">Good morning</p>
                <p className="text-sm font-bold text-white">Welcome back</p>
              </div>
              <div
                className="w-7 h-7 rounded-full grid place-items-center text-[11px] font-bold text-[#0a0f17]"
                style={{ background: MINT }}
              >
                E
              </div>
            </div>

            <div
              className="rounded-2xl p-4 border"
              style={{
                background: `linear-gradient(135deg, ${MINT}33, ${MINT}11)`,
                borderColor: `${MINT}33`,
              }}
            >
              <p className="text-[10px] text-slate-300">Total balance</p>
              <p className="text-xl font-extrabold text-white mt-0.5">$12,480.50</p>
              <div className="mt-3 flex items-center gap-2 text-[10px]">
                <span style={{ color: MINT }}>↑ 12.4%</span>
                <span className="text-slate-400">this month</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Income', val: '$3.2k', color: MINT },
                { label: 'Spent', val: '$1.4k', color: '#f87171' },
              ].map((m) => (
                <div
                  key={m.label}
                  className="rounded-xl p-2.5 bg-white/[0.04] border border-white/5"
                >
                  <p className="text-[9px] text-slate-400">{m.label}</p>
                  <p className="text-sm font-bold mt-0.5" style={{ color: m.color }}>
                    {m.val}
                  </p>
                </div>
              ))}
            </div>

            <div>
              <p className="text-[10px] font-semibold text-slate-400 mb-2">This week</p>
              <div className="flex items-end gap-1.5 h-16">
                {[40, 65, 30, 80, 55, 90, 50].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-md"
                    style={{
                      height: `${h}%`,
                      background:
                        i === 5
                          ? MINT
                          : `linear-gradient(to top, ${MINT}33, ${MINT}11)`,
                    }}
                  />
                ))}
              </div>
            </div>

            <ul className="space-y-1.5">
              {[
                { name: 'Coffee', sub: 'Today', amt: '−$4.50' },
                { name: 'Salary', sub: 'Yesterday', amt: '+$2,800', positive: true },
                { name: 'Groceries', sub: 'Mon', amt: '−$72.30' },
              ].map((t, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-lg px-2 py-1.5 bg-white/[0.03]"
                >
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-white truncate">{t.name}</p>
                    <p className="text-[9px] text-slate-400">{t.sub}</p>
                  </div>
                  <p
                    className="text-[11px] font-bold"
                    style={{ color: t.positive ? MINT : '#f87171' }}
                  >
                    {t.amt}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ───────── CTA card ───────── */
function CtaCard({ isAuthenticated }) {
  return (
    <section id="cta" className="py-20 sm:py-28">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <div
          className="rounded-3xl p-8 sm:p-14 text-center relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${MINT}, #1FAE82)`,
            boxShadow: `0 30px 80px -20px ${MINT}55`,
          }}
        >
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.5) 0, transparent 40%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.4) 0, transparent 40%)',
            }}
          />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#06291f]">
              Start Your <br className="sm:hidden" />Journey Today
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#06291f]/80 max-w-md mx-auto">
              Join 50,000+ others who have taken the first step toward financial freedom with ExpenseWise.
            </p>

            <div className="mt-8 flex flex-col gap-3 max-w-sm mx-auto">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold bg-white text-[#06291f] hover:bg-white/90 active:scale-[0.98] transition-all"
                >
                  Go to Dashboard <ChevronRight size={16} />
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center py-3.5 rounded-2xl text-sm font-bold bg-white text-[#06291f] hover:bg-white/90 active:scale-[0.98] transition-all"
                  >
                    Log In To Your Account
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center py-3.5 rounded-2xl text-sm font-bold text-white border-2 border-white/40 hover:bg-white/10 active:scale-[0.98] transition-all"
                  >
                    Create Free Account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ───────── Footer ───────── */
function Footer() {
  const cols = [
    { title: 'Product', links: ['Features', 'Security', 'Dashboard', 'Reports'] },
    { title: 'Company', links: ['About Us', 'Careers', 'Privacy Policy', 'Terms of Service'] },
    { title: 'Get Started', links: ['Login', 'Register', 'Support', 'Help Center'] },
  ]
  return (
    <footer className="border-t border-white/5 bg-white/[0.015]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div
                className="w-9 h-9 rounded-xl grid place-items-center text-[#0a0f17]"
                style={{ background: MINT }}
              >
                <Wallet2 size={20} strokeWidth={2.5} />
              </div>
              <span className="text-lg font-extrabold tracking-tight">ExpenseWise</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              The ultimate financial companion for precision. Built for clarity, powered by intelligence.
            </p>
            <div className="flex items-center gap-2 mt-5">
              {[
                { label: 'Twitter', path: 'M22 5.92a8.2 8.2 0 0 1-2.36.65 4.12 4.12 0 0 0 1.8-2.27 8.2 8.2 0 0 1-2.6 1 4.1 4.1 0 0 0-7 3.74A11.65 11.65 0 0 1 3.4 4.86a4.1 4.1 0 0 0 1.27 5.48 4.07 4.07 0 0 1-1.86-.5v.05A4.1 4.1 0 0 0 6.1 13.9a4.1 4.1 0 0 1-1.85.07 4.1 4.1 0 0 0 3.83 2.85A8.23 8.23 0 0 1 2 18.55a11.6 11.6 0 0 0 6.29 1.84c7.55 0 11.68-6.25 11.68-11.68v-.53A8.3 8.3 0 0 0 22 5.92Z' },
                { label: 'Facebook', path: 'M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.5-3.9 3.78-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12Z' },
                { label: 'Instagram', path: 'M12 2.2c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.42.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.43.36 1.06.42 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.42 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.43.16-1.06.36-2.23.42-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.42a3.72 3.72 0 0 1-1.38-.9 3.72 3.72 0 0 1-.9-1.38c-.16-.43-.36-1.06-.42-2.23C2.2 15.58 2.2 15.2 2.2 12s.01-3.58.07-4.85c.05-1.17.25-1.8.42-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.43-.16 1.06-.36 2.23-.42C8.42 2.2 8.8 2.2 12 2.2Zm0 1.8c-3.14 0-3.5.01-4.74.07-1.07.05-1.65.23-2.04.38-.51.2-.88.44-1.27.83a3.4 3.4 0 0 0-.83 1.27c-.15.39-.33.97-.38 2.04-.06 1.24-.07 1.6-.07 4.74s.01 3.5.07 4.74c.05 1.07.23 1.65.38 2.04.2.51.44.88.83 1.27.39.39.76.63 1.27.83.39.15.97.33 2.04.38 1.24.06 1.6.07 4.74.07s3.5-.01 4.74-.07c1.07-.05 1.65-.23 2.04-.38.51-.2.88-.44 1.27-.83.39-.39.63-.76.83-1.27.15-.39.33-.97.38-2.04.06-1.24.07-1.6.07-4.74s-.01-3.5-.07-4.74c-.05-1.07-.23-1.65-.38-2.04-.2-.51-.44-.88-.83-1.27a3.4 3.4 0 0 0-1.27-.83c-.39-.15-.97-.33-2.04-.38-1.24-.06-1.6-.07-4.74-.07Zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8Zm0 1.8a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2Zm5.1-2.05a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3Z' },
                { label: 'LinkedIn', path: 'M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14ZM8.34 18.34V9.7H5.67v8.64h2.67Zm-1.33-9.83a1.55 1.55 0 1 0 0-3.1 1.55 1.55 0 0 0 0 3.1Zm11.33 9.83v-4.73c0-2.55-1.36-3.74-3.18-3.74-1.47 0-2.13.81-2.5 1.38V9.7h-2.67c.04.75 0 8.64 0 8.64h2.67v-4.83c0-.24.02-.48.09-.65.19-.48.63-.97 1.36-.97.97 0 1.36.74 1.36 1.82v4.63h2.87Z' },
              ].map((s) => (
                <a
                  key={s.label}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="w-9 h-9 rounded-lg grid place-items-center text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 transition-colors"
                  aria-label={s.label}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="text-sm font-bold text-white mb-4">{c.title}</h4>
              <ul className="space-y-2.5">
                {c.links.map((l) => {
                  const href = l === 'Login' ? '/login' : l === 'Register' ? '/register' : '#'
                  return (
                    <li key={l}>
                      <Link
                        to={href}
                        onClick={(e) => href === '#' && e.preventDefault()}
                        className="text-sm text-slate-400 hover:text-white transition-colors"
                      >
                        {l}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ExpenseWise Inc. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: MINT }} />
            All Systems Operational
          </p>
        </div>
      </div>
    </footer>
  )
}
