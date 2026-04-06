import { useState, useEffect, lazy, Suspense } from 'react'
import { useAuth } from './context/AuthContext'
import { AuthWrapper } from './components/AuthWrapper'
import {
  LogOut, Calculator as CalcIcon, History, User as UserIcon,
  ChevronLeft, ChevronRight, ShieldCheck, Moon, Sun
} from 'lucide-react'
import { supabase } from './lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'

// Lighter initial bundle with lazy loading
const Login = lazy(() => import('./components/Login').then(m => ({ default: m.Login })))
const Register = lazy(() => import('./components/Register').then(m => ({ default: m.Register })))
const Calculator = lazy(() => import('./components/Calculator').then(m => ({ default: m.Calculator })))
const CalculationHistory = lazy(() => import('./components/History').then(m => ({ default: m.CalculationHistory })))
const AdminPanel = lazy(() => import('./components/AdminPanel').then(m => ({ default: m.AdminPanel })))

const PageLoader = () => (
  <div className="flex items-center justify-center p-20">
    <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
  </div>
)

function App() {
  const { user, profile, loading } = useAuth()
  const [authView, setAuthView] = useState<'login' | 'register'>('login')
  const [activeTab, setActiveTab] = useState<'calculator' | 'history' | 'admin'>('calculator')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
    return false
  })

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <AuthWrapper view={authView} setView={setAuthView}>
        {authView === 'login'
          ? <Login setView={setAuthView} />
          : <Register setView={setAuthView} />}
      </AuthWrapper>
    )
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row h-screen overflow-hidden" style={{ background: 'var(--background)' }}>

      {/* ── SIDEBAR ── */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? 88 : 280 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="hidden md:flex flex-col z-10 shadow-xl relative overflow-hidden border-r"
        style={{ background: 'var(--sidebar-bg)', borderColor: 'var(--border)' }}
      >
        {/* Logo */}
        <div className={`p-6 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-700/30 flex-shrink-0">
              <CalcIcon className="w-6 h-6 text-white" />
            </div>
            <AnimatePresence>
              {!isSidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <h1 className="font-black text-base leading-tight tracking-tight uppercase" style={{ color: 'var(--foreground)' }}>Calculadora</h1>
                  <p className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest">Pecuaristas Pro</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1 font-medium overflow-hidden">
          <NavItem icon={<CalcIcon size={20} />} label="Nova Simulação" active={activeTab === 'calculator'} onClick={() => setActiveTab('calculator')} collapsed={isSidebarCollapsed} />
          <NavItem icon={<History size={20} />} label="Histórico de Cálculos" active={activeTab === 'history'} onClick={() => setActiveTab('history')} collapsed={isSidebarCollapsed} />
          {profile?.role === 'admin' && (
            <NavItem icon={<ShieldCheck size={20} />} label="Painel Admin" active={activeTab === 'admin'} onClick={() => setActiveTab('admin')} collapsed={isSidebarCollapsed} />
          )}
        </nav>

        {/* User + Dark Toggle + Sign Out */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
          {/* User info */}
          <div className={`flex items-center gap-3 px-3 py-2 mb-3 rounded-xl border ${isSidebarCollapsed ? 'justify-center' : ''}`}
            style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}>
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex-shrink-0 flex items-center justify-center text-sm font-bold text-white shadow-sm">
              {user.email?.[0].toUpperCase()}
            </div>
            <AnimatePresence>
              {!isSidebarCollapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-hidden flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase" style={{ color: 'var(--muted)' }}>Usuário</p>
                  <p className="text-xs font-bold truncate" style={{ color: 'var(--foreground)' }}>{user.email?.split('@')[0]}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Dark Mode Toggle */}
          <div className={`flex items-center gap-3 px-3 py-2 rounded-xl mb-1 ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
            <AnimatePresence>
              {!isSidebarCollapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                  {isDark ? <Moon size={15} className="text-emerald-400" /> : <Sun size={15} className="text-amber-500" />}
                  <span className="text-xs font-bold" style={{ color: 'var(--muted)' }}>{isDark ? 'Modo Escuro' : 'Modo Claro'}</span>
                </motion.div>
              )}
            </AnimatePresence>
            <button className="theme-toggle" onClick={() => setIsDark(!isDark)} aria-label="Toggle dark mode" />
          </div>

          {/* Sign out */}
          <button
            onClick={() => supabase.auth.signOut()}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all hover:bg-red-500/10 hover:text-red-500 ${isSidebarCollapsed ? 'justify-center' : ''}`}
            style={{ color: 'var(--muted)' }}
          >
            <LogOut size={18} />
            {!isSidebarCollapsed && <span className="uppercase tracking-wider">Sair</span>}
          </button>
        </div>

        {/* Collapse button */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center shadow-md z-50 transition-colors hover:border-emerald-500 hover:text-emerald-600 border"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--muted)' }}
        >
          {isSidebarCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </motion.aside>

      {/* ── MOBILE TOP HEADER ── */}
      <header className="md:hidden px-4 py-3 flex items-center justify-between sticky top-0 z-30 border-b"
        style={{ background: 'var(--header-bg)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-emerald-600 rounded-lg">
            <CalcIcon className="w-4 h-4 text-white" />
          </div>
          <span className="font-black uppercase text-sm tracking-tight" style={{ color: 'var(--foreground)' }}>Calculadora</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="theme-toggle" onClick={() => setIsDark(!isDark)} aria-label="Toggle dark mode" />
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
            <div className="w-5 h-5 rounded-md bg-emerald-600 flex items-center justify-center text-[10px] font-bold text-white">
              {user.email?.[0].toUpperCase()}
            </div>
            <span className="text-xs font-bold max-w-[90px] truncate" style={{ color: 'var(--foreground)' }}>{user.email?.split('@')[0]}</span>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 overflow-y-auto" style={{ background: 'var(--background)' }}>
        {/* Desktop top bar */}
        <header className="px-8 py-4 hidden md:flex items-center justify-between sticky top-0 z-20 border-b"
          style={{ background: 'var(--header-bg)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: 'var(--muted)' }}>Portal do Produtor</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Dark mode toggle desktop */}
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
              {isDark ? <Moon size={14} className="text-emerald-400" /> : <Sun size={14} className="text-amber-500" />}
              <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                {isDark ? 'Escuro' : 'Claro'}
              </span>
              <button className="theme-toggle" onClick={() => setIsDark(!isDark)} aria-label="Toggle dark mode" />
            </div>
            <div className="h-6 w-px" style={{ background: 'var(--border)' }} />
            <div className="flex items-center gap-2 text-sm font-bold px-3 py-1.5 rounded-xl border"
              style={{ color: 'var(--muted)', borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
              <UserIcon size={14} className="text-emerald-500" />
              <span className="max-w-[160px] truncate">{user.email}</span>
            </div>
          </div>
        </header>

        <div className="max-w-[1920px] mx-auto p-4 pb-28 md:p-8 md:pb-10 lg:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="page-content"
            >
              <Suspense fallback={<PageLoader />}>
                {activeTab === 'calculator' && <Calculator />}
                {activeTab === 'history' && <CalculationHistory />}
                {activeTab === 'admin' && <AdminPanel />}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ── MOBILE BOTTOM TAB BAR ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t shadow-[0_-4px_24px_rgba(0,0,0,0.12)]"
        style={{ background: 'var(--header-bg)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-around px-2 py-1.5">
          <MobileTabItem icon={<CalcIcon size={20} />} label="Calculadora" active={activeTab === 'calculator'} onClick={() => setActiveTab('calculator')} />
          <MobileTabItem icon={<History size={20} />} label="Histórico" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
          <MobileTabItem
            icon={isDark ? <Sun size={20} /> : <Moon size={20} />}
            label={isDark ? 'Claro' : 'Escuro'}
            active={false}
            onClick={() => setIsDark(!isDark)}
          />
          {profile?.role === 'admin' && (
            <MobileTabItem icon={<ShieldCheck size={20} />} label="Admin" active={activeTab === 'admin'} onClick={() => setActiveTab('admin')} />
          )}
          <MobileTabItem icon={<LogOut size={20} />} label="Sair" active={false} onClick={() => supabase.auth.signOut()} danger />
        </div>
      </nav>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────
function NavItem({ icon, label, active = false, onClick, collapsed = false }: {
  icon: React.ReactNode; label: string; active?: boolean; onClick: () => void; collapsed?: boolean
}) {
  return (
    <button onClick={onClick}
      className={`nav-item w-full flex items-center gap-3 rounded-xl ${collapsed ? 'p-3 justify-center' : 'px-4 py-3'} ${active
        ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-700/25 font-bold'
        : 'font-semibold hover:text-emerald-600'}`}
      style={!active ? { color: 'var(--muted)' } : {}}
    >
      <span className={`transition-transform duration-200 ${active ? 'scale-110' : ''}`}>{icon}</span>
      {!collapsed && <span className="text-sm truncate">{label}</span>}
    </button>
  )
}

function MobileTabItem({ icon, label, active, onClick, danger = false }: {
  icon: React.ReactNode; label: string; active: boolean; onClick: () => void; danger?: boolean
}) {
  return (
    <button onClick={onClick}
      className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 px-1 rounded-xl transition-all active:scale-90 ${danger ? 'text-slate-400 active:text-red-500' : active ? 'text-emerald-600' : ''}`}
      style={!active && !danger ? { color: 'var(--muted)' } : {}}
    >
      <div className={`p-1.5 rounded-xl transition-all duration-200 ${active ? 'bg-emerald-50 scale-110' : ''}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-wide leading-none ${active ? 'text-emerald-600' : ''}`}>
        {label}
      </span>
    </button>
  )
}

export default App
