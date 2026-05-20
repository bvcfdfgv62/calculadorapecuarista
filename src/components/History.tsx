import { useEffect, useState, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { localDB } from '../lib/storage'
import {
    History as HistoryIcon,
    Calendar,
    Trash2,
    Loader2,
    Database,
    RefreshCw,
    ChevronDown,
    MapPin,
    Download,
    Wifi,
    Search,
    X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateProfessionalPDF } from '../utils/pdfGenerator'
import { Toast } from './calculator/SharedUI'

// ─── Types ─────────────────────────────────────────────────────────────────
type DateFilter = 'all' | '7d' | '30d' | '90d'

// ─── Componentes de Comparação Removidos ───

// ─── Main Component ────────────────────────────────────────────────────────
export const CalculationHistory = () => {
    const [history, setHistory] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [toast, setToast] = useState<{ m: string; t: 'success' | 'error' } | null>(null)
    const [isLive, setIsLive] = useState(false)

    // ── Filter state ────────────────────────────────────────────────────────
    const [search, setSearch] = useState('')
    const [dateFilter, setDateFilter] = useState<DateFilter>('all')
    const [minProfit, setMinProfit] = useState('')
    const [maxProfit, setMaxProfit] = useState('')
    const [showFilters, setShowFilters] = useState(false)

    // Estados de comparação removidos para despoluição visual

    const fetchHistory = useCallback(async () => {
        setLoading(true)
        try {
            const data = localDB.getHistory()
            setHistory(data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }, [])

    // ── Realtime local updates on mount ──────────────────────────────────────
    useEffect(() => {
        fetchHistory()
        setIsLive(true)
    }, [fetchHistory])

    // ── Filtering logic ─────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        const now = new Date()
        const cutoff: Record<DateFilter, number> = {
            'all': 0,
            '7d': 7, '30d': 30, '90d': 90
        }
        return history.filter(r => {
            // Search by farm name
            const name = (r.inputs?.propertyData?.farmName || r.metadata?.ranch_name || '').toLowerCase()
            if (search && !name.includes(search.toLowerCase())) return false
            // Date range
            if (dateFilter !== 'all') {
                const days = cutoff[dateFilter]
                const from = new Date(now.getTime() - days * 86400_000)
                if (new Date(r.created_at) < from) return false
            }
            // Profit range
            const profit = r.outputs?.profit ?? 0
            if (minProfit && profit < parseFloat(minProfit)) return false
            if (maxProfit && profit > parseFloat(maxProfit)) return false
            return true
        })
    }, [history, search, dateFilter, minProfit, maxProfit])

    const hasActiveFilters = search || dateFilter !== 'all' || minProfit || maxProfit

    // ── Delete ───────────────────────────────────────────────────────────────
    const requestDelete = (e: React.MouseEvent, id: string) => { e.stopPropagation(); setPendingDeleteId(id) }

    const confirmDelete = async () => {
        if (!pendingDeleteId) return
        setDeleting(true)
        try {
            const updated = localDB.deleteCalculation(pendingDeleteId)
            setHistory(updated)
            setToast({ m: 'Registro excluído com sucesso.', t: 'success' })
        } catch (err: any) {
            setToast({ m: err.message || 'Erro ao excluir. Tente novamente.', t: 'error' })
        } finally { setDeleting(false); setPendingDeleteId(null) }
    }

    // Métodos de comparação removidos ───

    // ─── Loading ──────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="h-64 flex flex-col items-center justify-center gap-4 text-emerald-600 opacity-50">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Sincronizando Histórico...</span>
            </div>
        )
    }

    // ─── Empty ────────────────────────────────────────────────────────────────
    if (history.length === 0) {
        return (
            <div className="rounded-3xl flex flex-col items-center justify-center p-16 text-center mt-6 shadow-sm border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="p-5 bg-emerald-500/10 rounded-2xl mb-6">
                    <Database className="w-10 h-10 text-emerald-600/40" />
                </div>
                <h3 className="font-black text-xl mb-2 uppercase tracking-tight" style={{ color: 'var(--foreground)' }}>Vazio por enquanto</h3>
                <p className="text-sm max-w-xs font-medium" style={{ color: 'var(--muted)' }}>Os cálculos que você salvar aparecerão aqui de forma organizada e segura.</p>
            </div>
        )
    }

    // ─── List ─────────────────────────────────────────────────────────────────
    const pendingRecord = history.find(h => h.id === pendingDeleteId)
    const pendingName = pendingRecord?.inputs?.propertyData?.farmName || pendingRecord?.metadata?.ranch_name || 'este cálculo'

    return (
        <>
            {/* Toast */}
            <AnimatePresence>
                {toast && <Toast message={toast.m} type={toast.t} onClose={() => setToast(null)} />}
            </AnimatePresence>

            {/* Modais de Comparação Portal Removidos */}

            <div className="space-y-5">
                {/* ── Header ───────────────────────────────────────────────── */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-700/10">
                            <HistoryIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tight" style={{ color: 'var(--foreground)' }}>Histórico de Cálculos</h2>
                            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
                                {filtered.length} de {history.length} registros
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Live */}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
                            <Database size={11} className="text-emerald-500" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">
                                Banco Local
                            </span>
                        </div>
                        {/* Refresh */}
                        <button onClick={() => { fetchHistory(); setToast({ m: 'Histórico atualizado!', t: 'success' }) }}
                            className="flex items-center gap-2 text-[10px] font-black uppercase transition-colors px-3 py-1.5 rounded-xl border text-emerald-600 hover:text-emerald-700"
                            style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                            <RefreshCw size={12} /> Atualizar
                        </button>
                    </div>
                </div>

                {/* ── Search + filter bar ───────────────────────────────────── */}
                <div className="space-y-3">
                    <div className="flex gap-2">
                        {/* Search */}
                        <div className="flex-1 flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors"
                            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                            <Search size={15} style={{ color: 'var(--muted)' }} className="shrink-0" />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Buscar por fazenda..."
                                className="flex-1 text-sm font-medium bg-transparent outline-none placeholder-slate-400"
                                style={{ color: 'var(--foreground)' }}
                            />
                            {search && (
                                <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
                                    <X size={13} />
                                </button>
                            )}
                        </div>
                        {/* Filter toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-wider px-4 py-3 rounded-2xl border transition-all ${hasActiveFilters ? 'bg-emerald-600 border-emerald-600 text-white' : 'hover:border-emerald-400/50'}`}
                            style={!hasActiveFilters ? { background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--muted)' } : {}}
                        >
                            Filtros {hasActiveFilters && <span className="w-4 h-4 rounded-full bg-white/25 text-[9px] flex items-center justify-center font-black">✓</span>}
                        </button>
                    </div>

                    {/* Expanded filters */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.22 }}
                                className="overflow-hidden"
                            >
                                <div className="rounded-2xl border p-4 space-y-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                                    {/* Date range */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Período</label>
                                        <div className="flex gap-2 flex-wrap">
                                            {([['all', 'Todos'], ['7d', '7 dias'], ['30d', '30 dias'], ['90d', '90 dias']] as [DateFilter, string][]).map(([val, label]) => (
                                                <button key={val}
                                                    onClick={() => setDateFilter(val)}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all border ${dateFilter === val ? 'bg-emerald-600 border-emerald-600 text-white' : 'hover:border-emerald-400/40'}`}
                                                    style={dateFilter !== val ? { background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--muted)' } : {}}>
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Profit range */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Faixa de Lucro (R$)</label>
                                        <div className="flex gap-2 items-center">
                                            <input
                                                type="number"
                                                value={minProfit}
                                                onChange={e => setMinProfit(e.target.value)}
                                                placeholder="Mínimo"
                                                className="flex-1 rounded-xl px-3 py-2 text-sm border outline-none font-medium"
                                                style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                                            />
                                            <span className="text-xs" style={{ color: 'var(--muted)' }}>até</span>
                                            <input
                                                type="number"
                                                value={maxProfit}
                                                onChange={e => setMaxProfit(e.target.value)}
                                                placeholder="Máximo"
                                                className="flex-1 rounded-xl px-3 py-2 text-sm border outline-none font-medium"
                                                style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                                            />
                                            {(minProfit || maxProfit) && (
                                                <button onClick={() => { setMinProfit(''); setMaxProfit('') }} className="p-2 text-slate-400 hover:text-rose-500">
                                                    <X size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Barra flutuante de comparação removida */}

                {/* ── No results ───────────────────────────────────────────── */}
                {filtered.length === 0 && (
                    <div className="py-16 text-center rounded-3xl border border-dashed" style={{ borderColor: 'var(--border)' }}>
                        <Search size={28} className="mx-auto mb-3 opacity-25" style={{ color: 'var(--muted)' }} />
                        <p className="font-black text-sm uppercase" style={{ color: 'var(--muted)' }}>Nenhum resultado encontrado</p>
                        <button onClick={() => { setSearch(''); setDateFilter('all'); setMinProfit(''); setMaxProfit('') }}
                            className="mt-3 text-[11px] font-black uppercase tracking-widest text-emerald-600 hover:underline">
                            Limpar filtros
                        </button>
                    </div>
                )}

                {/* ── Records list ─────────────────────────────────────────── */}
                <div className="space-y-3">
                    <AnimatePresence>
                        {filtered.map((record) => {
                            return (
                                <motion.div
                                    key={record.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.2 } }}
                                    className="rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all group border"
                                    style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
                                >
                                    {/* Row header */}
                                    <div
                                        onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
                                        className={`p-5 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-colors ${expandedId === record.id ? 'bg-emerald-500/5' : 'hover:bg-emerald-500/5'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-2xl transition-all ${expandedId === record.id ? 'bg-emerald-600 text-white' : ''}`}
                                                style={expandedId !== record.id ? { background: 'var(--surface-2)', color: 'var(--muted)' } : {}}>
                                                <Calendar size={20} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-black uppercase text-sm tracking-tight" style={{ color: 'var(--foreground)' }}>
                                                        {record.inputs?.propertyData?.farmName || record.metadata?.ranch_name || 'Cálculo Sem Nome'}
                                                    </span>
                                                    <div className="w-1 h-1 rounded-full" style={{ background: 'var(--border)' }} />
                                                    <span className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
                                                        {new Date(record.created_at).toLocaleDateString('pt-BR')}
                                                    </span>
                                                </div>
                                                <p className="text-xs font-medium mt-1" style={{ color: 'var(--muted)' }}>
                                                    Lucro Final: <span className="font-black text-emerald-600 dark:text-emerald-400 italic">R$ {record.outputs.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-5 self-end sm:self-auto">
                                            <div className="flex-col items-end mr-2 hidden md:flex">
                                                <span className="text-[9px] font-black uppercase tracking-[0.1em]" style={{ color: 'var(--muted)' }}>Produtividade</span>
                                                <span className="text-sm font-black" style={{ color: 'var(--foreground)' }}>{record.outputs.productivity} @/ha</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); generateProfessionalPDF(record.inputs, record.outputs, record.inputs?.propertyData?.farmName || record.metadata?.ranch_name || 'Histórico') }}
                                                    className="p-3 text-emerald-600 hover:bg-emerald-500/10 rounded-xl transition-all"
                                                    title="Baixar PDF">
                                                    <Download size={18} />
                                                </button>
                                                <button
                                                    onClick={(e) => requestDelete(e, record.id)}
                                                    className="p-3 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                                    style={{ color: 'var(--muted)' }}
                                                    title="Excluir">
                                                    <Trash2 size={18} />
                                                </button>
                                                <div className={`p-2 transition-transform duration-300 ${expandedId === record.id ? 'rotate-180 text-emerald-600' : ''}`} style={expandedId !== record.id ? { color: 'var(--muted)' } : {}}>
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
                                                className="border-t overflow-hidden"
                                                style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
                                            >
                                                <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                                    <div className="space-y-4">
                                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--muted)' }}>Parâmetros do Campo</h4>
                                                        <HistoryField label="Amostra" value={`${record.inputs.sampleWeight} kg`} />
                                                        <HistoryField label="Matéria Seca" value={`${record.inputs.dryMatterPercent}%`} />
                                                        <HistoryField label="Lotação Meta" value={`${record.outputs.stockingRateUA} UA`} />
                                                        <HistoryField label="Duração" value={`${record.inputs.growthPeriod} dias`} />
                                                    </div>

                                                    <div className="space-y-4">
                                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--muted)' }}>Localização</h4>
                                                        {record.inputs.propertyData?.farmName ? (
                                                            <div className="space-y-4">
                                                                <HistoryField label="Proprietário" value={record.inputs.propertyData.owner} />
                                                                <div className="flex items-center gap-3 p-4 rounded-2xl border mt-2" style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                                                                    <div className="p-2 rounded-lg" style={{ background: 'var(--surface)' }}>
                                                                        <MapPin size={16} className="text-emerald-600" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[10px] font-black uppercase" style={{ color: 'var(--muted)' }}>Cidade/UF</p>
                                                                        <p className="text-xs font-bold" style={{ color: 'var(--foreground)' }}>{record.inputs.propertyData.city} / {record.inputs.propertyData.state}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="p-6 rounded-2xl border border-dashed flex flex-col items-center" style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                                                                <p className="text-xs font-bold italic" style={{ color: 'var(--muted)' }}>Sem dados registrados</p>
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
                            )
                        })}
                    </AnimatePresence>
                </div>
            </div>

            {/* ─── DELETE MODAL ─────────────────────────────────────────────── */}
            {createPortal(
                <AnimatePresence>
                    {pendingDeleteId && (
                        <motion.div
                            key="delete-backdrop"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6"
                            style={{ backdropFilter: 'blur(12px) saturate(0.8)', backgroundColor: 'rgba(2,6,23,0.75)' }}
                            onClick={() => setPendingDeleteId(null)}
                        >
                            <motion.div
                                key="delete-modal"
                                initial={{ opacity: 0, y: 60, scale: 0.92 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 30, scale: 0.95 }}
                                transition={{ type: 'spring', stiffness: 440, damping: 36, mass: 0.8 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full sm:max-w-[420px] overflow-hidden rounded-t-[2.5rem] sm:rounded-[2rem]"
                                style={{
                                    background: 'linear-gradient(145deg, #0f172a 0%, #1e1b4b 100%)',
                                    boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06) inset'
                                }}
                            >
                                <div className="h-[2px] w-full" style={{ background: 'linear-gradient(90deg, transparent, #ef4444 30%, #f43f5e 60%, transparent)' }} />
                                <div className="relative p-8 sm:p-10">
                                    <div className="flex justify-center mb-8">
                                        <div className="relative">
                                            <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }} transition={{ duration: 2.5, repeat: Infinity }} className="absolute inset-0 bg-red-500 rounded-full" />
                                            <div className="relative w-20 h-20 rounded-full flex items-center justify-center"
                                                style={{ background: 'linear-gradient(135deg, #7f1d1d, #991b1b)', boxShadow: '0 0 0 1px rgba(239,68,68,0.25) inset, 0 8px 32px rgba(239,68,68,0.35)' }}>
                                                <Trash2 className="w-8 h-8 text-red-300" strokeWidth={1.75} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-center mb-8 space-y-3">
                                        <h3 className="text-2xl font-black tracking-tight" style={{ color: '#f1f5f9' }}>Excluir permanentemente?</h3>
                                        <p className="text-sm font-medium" style={{ color: '#94a3b8' }}>
                                            O registro{' '}
                                            <span className="font-bold px-2 py-0.5 rounded-lg inline-block"
                                                style={{ color: '#e2e8f0', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                &ldquo;{pendingName}&rdquo;
                                            </span>
                                            {' '}será removido do banco de dados.
                                        </p>
                                        <div className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl"
                                            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
                                            <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                                            Esta ação não pode ser desfeita
                                        </div>
                                    </div>
                                    <div className="h-px w-full mb-6" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button onClick={() => setPendingDeleteId(null)} className="flex-1 py-4 rounded-2xl font-bold text-sm active:scale-95 transition-all"
                                            style={{ background: 'rgba(255,255,255,0.07)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.09)' }}>
                                            Cancelar
                                        </button>
                                        <button onClick={confirmDelete} disabled={deleting}
                                            className="flex-1 py-4 rounded-2xl font-black text-sm active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2.5"
                                            style={{ background: 'linear-gradient(135deg, #dc2626, #e11d48)', color: 'white', boxShadow: '0 4px 24px rgba(220,38,38,0.4)' }}>
                                            {deleting ? <><Loader2 size={16} className="animate-spin" /> Excluindo...</> : <><Trash2 size={16} /> Sim, excluir</>}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    )
}

function HistoryField({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="flex justify-between items-center py-2.5 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
            <span className="text-[11px] font-black uppercase tracking-wider font-mono" style={{ color: 'var(--muted)' }}>{label}</span>
            <span className="text-sm font-black" style={{ color: 'var(--foreground)' }}>{value}</span>
        </div>
    )
}
