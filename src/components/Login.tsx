import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowLeft, CheckCircle2, Shield } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface LoginProps {
    setView: (view: 'login' | 'register') => void
}

export const Login = ({ setView }: LoginProps) => {
    const { login, isMock } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Password recovery
    const [mode, setMode] = useState<'login' | 'forgot'>('login')
    const [resetEmail, setResetEmail] = useState('')
    const [resetLoading, setResetLoading] = useState(false)
    const [resetSent, setResetSent] = useState(false)
    const [resetError, setResetError] = useState<string | null>(null)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        
        try {
            const { error: loginError } = await login(email, password)
            if (loginError) {
                setError(loginError)
            }
        } catch {
            setError('Ocorreu um erro ao tentar entrar. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setResetLoading(true)
        setResetError(null)
        
        if (isMock) {
            // Simula envio de e-mail localmente em ambiente de desenvolvimento
            setTimeout(() => {
                setResetLoading(false)
                setResetSent(true)
            }, 1000)
            return
        }

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
                redirectTo: `${window.location.origin}/reset-password`,
            })
            if (error) {
                setResetError('Erro ao enviar e-mail. Verifique se o endereço está correto.')
            } else {
                setResetSent(true)
            }
        } catch {
            setResetError('Erro ao processar a solicitação de redefinição.')
        } finally {
            setResetLoading(false)
        }
    }

    return (
        <AnimatePresence mode="wait">
            {mode === 'forgot' ? (
                /* ─── MODO: RECUPERAR SENHA ─── */
                <motion.div key="forgot"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-6 sm:p-8"
                >
                    <button onClick={() => { setMode('login'); setResetSent(false); setResetError(null) }}
                        className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-700 transition-colors mb-6">
                        <ArrowLeft size={16} /> Voltar ao login
                    </button>

                    {!resetSent ? (
                        <>
                            <div className="mb-6 text-center">
                                <h2 className="text-xl font-bold text-gray-900 mb-1">
                                    Recuperar Senha
                                </h2>
                                <p className="text-gray-500 text-sm font-medium">
                                    Informe seu e-mail para receber um link de redefinição.
                                </p>
                            </div>

                            <form onSubmit={handleForgotPassword} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">E-mail Cadastrado</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            <Mail size={18} />
                                        </div>
                                        <input type="email" 
                                            className="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white outline-none transition-all text-gray-900 font-medium"
                                            placeholder="seu@email.com"
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                            required />
                                    </div>
                                </div>

                                {resetError && (
                                    <div className="flex items-start gap-2 text-red-700 text-sm font-medium bg-red-50 px-4 py-3 rounded border border-red-200">
                                        <AlertCircle size={18} className="flex-shrink-0" />
                                        <span>{resetError}</span>
                                    </div>
                                )}

                                <button type="submit" disabled={resetLoading}
                                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 px-4 rounded-xl font-bold text-[1.1rem] transition-all flex items-center justify-center disabled:opacity-70 mt-4 shadow-lg shadow-green-500/30">
                                    {resetLoading ? <><Loader2 className="w-5 h-5 animate-spin mr-2" />Enviando...</> : 'Enviar E-mail'}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 size={32} className="text-green-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">E-mail Enviado!</h2>
                            <p className="text-gray-600 mb-6">
                                Verifique a caixa de entrada de<br />
                                <strong className="text-gray-900">{resetEmail}</strong>
                            </p>
                            <button onClick={() => { setResetSent(false); setResetEmail('') }}
                                className="text-green-600 font-bold hover:underline">
                                Tentar outro e-mail
                            </button>
                        </div>
                    )}
                </motion.div>
            ) : (
                /* ─── MODO: LOGIN NORMAL ─── */
                <motion.div key="login"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-6 sm:p-8"
                >
                    {isMock && (
                        <div className="mb-6 flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
                            <Shield size={20} className="shrink-0 text-yellow-600" />
                            <span><strong>Modo Teste Local:</strong> Use <code>kaian@gmail.com</code> e senha <code>124578</code>.</span>
                        </div>
                    )}

                    <div className="mb-6 text-center">
                        <h2 className="text-xl font-bold text-gray-900 mb-1">
                            Acessar sua conta
                        </h2>
                        <p className="text-gray-500 text-sm font-medium">
                            Informe seus dados para entrar
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Seu E-mail</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Mail size={18} />
                                </div>
                                <input type="email" 
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white outline-none transition-all text-gray-900 font-medium"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Sua Senha</label>
                                <button type="button"
                                    onClick={() => setMode('forgot')}
                                    className="text-xs font-bold text-green-600 hover:text-green-700 transition-colors">
                                    Esqueceu a senha?
                                </button>
                            </div>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Lock size={18} />
                                </div>
                                <input type={showPassword ? 'text' : 'password'} 
                                    className="w-full pl-11 pr-12 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white outline-none transition-all text-gray-900 font-medium font-mono text-lg tracking-widest placeholder:tracking-normal placeholder:font-sans"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-start gap-2 text-red-700 text-sm font-medium bg-red-50 px-4 py-3 rounded border border-red-200">
                                <AlertCircle size={18} className="flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <button type="submit" disabled={loading}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 px-4 rounded-xl font-bold text-[1.1rem] transition-all flex items-center justify-center disabled:opacity-70 mt-4 shadow-lg shadow-green-500/30">
                            {loading ? <><Loader2 className="w-5 h-5 animate-spin mr-2" />Entrando...</> : 'Entrar na Plataforma'}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-gray-500 text-sm font-medium">
                            Ainda não tem acesso?{' '}
                            <button onClick={() => setView('register')}
                                className="text-green-600 font-bold hover:text-green-700 transition-colors">
                                Cadastre-se aqui
                            </button>
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
