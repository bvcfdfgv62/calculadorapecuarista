import { useState, useEffect, lazy, Suspense } from 'react'
import { useAuth } from './context/AuthContext'
import { AuthWrapper } from './components/AuthWrapper'
import { SplashScreen } from './components/SplashScreen'
import {
  LogOut, Calculator as CalcIcon, History, User as UserIcon,
  ChevronLeft, ChevronRight, ShieldCheck
} from 'lucide-react'
import { motion, AnimatePresence, MotionConfig } from 'framer-motion'

import { Login } from './components/Login'
import { Register } from './components/Register'
import { Calculator } from './components/Calculator'
import { CalculationHistory } from './components/History'
import { AdminPanel } from './components/AdminPanel'

const PageLoader = () => (
  <div className="flex flex-col items-center justify-center p-20 gap-4">
    <div className="w-10 h-10 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin shadow-sm" />
    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Carregando...</span>
  </div>
)

function AppContent() {
  const { user, profile, loading, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<'calculator' | 'history' | 'admin'>('calculator')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [authView, setAuthView] = useState<'login' | 'register'>('login')

  const isAdminEmail = user?.email === 'valerio@gmail.com' || user?.email === 'kaian@gmail.com'

  // Removido dark mode para interface rural sempre clara
  useEffect(() => {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <AuthWrapper view={authView} setView={setAuthView}>
        {authView === 'login' ? (
          <Login setView={setAuthView} />
        ) : (
          <Register setView={setAuthView} />
        )}
      </AuthWrapper>
    )
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row h-screen overflow-hidden bg-gray-200">

      {/* ── SIDEBAR ── */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? 80 : 260 }}
        className="hidden md:flex flex-col z-10 bg-white border-r border-gray-200 relative overflow-visible"
      >
        <div className={`p-6 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded text-green-700">
              <CalcIcon className="w-6 h-6" />
            </div>
            {!isSidebarCollapsed && (
              <div>
                <h1 className="font-bold text-lg text-gray-900 uppercase">Calculadora</h1>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem icon={<CalcIcon size={24} />} label="Nova Simulação" active={activeTab === 'calculator'} onClick={() => setActiveTab('calculator')} collapsed={isSidebarCollapsed} />
          <NavItem icon={<History size={24} />} label="Histórico" active={activeTab === 'history'} onClick={() => setActiveTab('history')} collapsed={isSidebarCollapsed} />
          {isAdminEmail && (
            <NavItem icon={<ShieldCheck size={24} />} label="Painel Admin" active={activeTab === 'admin'} onClick={() => setActiveTab('admin')} collapsed={isSidebarCollapsed} />
          )}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className={`flex items-center gap-3 px-3 py-2 mb-4 bg-gray-50 rounded-lg border border-gray-200 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded bg-green-700 flex items-center justify-center text-sm font-bold text-white uppercase">
              {user.email?.[0]}
            </div>
            {!isSidebarCollapsed && (
              <div className="overflow-hidden flex-1">
                <p className="text-xs text-gray-500 font-bold uppercase">Usuário</p>
                <p className="text-sm font-bold text-gray-900 truncate">{user.email?.split('@')[0]}</p>
              </div>
            )}
          </div>

          <button
            onClick={() => logout()}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-bold uppercase text-red-600 hover:bg-red-50 transition-colors ${isSidebarCollapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={20} />
            {!isSidebarCollapsed && <span>Sair</span>}
          </button>
        </div>

        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center text-gray-500 hover:text-green-700 shadow-sm"
        >
          {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </motion.aside>

      {/* ── MOBILE HEADER ── */}
      <header className="md:hidden px-4 py-3 flex items-center justify-between bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-green-700 rounded text-white">
            <CalcIcon className="w-5 h-5" />
          </div>
          <span className="font-bold uppercase text-gray-900">Calculadora</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-green-700 flex items-center justify-center text-sm font-bold text-white uppercase">
            {user.email?.[0]}
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 overflow-y-auto">
        <header className="px-8 py-4 hidden md:flex items-center justify-between bg-white border-b border-gray-200 sticky top-0 z-20">
          <span className="text-sm font-bold text-gray-500 uppercase">Acesso Rural</span>
          <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
            <UserIcon size={18} className="text-green-700" />
            {user.email}
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-4 pb-24 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200">
        <div className="flex items-center justify-around p-2">
          <MobileTabItem icon={<CalcIcon size={24} />} label="Simular" active={activeTab === 'calculator'} onClick={() => setActiveTab('calculator')} />
          <MobileTabItem icon={<History size={24} />} label="Histórico" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
          {isAdminEmail && (
            <MobileTabItem icon={<ShieldCheck size={24} />} label="Admin" active={activeTab === 'admin'} onClick={() => setActiveTab('admin')} />
          )}
          <MobileTabItem icon={<LogOut size={24} />} label="Sair" active={false} onClick={() => logout()} danger />
        </div>
      </nav>
    </div>
  )
}

function NavItem({ icon, label, active = false, onClick, collapsed = false }: {
  icon: React.ReactNode; label: string; active?: boolean; onClick: () => void; collapsed?: boolean
}) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-4 rounded-md transition-colors ${collapsed ? 'p-3 justify-center' : 'px-4 py-3'} ${active
        ? 'bg-green-700 text-white font-bold'
        : 'text-gray-600 hover:bg-gray-100 font-bold'}`}
    >
      {icon}
      {!collapsed && <span className="text-sm">{label}</span>}
    </button>
  )
}

function MobileTabItem({ icon, label, active, onClick, danger = false }: {
  icon: React.ReactNode; label: string; active: boolean; onClick: () => void; danger?: boolean
}) {
  return (
    <button onClick={onClick}
      className={`flex flex-col items-center justify-center p-2 rounded-md ${danger ? 'text-gray-400 hover:text-red-600' : active ? 'text-green-700' : 'text-gray-500'}`}
    >
      <div className={`p-1 rounded-md ${active ? 'bg-green-50' : ''}`}>
        {icon}
      </div>
      <span className="text-xs font-bold uppercase mt-1">
        {label}
      </span>
    </button>
  )
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <MotionConfig transition={{ duration: 0.2 }}>
      <div className="relative h-screen w-screen overflow-hidden bg-white">
        <div className="absolute inset-0">
          <AppContent />
        </div>
        <AnimatePresence>
          {showSplash && <SplashScreen key="splash" />}
        </AnimatePresence>
      </div>
    </MotionConfig>
  )
}
