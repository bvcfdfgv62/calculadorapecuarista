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
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-1">
                                    Recuperar Senha
                                </h2>
                                <p className="text-gray-600 text-sm">
                                    Informe seu e-mail para receber um link de redefinição.
                                </p>
                            </div>

                            <form onSubmit={handleForgotPassword} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-1">E-mail Cadastrado</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <Mail size={18} />
                                        </div>
                                        <input type="email" 
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-gray-900"
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
                                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md font-bold text-lg transition-colors flex items-center justify-center disabled:opacity-70">
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

                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">
                            Entrar no Sistema
                        </h2>
                        <p className="text-gray-600">
                            Informe seus dados para acessar.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-1">Seu E-mail</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Mail size={18} />
                                </div>
                                <input type="email" 
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-gray-900 text-lg"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-sm font-semibold text-gray-800">Sua Senha</label>
                                <button type="button"
                                    onClick={() => setMode('forgot')}
                                    className="text-sm font-bold text-green-600 hover:underline">
                                    Esqueceu a senha?
                                </button>
                            </div>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Lock size={18} />
                                </div>
                                <input type={showPassword ? 'text' : 'password'} 
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-gray-900 text-lg"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1">
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-4 rounded-md font-bold text-xl transition-colors flex items-center justify-center disabled:opacity-70 mt-2">
                            {loading ? <><Loader2 className="w-6 h-6 animate-spin mr-2" />Entrando...</> : 'Entrar'}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                        <p className="text-gray-600">
                            Ainda não tem acesso?{' '}
                            <button onClick={() => setView('register')}
                                className="text-green-600 font-bold hover:underline text-lg">
                                Cadastre-se aqui
                            </button>
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
