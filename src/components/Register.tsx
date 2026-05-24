import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import { Loader2, UserCheck, User, Phone, Mail, Lock, Key, Eye, EyeOff, AlertCircle, CheckCircle2, Shield } from 'lucide-react'
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
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={32} className="text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Cadastro Realizado!</h2>
                <p className="text-gray-600 mb-6">
                    Seus dados foram salvos. Verifique sua caixa de entrada para confirmar.
                </p>
                <button onClick={() => setView('login')} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md font-bold text-lg transition-colors">
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
                <div className="mb-5 flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
                    <Shield size={20} className="shrink-0 text-yellow-600" />
                    <span><strong>Modo Teste:</strong> Digite qualquer código de acesso (mínimo 5 letras).</span>
                </div>
            )}

            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    Criar Conta
                </h2>
                <p className="text-gray-600">
                    Preencha os dados abaixo.
                </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-1">Nome</label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <User size={16} />
                            </div>
                            <input className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none text-gray-900" placeholder="Nome" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-1">Sobrenome</label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <User size={16} />
                            </div>
                            <input className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none text-gray-900" placeholder="Sobrenome" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1">Fazenda / Propriedade</label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Shield size={16} />
                        </div>
                        <input className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none text-gray-900" placeholder="Fazenda Bela Vista" value={farmName} onChange={(e) => setFarmName(e.target.value)} required />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1">Telefone / WhatsApp</label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Phone size={16} />
                        </div>
                        <input className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none text-gray-900" placeholder="(00) 00000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1">E-mail</label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Mail size={16} />
                        </div>
                        <input type="email" className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none text-gray-900" placeholder="nome@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1">Criar Senha</label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Lock size={16} />
                        </div>
                        <input type={showPassword ? 'text' : 'password'} className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none text-gray-900" placeholder="Mínimo 6 dígitos" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1">Confirmar Senha</label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Lock size={16} />
                        </div>
                        <input type={showPassword ? 'text' : 'password'} className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none text-gray-900" placeholder="Digite a senha novamente" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={6} required />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1">Código de Acesso</label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Key size={16} />
                        </div>
                        <input
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none text-gray-900 uppercase font-mono tracking-widest text-lg"
                            placeholder="CÓDIGO"
                            value={token}
                            onChange={(e) => setToken(e.target.value.toUpperCase())}
                            required
                        />
                    </div>
                </div>

                {error && (
                    <div className="flex items-start gap-2 text-red-700 text-sm font-medium bg-red-50 px-3 py-2 rounded border border-red-200">
                        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                <button type="submit" disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded font-bold text-lg transition-colors flex items-center justify-center disabled:opacity-70 mt-4">
                    {loading ? <><Loader2 className="w-5 h-5 animate-spin mr-2" />Processando...</> : 'Cadastrar'}
                </button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-200 text-center">
                <p className="text-gray-600">
                    Já tem acesso?{' '}
                    <button onClick={() => setView('login')} className="text-green-600 font-bold hover:underline text-lg">
                        Entrar
                    </button>
                </p>
            </div>
        </motion.div>
    )
}
