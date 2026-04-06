import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Mail, Lock, Eye, EyeOff, AlertCircle, ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react'

interface LoginProps {
    setView: (view: 'login' | 'register') => void
}

export const Login = ({ setView }: LoginProps) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Recuperação de senha
    const [mode, setMode] = useState<'login' | 'forgot'>('login')
    const [resetEmail, setResetEmail] = useState('')
    const [resetLoading, setResetLoading] = useState(false)
    const [resetSent, setResetSent] = useState(false)
    const [resetError, setResetError] = useState<string | null>(null)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
            // Traduz erros comuns
            if (error.message.includes('Invalid login credentials'))
                setError('E-mail ou senha incorretos. Verifique seus dados.')
            else if (error.message.includes('Email not confirmed'))
                setError('Confirme seu e-mail antes de entrar.')
            else
                setError(error.message)
        }
        setLoading(false)
    }

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setResetLoading(true)
        setResetError(null)
        const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
            redirectTo: `${window.location.origin}/reset-password`,
        })
        setResetLoading(false)
        if (error) {
            setResetError('Erro ao enviar e-mail. Verifique o endereço informado.')
        } else {
            setResetSent(true)
        }
    }

    return (
        <AnimatePresence mode="wait">
            {/* ─── MODO: ESQUECEU A SENHA ─── */}
            {mode === 'forgot' ? (
                <motion.div key="forgot"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-slate-100 p-7 sm:p-9"
                >
                    {/* Voltar */}
                    <button onClick={() => { setMode('login'); setResetSent(false); setResetError(null) }}
                        className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-600 transition-colors mb-6 group">
                        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Voltar ao login
                    </button>

                    {!resetSent ? (
                        <>
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="h-1 w-8 bg-emerald-500 rounded-full" />
                                    <div className="h-1 w-3 bg-emerald-200 rounded-full" />
                                </div>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-1.5">
                                    Recuperar <span className="text-emerald-600">Acesso</span>
                                </h1>
                                <p className="text-slate-400 text-sm font-medium">
                                    Informe seu e-mail e enviaremos um link para redefinir sua senha.
                                </p>
                            </div>

                            <form onSubmit={handleForgotPassword} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="label-caps">E-mail Cadastrado</label>
                                    <div className="relative group">
                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-focus-within:text-emerald-500 transition-colors duration-200">
                                            <Mail size={15} strokeWidth={2.5} />
                                        </div>
                                        <input type="email" className="input-premium pl-10"
                                            placeholder="seu@email.com"
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                            required />
                                    </div>
                                </div>

                                {resetError && (
                                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                                        className="flex items-start gap-2.5 text-red-600 text-xs font-semibold bg-red-50 px-4 py-3 rounded-xl border border-red-100">
                                        <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                                        <span>{resetError}</span>
                                    </motion.div>
                                )}

                                <button type="submit" disabled={resetLoading}
                                    className="btn-primary w-full py-4 text-sm uppercase tracking-[0.18em] font-black active:scale-[0.98]">
                                    {resetLoading ? <><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Enviando...</> : 'Enviar Link de Recuperação'}
                                </button>
                            </form>
                        </>
                    ) : (
                        /* ─── SUCESSO ─── */
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-6 space-y-4">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 size={36} className="text-emerald-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 mb-2">E-mail Enviado!</h2>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Verifique sua caixa de entrada em <br />
                                    <strong className="text-slate-700">{resetEmail}</strong><br />
                                    e clique no link para redefinir sua senha.
                                </p>
                            </div>
                            <p className="text-xs text-slate-400">Não recebeu? Verifique o spam ou tente novamente.</p>
                            <button onClick={() => { setResetSent(false); setResetEmail('') }}
                                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline underline-offset-4">
                                Reenviar e-mail
                            </button>
                        </motion.div>
                    )}
                </motion.div>
            ) : (
                /* ─── MODO: LOGIN NORMAL ─── */
                <motion.div key="login"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-slate-100 p-7 sm:p-9"
                >
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-1 w-8 bg-emerald-500 rounded-full" />
                            <div className="h-1 w-3 bg-emerald-200 rounded-full" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none mb-1.5">
                            Acesse sua <span className="text-emerald-600">Conta</span>
                        </h1>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed">
                            Gerencie seu rebanho com precisão.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="label-caps">E-mail</label>
                            <div className="relative group">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-focus-within:text-emerald-500 transition-colors duration-200">
                                    <Mail size={15} strokeWidth={2.5} />
                                </div>
                                <input type="email" className="input-premium pl-10"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="label-caps">Senha</label>
                                <button type="button"
                                    onClick={() => setMode('forgot')}
                                    className="text-[10px] font-black uppercase text-emerald-500 tracking-widest hover:text-emerald-700 transition-colors">
                                    Esqueceu?
                                </button>
                            </div>
                            <div className="relative group">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-focus-within:text-emerald-500 transition-colors duration-200">
                                    <Lock size={15} strokeWidth={2.5} />
                                </div>
                                <input type={showPassword ? 'text' : 'password'} className="input-premium pl-10 pr-11"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                                className="flex items-start gap-2.5 text-red-600 text-xs font-semibold bg-red-50 px-4 py-3 rounded-xl border border-red-100">
                                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        <div className="pt-1">
                            <button type="submit" disabled={loading}
                                className="btn-primary w-full py-4 text-sm uppercase tracking-[0.18em] font-black active:scale-[0.98] transition-all">
                                {loading ? <><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Entrando...</> : 'Entrar no Sistema'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-5 pt-5 border-t border-slate-100 space-y-3">
                        <p className="text-center text-sm text-slate-400 font-medium">
                            Ainda não tem acesso?{' '}
                            <button onClick={() => setView('register')}
                                className="text-emerald-600 font-bold hover:text-emerald-700 underline underline-offset-4 decoration-2 transition-colors">
                                Solicite Cadastro
                            </button>
                        </p>
                        <div className="flex items-center justify-center gap-1.5 text-slate-300">
                            <ShieldCheck size={12} strokeWidth={2.5} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Conexão Segura SSL</span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
