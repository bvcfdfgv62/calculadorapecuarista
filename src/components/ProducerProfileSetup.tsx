import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import { Mail, Lock, CheckCircle2, ShieldCheck } from 'lucide-react'

export const ProducerProfileSetup = () => {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!email.trim() || !email.includes('@')) {
      setError('Por favor, informe um e-mail válido.')
      setLoading(false)
      return
    }

    if (!password || password.length < 4) {
      setError('A senha deve ter no mínimo 4 caracteres.')
      setLoading(false)
      return
    }

    // Verificação de contas administrativas informadas pelo usuário
    const isAdminEmail = email.trim() === 'kaian@gmail.com' || email.trim() === 'valerio@gmail.com'
    if (isAdminEmail && password !== '124578') {
      setError('Senha incorreta para esta conta administrativa.')
      setLoading(false)
      return
    }

    try {
      // Login offline seguro. Pré-preenche o nome do perfil com o início do e-mail.
      const defaultName = email.split('@')[0]
      const formattedName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1)
      
      login(
        email.trim(),
        password,
        formattedName,
        'Minha Fazenda',
        ''
      )
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar login offline.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-slate-100 p-6 sm:p-9"
    >
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-1.5 w-10 bg-emerald-500 rounded-full animate-pulse" />
          <div className="h-1.5 w-3 bg-emerald-200 rounded-full" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2 uppercase leading-none">
          Acesso <span className="text-emerald-600">Pecuarista</span>
        </h1>
        <p className="text-slate-400 text-sm font-semibold">
          Faça login para entrar na sua conta e acessar a calculadora.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-semibold flex items-center gap-2 border border-red-100">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            {error}
          </div>
        )}

        {/* E-mail */}
        <div className="space-y-1.5">
          <label className="label-caps font-black text-slate-500 text-[10px] tracking-widest uppercase">E-mail de Acesso</label>
          <div className="relative group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-focus-within:text-emerald-500 transition-colors duration-200">
              <Mail size={15} strokeWidth={2.5} />
            </div>
            <input
              type="email"
              className="input-premium pl-10 w-full rounded-2xl border border-slate-200 p-3.5 outline-none focus:border-emerald-500 text-sm font-semibold text-slate-800 bg-[#f8faf9] focus:bg-white transition-all"
              placeholder="ex: kaian@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Senha */}
        <div className="space-y-1.5">
          <label className="label-caps font-black text-slate-500 text-[10px] tracking-widest uppercase">Senha</label>
          <div className="relative group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-focus-within:text-emerald-500 transition-colors duration-200">
              <Lock size={15} strokeWidth={2.5} />
            </div>
            <input
              type="password"
              className="input-premium pl-10 w-full rounded-2xl border border-slate-200 p-3.5 outline-none focus:border-emerald-500 text-sm font-semibold text-slate-800 bg-[#f8faf9] focus:bg-white transition-all"
              placeholder="Sua senha de acesso"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-emerald-700/10 hover:shadow-emerald-700/20 bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all disabled:opacity-50 mt-6 cursor-pointer"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <CheckCircle2 size={16} />
              Acessar Sistema
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest text-center">
        <ShieldCheck size={14} className="text-emerald-500" />
        Acesso 100% Offline & Seguro
      </div>
    </motion.div>
  )
}
