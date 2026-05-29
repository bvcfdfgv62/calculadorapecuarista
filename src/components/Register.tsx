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
                className="w-full text-center"
            >
                <div className="w-16 h-16 bg-[#005ea2]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={32} className="text-[#005ea2]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Cadastro Realizado</h2>
                <p className="text-gray-600 mb-8 text-base">
                    Seus dados foram salvos. Verifique sua caixa de entrada para confirmar se necessário.
                </p>
                <button onClick={() => setView('login')} className="w-full bg-[#005ea2] hover:bg-blue-800 text-white py-4 px-4 rounded-lg font-bold text-lg transition-colors">
                    Acessar o Sistema
                </button>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full"
        >
            {isMock && (
                <div className="mb-5 flex items-start gap-3 p-3 bg-yellow-50/80 border border-yellow-200 rounded-xl text-sm text-yellow-800">
                    <Shield size={20} className="shrink-0 text-yellow-600" />
                    <span><strong>Modo Teste:</strong> Digite qualquer código de acesso (mínimo 5 letras).</span>
                </div>
            )}

            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Solicitar Acesso
                </h2>
                <p className="text-gray-500 text-base">
                    Preencha os dados corporativos abaixo.
                </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">Nome</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <User size={20} />
                            </div>
                            <input className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005ea2] focus:border-[#005ea2] outline-none transition-colors text-gray-900 text-base" placeholder="Nome" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">Sobrenome</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <User size={20} />
                            </div>
                            <input className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005ea2] focus:border-[#005ea2] outline-none transition-colors text-gray-900 text-base" placeholder="Sobrenome" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Fazenda / Propriedade</label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <Shield size={20} />
                        </div>
                        <input className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005ea2] focus:border-[#005ea2] outline-none transition-colors text-gray-900 text-base" placeholder="Fazenda Bela Vista" value={farmName} onChange={(e) => setFarmName(e.target.value)} required />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Telefone corporativo</label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <Phone size={20} />
                        </div>
                        <input className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005ea2] focus:border-[#005ea2] outline-none transition-colors text-gray-900 text-base" placeholder="(00) 00000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">E-mail</label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <Mail size={20} />
                        </div>
                        <input type="email" className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005ea2] focus:border-[#005ea2] outline-none transition-colors text-gray-900 text-base" placeholder="nome@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">Senha</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <Lock size={20} />
                            </div>
                            <input type={showPassword ? 'text' : 'password'} className="w-full pl-12 pr-10 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005ea2] focus:border-[#005ea2] outline-none transition-colors text-gray-900 text-base" placeholder="Mínimo 6" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">Confirmar</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <Lock size={20} />
                            </div>
                            <input type={showPassword ? 'text' : 'password'} className="w-full pl-12 pr-10 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005ea2] focus:border-[#005ea2] outline-none transition-colors text-gray-900 text-base" placeholder="Confirmar" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={6} required />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Código de Acesso VIP</label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <Key size={20} />
                        </div>
                        <input
                            className="w-full pl-12 pr-4 py-3 bg-blue-50/50 border border-blue-200 rounded-lg focus:ring-2 focus:ring-[#005ea2] focus:border-[#005ea2] focus:bg-white outline-none transition-colors text-[#005ea2] uppercase font-mono tracking-widest text-lg text-center font-bold"
                            placeholder="AGRO-XXXX-XXXX"
                            value={token}
                            onChange={(e) => setToken(e.target.value.toUpperCase())}
                            required
                        />
                    </div>
                </div>

                {error && (
                    <div className="flex items-start gap-2 text-red-700 text-sm font-medium bg-red-50 px-4 py-3 rounded-lg border border-red-200">
                        <AlertCircle size={20} className="flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <button type="submit" disabled={loading}
                    className="w-full bg-[#005ea2] hover:bg-blue-800 text-white py-4 px-4 rounded-lg font-bold text-lg transition-colors flex items-center justify-center disabled:opacity-70 mt-6">
                    {loading ? <><Loader2 className="w-5 h-5 animate-spin mr-2" />Processando...</> : 'Criar Conta'}
                </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-gray-600 text-base">
                    Já possui acesso?{' '}
                    <button onClick={() => setView('login')} className="text-[#005ea2] font-semibold hover:underline">
                        Entrar na plataforma
                    </button>
                </p>
            </div>
        </motion.div>
    )
}
