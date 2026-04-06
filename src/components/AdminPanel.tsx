import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Key, Plus, Copy, Check, Loader2, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export const AdminPanel = () => {
    const [tokens, setTokens] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [copiedToken, setCopiedToken] = useState<string | null>(null)

    const fetchTokens = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('invite_tokens')
            .select('*')
            .order('created_at', { ascending: false })
        setTokens(data || [])
        setLoading(false)
    }

    useEffect(() => {
        fetchTokens()
    }, [])

    const generateToken = async () => {
        setGenerating(true)
        const newToken = `PEC-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${new Date().getFullYear()}`

        const { error } = await supabase
            .from('invite_tokens')
            .insert({ token: newToken })

        if (!error) {
            fetchTokens()
        }
        setGenerating(false)
    }

    const deleteToken = async (token: string) => {
        const { error } = await supabase
            .from('invite_tokens')
            .delete()
            .eq('token', token)

        if (!error) {
            setTokens(tokens.filter(t => t.token !== token))
        }
    }

    const copyToClipboard = (token: string) => {
        navigator.clipboard.writeText(token)
        setCopiedToken(token)
        setTimeout(() => setCopiedToken(null), 2000)
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Gestão de Convites</h2>
                    <p className="text-slate-500 text-sm font-medium">Gere tokens exclusivos para novos usuários.</p>
                </div>
                <button
                    onClick={generateToken}
                    disabled={generating}
                    className="btn-primary flex items-center gap-2 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-emerald-700/20"
                >
                    {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus size={20} />}
                    Novo Token
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {tokens.map((t) => (
                        <motion.div
                            key={t.token}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col justify-between h-48 ${t.is_used ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-emerald-100 shadow-sm hover:shadow-md'}`}
                        >
                            <div className="flex items-start justify-between">
                                <div className={`p-3 rounded-xl ${t.is_used ? 'bg-slate-200 text-slate-400' : 'bg-emerald-100 text-emerald-600'}`}>
                                    <Key size={20} />
                                </div>
                                {!t.is_used && (
                                    <button
                                        onClick={() => deleteToken(t.token)}
                                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>

                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Código do Token</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-black text-slate-900 font-mono tracking-wider">{t.token}</span>
                                    {!t.is_used && (
                                        <div className="relative group">
                                            <button
                                                onClick={() => copyToClipboard(t.token)}
                                                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                                            >
                                                {copiedToken === t.token ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} className="text-slate-400" />}
                                            </button>
                                            <AnimatePresence>
                                                {copiedToken === t.token && (
                                                    <motion.span
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0 }}
                                                        className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black uppercase px-2 py-1 rounded shadow-lg whitespace-nowrap z-50"
                                                    >
                                                        Copiado!
                                                    </motion.span>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${t.is_used ? 'text-slate-400' : 'text-emerald-600'}`}>
                                    {t.is_used ? 'Utilizado' : 'Disponível'}
                                </span>
                                <span className="text-[9px] font-bold text-slate-400">
                                    {new Date(t.created_at).toLocaleDateString('pt-BR')}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {loading && (
                    <div className="col-span-full py-20 text-center">
                        <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto" />
                    </div>
                )}

                {!loading && tokens.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-slate-100 italic text-slate-400">
                        Nenhum token gerado ainda.
                    </div>
                )}
            </div>
        </div>
    )
}
