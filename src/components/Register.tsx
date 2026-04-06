import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { motion } from 'framer-motion'
import { Loader2, UserCheck, User, Phone, Mail, Lock, Key, Eye, EyeOff, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react'

interface RegisterProps {
    setView: (view: 'login' | 'register') => void
}

export const Register = ({ setView }: RegisterProps) => {
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [token, setToken] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { data: tokenData, error: tokenError } = await supabase
                .from('invite_tokens')
                .select('*')
                .eq('token', token)
                .eq('is_used', false)
                .maybeSingle()

            if (tokenError || !tokenData) {
                setError('Token de convite inválido, já utilizado ou não autorizado.')
                setLoading(false)
                return
            }

            const { data: authData, error: signUpError } = await supabase.auth.signUp({ email, password })

            if (signUpError) {
                setError(signUpError.message)
                setLoading(false)
                return
            }

            if (authData.user) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                        id: authData.user.id,
                        full_name: `${firstName} ${lastName}`,
                        phone: phone,
                        role: 'user'
                    })

                if (profileError) {
                    setError('Erro ao criar perfil: ' + profileError.message)
                    setLoading(false)
                    return
                }

                await supabase
                    .from('invite_tokens')
                    .update({ is_used: true, used_by: authData.user.id })
                    .eq('token', token)

                setSuccess(true)
            }
        } catch {
            setError('Um erro inesperado ocorreu. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-slate-100 p-10 text-center"
            >
                <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_0_8px_rgba(16,185,129,0.08)]">
                    <CheckCircle2 size={40} className="text-emerald-500" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Cadastro Realizado!</h2>
                <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-[260px] mx-auto">
                    Verifique seu e-mail para confirmar o acesso à plataforma.
                </p>
                <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
                    <p className="text-center text-sm text-slate-400 font-medium">
                        Já possui uma conta?{' '}
                        <button onClick={() => setView('login')} className="text-emerald-600 font-bold hover:text-emerald-700 underline underline-offset-4 decoration-2 transition-colors">
                            Fazer Login
                        </button>
                    </p>
                    <div className="flex items-center justify-center gap-1.5 text-slate-300">
                        <UserCheck size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Aguardando confirmação</span>
                    </div>
                </div>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-slate-100 p-7 sm:p-9"
        >
            {/* Header */}
            <div className="mb-5">
                <div className="flex items-center gap-2 mb-4">
                    <div className="h-1 w-8 bg-emerald-500 rounded-full" />
                    <div className="h-1 w-3 bg-emerald-200 rounded-full" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none mb-1.5">
                    Solicitar <span className="text-emerald-600">Acesso</span>
                </h1>
                <p className="text-slate-400 text-sm font-medium">
                    Junte-se à elite da pecuária brasileira.
                </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-3">
                {/* Nome + Sobrenome */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="label-caps">Nome</label>
                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                                <User size={14} strokeWidth={2.5} />
                            </div>
                            <input className="input-premium pl-9" placeholder="Nome" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="label-caps">Sobrenome</label>
                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                                <User size={14} strokeWidth={2.5} />
                            </div>
                            <input className="input-premium pl-9" placeholder="Sobrenome" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                        </div>
                    </div>
                </div>

                {/* Telefone */}
                <div className="space-y-1.5">
                    <label className="label-caps">Telefone</label>
                    <div className="relative group">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                            <Phone size={14} strokeWidth={2.5} />
                        </div>
                        <input className="input-premium pl-10" placeholder="(00) 00000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                    </div>
                </div>

                {/* E-mail */}
                <div className="space-y-1.5">
                    <label className="label-caps">E-mail</label>
                    <div className="relative group">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                            <Mail size={14} strokeWidth={2.5} />
                        </div>
                        <input type="email" className="input-premium pl-10" placeholder="nome@empresa.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                </div>

                {/* Senha */}
                <div className="space-y-1.5">
                    <label className="label-caps">Senha</label>
                    <div className="relative group">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                            <Lock size={14} strokeWidth={2.5} />
                        </div>
                        <input type={showPassword ? 'text' : 'password'} className="input-premium pl-10 pr-11" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
                            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                    </div>
                </div>

                {/* Token */}
                <div className="space-y-1.5">
                    <label className="label-caps">Token de Convite</label>
                    <div className="relative group">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                            <Key size={14} strokeWidth={2.5} />
                        </div>
                        <input
                            className="input-premium pl-10 font-mono tracking-wider border-emerald-200 focus:border-emerald-500"
                            placeholder="PEC-XXXXX-XXXX"
                            value={token}
                            onChange={(e) => setToken(e.target.value.toUpperCase())}
                            required
                        />
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-2.5 text-red-600 text-xs font-semibold bg-red-50 px-4 py-3 rounded-xl border border-red-100"
                    >
                        <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </motion.div>
                )}

                {/* Submit */}
                <div className="pt-1">
                    <button type="submit" disabled={loading}
                        className="btn-primary w-full py-4 text-sm uppercase tracking-[0.18em] font-black active:scale-[0.98] transition-all">
                        {loading
                            ? <><Loader2 className="w-4 h-4 animate-spin" /><span className="ml-2">Criando conta...</span></>
                            : 'Criar minha conta'
                        }
                    </button>
                </div>
            </form>

            {/* Toggle + SSL — inside the card */}
            <div className="mt-5 pt-5 border-t border-slate-100 space-y-3">
                <p className="text-center text-sm text-slate-400 font-medium">
                    Já possui uma conta?{' '}
                    <button onClick={() => setView('login')} className="text-emerald-600 font-bold hover:text-emerald-700 underline underline-offset-4 decoration-2 transition-colors">
                        Fazer Login
                    </button>
                </p>
                <div className="flex items-center justify-center gap-1.5 text-slate-300">
                    <ShieldCheck size={12} strokeWidth={2.5} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Conexão Segura SSL</span>
                </div>
            </div>
        </motion.div>
    )
}
