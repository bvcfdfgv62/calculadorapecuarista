import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import {
    History as HistoryIcon,
    Calendar,
    Trash2,
    Loader2,
    Database,
    RefreshCw,
    ChevronDown,
    MapPin,
    Download
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateProfessionalPDF } from '../utils/pdfGenerator'

export const CalculationHistory = () => {
    const [history, setHistory] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)

    const fetchHistory = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('calculations')
            .select('*')
            .order('created_at', { ascending: false })
        if (!error && data) setHistory(data)
        setLoading(false)
    }

    useEffect(() => { fetchHistory() }, [])

    const requestDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        setPendingDeleteId(id)
    }

    const confirmDelete = async () => {
        if (!pendingDeleteId) return
        setDeleting(true)
        const { error } = await supabase.from('calculations').delete().eq('id', pendingDeleteId)
        if (!error) setHistory(prev => prev.filter(item => item.id !== pendingDeleteId))
        setDeleting(false)
        setPendingDeleteId(null)
    }

    const cancelDelete = () => setPendingDeleteId(null)

    // ─── Loading ──────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="h-64 flex flex-col items-center justify-center gap-4 text-emerald-600 opacity-50">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sincronizando Histórico...</span>
            </div>
        )
    }

    // ─── Empty ────────────────────────────────────────────────────────────────
    if (history.length === 0) {
        return (
            <div className="bg-white border border-slate-100 rounded-3xl flex flex-col items-center justify-center p-16 text-center mt-6 shadow-sm">
                <div className="p-5 bg-emerald-50 rounded-2xl mb-6">
                    <Database className="w-10 h-10 text-emerald-600/30" />
                </div>
                <h3 className="font-black text-xl mb-2 text-slate-800 uppercase tracking-tight">Vazio por enquanto</h3>
                <p className="text-slate-400 text-sm max-w-xs font-medium">Os cálculos que você salvar aparecerão aqui de forma organizada e segura.</p>
            </div>
        )
    }

    // ─── List + Modal ─────────────────────────────────────────────────────────
    const pendingRecord = history.find(h => h.id === pendingDeleteId)
    const pendingName = pendingRecord?.metadata?.ranch_name || 'este cálculo'

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-700/10">
                            <HistoryIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Histórico de Cálculos</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Base de dados na nuvem</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchHistory}
                        className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-600 hover:text-emerald-700 transition-colors bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100"
                    >
                        <RefreshCw size={12} /> Sincronizar agora
                    </button>
                </div>

                {/* Records */}
                <div className="space-y-3">
                    <AnimatePresence>
                        {history.map((record) => (
                            <motion.div
                                key={record.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.2 } }}
                                className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all group"
                            >
                                {/* Row header */}
                                <div
                                    onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
                                    className={`p-5 px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-colors ${expandedId === record.id ? 'bg-slate-50' : 'hover:bg-emerald-50/30'}`}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`p-3 rounded-2xl transition-all shadow-sm ${expandedId === record.id ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-black text-slate-800 uppercase text-sm tracking-tight">
                                                    {record.metadata?.ranch_name || 'Cálculo Sem Nome'}
                                                </span>
                                                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                                                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                                                    {new Date(record.created_at).toLocaleDateString('pt-BR')}
                                                </span>
                                            </div>
                                            <p className="text-xs font-medium text-slate-500 mt-1">
                                                Lucro Final: <span className="font-black text-emerald-600 italic">R$ {record.outputs.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 self-end sm:self-auto">
                                        <div className="flex-col items-end mr-4 hidden md:flex">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">Produtividade</span>
                                            <span className="text-sm font-black text-slate-700">{record.outputs.productivity} @/ha</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    generateProfessionalPDF(record.inputs, record.outputs, record.metadata?.ranch_name || 'Histórico')
                                                }}
                                                className="p-3 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all"
                                                title="Baixar Relatório PDF"
                                            >
                                                <Download size={18} />
                                            </button>
                                            <button
                                                onClick={(e) => requestDelete(e, record.id)}
                                                className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                title="Excluir registro"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                            <div className={`p-2 transition-transform duration-300 ${expandedId === record.id ? 'rotate-180 text-emerald-600' : 'text-slate-300'}`}>
                                                <ChevronDown size={22} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded detail */}
                                <AnimatePresence>
                                    {expandedId === record.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t border-slate-100 bg-white"
                                        >
                                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                                <div className="space-y-4">
                                                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Parâmetros do Campo</h4>
                                                    <HistoryField label="Amostra" value={`${record.inputs.sampleWeight} kg`} />
                                                    <HistoryField label="Matéria Seca" value={`${record.inputs.dryMatterPercent}%`} />
                                                    <HistoryField label="Lotação Meta" value={`${record.outputs.stockingRateUA} UA`} />
                                                    <HistoryField label="Duração" value={`${record.inputs.growthPeriod} dias`} />
                                                </div>

                                                <div className="space-y-4">
                                                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Localização</h4>
                                                    {record.inputs.propertyData?.farmName ? (
                                                        <div className="space-y-4">
                                                            <HistoryField label="Proprietário" value={record.inputs.propertyData.owner} />
                                                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 mt-2">
                                                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                                                    <MapPin size={16} className="text-emerald-600" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] font-black uppercase text-slate-400">Cidade/UF</p>
                                                                    <p className="text-xs font-bold text-slate-800">{record.inputs.propertyData.city} / {record.inputs.propertyData.state}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center">
                                                            <p className="text-xs text-slate-400 font-bold italic">Sem dados registrados</p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="bg-emerald-600 rounded-3xl p-6 text-white shadow-xl shadow-emerald-700/20 relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                                        <RefreshCw size={80} />
                                                    </div>
                                                    <h4 className="text-[10px] font-black uppercase text-emerald-100 tracking-[0.2em] mb-6 relative z-10">Consolidado Financeiro</h4>
                                                    <div className="space-y-3 relative z-10">
                                                        <div className="flex justify-between items-center text-emerald-50/60 font-bold text-[11px]">
                                                            <span>RECEITA BRUTA</span>
                                                            <span className="text-sm text-white">R$ {record.outputs.revenue.toLocaleString('pt-BR')}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-red-100/60 font-bold text-[11px]">
                                                            <span>CUSTOS/PERDAS</span>
                                                            <span className="text-sm text-white">- R$ {record.outputs.reduction.toLocaleString('pt-BR')}</span>
                                                        </div>
                                                        <div className="h-px bg-white/20 my-4" />
                                                        <div className="flex flex-col">
                                                            <span className="text-[9px] font-black text-emerald-200 uppercase tracking-widest mb-1">LUCRO LÍQUIDO ESTIMADO</span>
                                                            <span className="text-3xl font-black text-white tracking-tighter">R$ {record.outputs.profit.toLocaleString('pt-BR')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* ─── MODAL DE CONFIRMAÇÃO ───────────────────────────────────── */}
            <AnimatePresence>
                {pendingDeleteId && (
                    <motion.div
                        key="delete-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6"
                        style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(15,23,42,0.65)' }}
                        onClick={cancelDelete}
                    >
                        <motion.div
                            key="delete-modal"
                            initial={{ opacity: 0, y: 80, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 40, scale: 0.96 }}
                            transition={{ type: 'spring', stiffness: 360, damping: 32 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white w-full sm:max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-[0_32px_80px_rgba(0,0,0,0.35)] overflow-hidden"
                        >
                            {/* Top red stripe */}
                            <div className="h-1.5 w-full bg-gradient-to-r from-red-400 via-red-500 to-rose-500" />

                            <div className="p-8 sm:p-10">
                                {/* Icon */}
                                <div className="flex justify-center mb-6">
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center shadow-inner">
                                            <Trash2 className="w-9 h-9 text-red-500" strokeWidth={1.75} />
                                        </div>
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                                            <span className="text-white text-[9px] font-black">!</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Text */}
                                <div className="text-center mb-8 space-y-3">
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                                        Excluir permanentemente?
                                    </h3>
                                    <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
                                        O registro{' '}
                                        <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg inline-block mt-1">
                                            &ldquo;{pendingName}&rdquo;
                                        </span>
                                        {' '}será removido do banco de dados.
                                    </p>

                                    {/* Warning pill */}
                                    <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs font-bold px-4 py-2.5 rounded-2xl mt-1">
                                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                        Esta ação não pode ser desfeita
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        onClick={cancelDelete}
                                        className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all active:scale-95"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        disabled={deleting}
                                        className="flex-1 py-4 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-2xl font-bold text-sm hover:from-red-600 hover:to-rose-600 transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2.5 shadow-lg shadow-red-500/25"
                                    >
                                        {deleting
                                            ? <><Loader2 size={16} className="animate-spin" /> Excluindo...</>
                                            : <><Trash2 size={16} /> Sim, excluir</>
                                        }
                                    </button>
                                </div>

                                {/* Cancel hint */}
                                <p className="text-center text-[11px] text-slate-300 mt-4 font-medium">
                                    Pressione fora do card ou Cancelar para voltar
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

function HistoryField({ label, value }: { label: string, value: string | number }) {
    return (
        <div className="flex justify-between items-center py-2.5 border-b border-slate-50 last:border-0">
            <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider font-mono">{label}</span>
            <span className="text-sm font-black text-slate-700">{value}</span>
        </div>
    )
}
