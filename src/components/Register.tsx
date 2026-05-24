import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import { Loader2, User, Phone, Mail, Lock, Key, Eye, EyeOff, AlertCircle, CheckCircle2, Shield } from 'lucide-react'
import { validateAccessCode } from '../lib/accessCode'

interface RegisterProps {
    setView: (view: 'login' | 'register') => void
}

export const Register = ({ setView }: RegisterProps) => {
    const { register, isMock } = useAuth()
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [farmName, setFarmName] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [token, setToken] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.')
            setLoading(false)
            return
        }

        try {
            if (!validateAccessCode(token)) {
                setError('Código de acesso inválido. Peça um código válido ao administrador.')
                setLoading(false)
                return
            }

            const { error: regError } = await register(email, password, `${firstName} ${lastName}`, farmName || 'Fazenda Principal', phone)
            
            if (regError) {
                setError(regError)
                setLoading(false)
                return
            }

            setSuccess(true)
        } catch {
            setError('Ocorreu um erro inesperado. Tente novamente mais tarde.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 sm:p-8 text-center"
            >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <CheckCircle2 size={40} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Cadastro Realizado!</h2>
                <p className="text-gray-500 mb-8 font-medium">
                    Seus dados foram salvos. Verifique sua caixa de entrada para confirmar se necessário.
                </p>
                <button onClick={() => setView('login')} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 px-4 rounded-xl font-bold text-[1.1rem] transition-all shadow-lg shadow-green-500/30">
                    Fazer Login
                </button>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 sm:p-8"
        >
            {isMock && (
                <div className="mb-5 flex items-start gap-3 p-3 bg-yellow-50/80 border border-yellow-200 rounded-xl text-sm text-yellow-800">
                    <Shield size={20} className="shrink-0 text-yellow-600" />
                    <span><strong>Modo Teste:</strong> Digite qualquer código de acesso (mínimo 5 letras).</span>
                </div>
            )}

            <div className="mb-6 text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                    Criar Conta
                </h2>
                <p className="text-gray-500 text-sm font-medium">
                    Preencha seus dados para começar
                </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Nome</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <User size={18} />
                            </div>
                            <input className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white outline-none transition-all text-gray-900 font-medium" placeholder="Nome" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Sobrenome</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <User size={18} />
                            </div>
                            <input className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white outline-none transition-all text-gray-900 font-medium" placeholder="Sobrenome" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Fazenda / Propriedade</label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <Shield size={18} />
                        </div>
                        <input className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white outline-none transition-all text-gray-900 font-medium" placeholder="Fazenda Bela Vista" value={farmName} onChange={(e) => setFarmName(e.target.value)} required />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Telefone / WhatsApp</label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <Phone size={18} />
                        </div>
                        <input className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white outline-none transition-all text-gray-900 font-medium" placeholder="(00) 00000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">E-mail</label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <Mail size={18} />
                        </div>
                        <input type="email" className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white outline-none transition-all text-gray-900 font-medium" placeholder="nome@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Senha</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <Lock size={18} />
                            </div>
                            <input type={showPassword ? 'text' : 'password'} className="w-full pl-11 pr-10 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white outline-none transition-all text-gray-900 font-medium font-mono tracking-widest placeholder:tracking-normal placeholder:font-sans" placeholder="Mínimo 6" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Confirmar</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <Lock size={18} />
                            </div>
                            <input type={showPassword ? 'text' : 'password'} className="w-full pl-11 pr-10 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white outline-none transition-all text-gray-900 font-medium font-mono tracking-widest placeholder:tracking-normal placeholder:font-sans" placeholder="Confirmar" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={6} required />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1">
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Código de Acesso VIP</label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <Key size={18} />
                        </div>
                        <input
                            className="w-full pl-11 pr-4 py-3.5 bg-green-50/50 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-green-50 outline-none transition-all text-green-900 uppercase font-mono tracking-widest text-lg text-center font-bold"
                            placeholder="AGRO-XXXX-XXXX"
                            value={token}
                            onChange={(e) => setToken(e.target.value.toUpperCase())}
                            required
                        />
                    </div>
                </div>

                {error && (
                    <div className="flex items-start gap-2 text-red-700 text-sm font-medium bg-red-50 px-4 py-3 rounded-xl border border-red-200">
                        <AlertCircle size={18} className="flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <button type="submit" disabled={loading}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 px-4 rounded-xl font-bold text-[1.1rem] transition-all flex items-center justify-center disabled:opacity-70 mt-4 shadow-lg shadow-green-500/30">
                    {loading ? <><Loader2 className="w-5 h-5 animate-spin mr-2" />Processando...</> : 'Criar Minha Conta'}
                </button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                <p className="text-gray-500 text-sm font-medium">
                    Já tem acesso?{' '}
                    <button onClick={() => setView('login')} className="text-green-600 font-bold hover:text-green-700 transition-colors">
                        Entrar na conta
                    </button>
                </p>
            </div>
        </motion.div>
    )
}
