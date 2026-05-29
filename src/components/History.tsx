import { useEffect, useState, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { localDB } from '../lib/storage'
import { useAuth } from '../context/AuthContext'
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
    Search,
    X,
    AlertCircle,
    FileText,
    MessageCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateProfessionalPDF } from '../utils/pdfGenerator'
import { Toast } from './calculator/SharedUI'

type DateFilter = 'all' | '7d' | '30d' | '90d'

export const CalculationHistory = () => {
    const { user } = useAuth()
    const [history, setHistory] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [toast, setToast] = useState<{ m: string; t: 'success' | 'error' } | null>(null)

    const [search, setSearch] = useState('')
    const [dateFilter, setDateFilter] = useState<DateFilter>('all')
    const [minRevenue, setMinRevenue] = useState('')
    const [maxRevenue, setMaxRevenue] = useState('')
    const [showFilters, setShowFilters] = useState(false)

    const fetchHistory = useCallback(async () => {
        if (!user || !user.email) return
        setLoading(true)
        try {
            const data = await localDB.getHistory(user.email)
            setHistory(data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        fetchHistory()
    }, [fetchHistory])

    const filtered = useMemo(() => {
        const now = new Date()
        const cutoff: Record<DateFilter, number> = {
            'all': 0, '7d': 7, '30d': 30, '90d': 90
        }
        return history.filter(r => {
            const name = (r.inputs?.propertyData?.farmName || r.metadata?.ranch_name || '').toLowerCase()
            if (search && !name.includes(search.toLowerCase())) return false
            if (dateFilter !== 'all') {
                const days = cutoff[dateFilter]
                const from = new Date(now.getTime() - days * 86400_000)
                if (new Date(r.created_at) < from) return false
            }
            const revenue = r.outputs?.revenueHa ?? 0
            if (minRevenue && revenue < parseFloat(minRevenue)) return false
            if (maxRevenue && revenue > parseFloat(maxRevenue)) return false
            return true
        })
    }, [history, search, dateFilter, minRevenue, maxRevenue])

    const hasActiveFilters = search || dateFilter !== 'all' || minRevenue || maxRevenue

    const requestDelete = (e: React.MouseEvent, id: string) => { e.stopPropagation(); setPendingDeleteId(id) }

    const confirmDelete = async () => {
        if (!pendingDeleteId || !user || !user.email) return
        setDeleting(true)
        try {
            const updated = await localDB.deleteCalculation(user.email, pendingDeleteId)
            setHistory(updated)
            setToast({ m: 'Registro excluído.', t: 'success' })
        } catch (err: any) {
            setToast({ m: 'Erro ao excluir.', t: 'error' })
        } finally { setDeleting(false); setPendingDeleteId(null) }
    }

    const shareWhatsApp = (e: React.MouseEvent, record: any) => {
        e.stopPropagation()
        const farm = record.inputs?.propertyData?.farmName || "Minha Fazenda"
        let msg = `*RESUMO DA SIMULAÇÃO - ${farm}*\n\n`
        msg += `*Financeiro:*\n`
        msg += `- Receita Estimada por hectare: R$ ${record.outputs?.revenueHa?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`
        msg += `- Redução de Receita por Hectare: R$ ${record.outputs?.reductionHa?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n\n`
        msg += `*Produtivo:*\n`
        msg += `- Cabeças Totais: ${record.outputs?.stockingRateHeads?.toFixed(1)}\n`
        msg += `- Lotação Total (UA): ${record.outputs?.stockingRateUA?.toFixed(1)}\n`
        msg += `- Produtividade (@ Totais): ${record.outputs?.productivity?.toFixed(1)}\n\n`
        msg += `_Gerado por Calculadora Pecuarista_`
        const url = `https://wa.me/?text=${encodeURIComponent(msg)}`
        window.open(url, '_blank')
    }

    const exportToCSV = () => {
        if (filtered.length === 0) {
            setToast({ m: 'Nenhum registro para exportar.', t: 'error' })
            return
        }

        const headers = [
            'Data',
            'Fazenda',
            'Proprietário',
            'Cidade',
            'Estado',
            'Categoria',
            'Area(m2)',
            'MateriaSeca(%)',
            'Lotacao(UA)',
            'ReceitaPorHectare(R$)',
            'ReducaoPorHectare(R$)'
        ]

        const rows = filtered.map(r => {
            const date = new Date(r.created_at).toLocaleDateString('pt-BR')
            const farm = r.inputs?.propertyData?.farmName || r.metadata?.ranch_name || ''
            const owner = r.inputs?.propertyData?.owner || ''
            const city = r.inputs?.propertyData?.city || ''
            const state = r.inputs?.propertyData?.state || ''
            const category = r.inputs?.category || ''
            const area = r.inputs?.sampleArea || ''
            const dm = r.inputs?.dryMatterPercent || ''
            const uas = r.outputs?.stockingRateUA || 0
            const revHa = r.outputs?.revenueHa || 0
            const redHa = r.outputs?.reductionHa || 0

            return [
                date,
                `"${farm}"`,
                `"${owner}"`,
                `"${city}"`,
                `"${state}"`,
                category,
                area,
                dm,
                uas.toString().replace('.', ','),
                revHa.toString().replace('.', ','),
                redHa.toString().replace('.', ',')
            ].join(';')
        })

        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(';'), ...rows].join('\n')
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `historico_calculos_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        setToast({ m: 'Planilha exportada com sucesso!', t: 'success' })
    }

    if (loading) {
        return (
            <div className="h-64 flex flex-col items-center justify-center gap-4 text-green-600">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-sm font-bold uppercase tracking-widest">Carregando Histórico...</span>
            </div>
        )
    }

    if (history.length === 0) {
        return (
            <div className="bg-white rounded-lg p-16 text-center mt-6 shadow border border-gray-200">
                <Database className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-bold text-xl text-gray-800 mb-2">Nenhum cálculo salvo</h3>
                <p className="text-gray-500">Salve suas simulações para que apareçam aqui.</p>
            </div>
        )
    }

    const pendingRecord = history.find(h => h.id === pendingDeleteId)
    const pendingName = pendingRecord?.inputs?.propertyData?.farmName || pendingRecord?.metadata?.ranch_name || 'este cálculo'

    return (
        <>
            <AnimatePresence>
                {toast && <Toast message={toast.m} type={toast.t} onClose={() => setToast(null)} />}
            </AnimatePresence>

            <div className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <HistoryIcon className="w-6 h-6 text-green-700" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 uppercase">Histórico</h2>
                            <p className="text-sm font-semibold text-gray-500">
                                {filtered.length} de {history.length} registros
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={exportToCSV}
                            className="flex items-center gap-2 text-sm font-bold bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md transition-colors shadow-sm">
                            <FileText size={16} /> Excel / CSV
                        </button>
                        <button onClick={() => { fetchHistory(); setToast({ m: 'Atualizado!', t: 'success' }) }}
                            className="flex items-center gap-2 text-sm font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md transition-colors border border-gray-300">
                            <RefreshCw size={16} /> Atualizar
                        </button>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
                    <div className="flex gap-3">
                        <div className="flex-1 flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 bg-gray-50 focus-within:ring-2 focus-within:ring-green-500 bg-white">
                            <Search size={18} className="text-gray-400" />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Buscar por nome da fazenda..."
                                className="flex-1 text-base bg-transparent outline-none text-gray-900"
                            />
                            {search && (
                                <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 text-sm font-bold uppercase px-4 py-2 rounded-md border transition-colors ${hasActiveFilters ? 'bg-green-700 border-green-700 text-white' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'}`}
                        >
                            Filtros {hasActiveFilters && "✓"}
                        </button>
                    </div>

                    {showFilters && (
                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-md space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Período</label>
                                <div className="flex gap-2 flex-wrap">
                                    {([['all', 'Todos'], ['7d', 'Últimos 7 dias'], ['30d', 'Últimos 30 dias'], ['90d', 'Últimos 90 dias']] as [DateFilter, string][]).map(([val, label]) => (
                                        <button key={val}
                                            onClick={() => setDateFilter(val)}
                                            className={`px-3 py-1.5 rounded-md text-sm font-bold border ${dateFilter === val ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Faixa de Receita/ha (R$)</label>
                                <div className="flex gap-2 items-center">
                                    <input type="number" value={minRevenue} onChange={e => setMinRevenue(e.target.value)} placeholder="Mínimo" className="flex-1 rounded-md px-3 py-2 border border-gray-300 text-base" />
                                    <span className="text-gray-500 font-bold">até</span>
                                    <input type="number" value={maxRevenue} onChange={e => setMaxRevenue(e.target.value)} placeholder="Máximo" className="flex-1 rounded-md px-3 py-2 border border-gray-300 text-base" />
                                    {(minRevenue || maxRevenue) && (
                                        <button onClick={() => { setMinRevenue(''); setMaxRevenue('') }} className="p-2 text-red-500 hover:text-red-700">Limpar</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {filtered.length === 0 && (
                    <div className="py-12 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p className="font-bold text-gray-500 text-lg">Nenhum registro encontrado</p>
                    </div>
                )}

                <div className="space-y-4">
                    {filtered.map((record) => (
                        <div key={record.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
                                className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50 transition-colors ${expandedId === record.id ? 'bg-gray-50 border-b border-gray-200' : ''}`}>
                                
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gray-100 rounded-md text-gray-500">
                                        <Calendar size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-900 text-lg">
                                                {record.inputs?.propertyData?.farmName || record.metadata?.ranch_name || 'Fazenda Não Informada'}
                                            </span>
                                            <span className="text-gray-400">•</span>
                                            <span className="text-sm font-semibold text-gray-500">
                                                {new Date(record.created_at).toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-600 mt-1">
                                            Receita Estimada: <span className="font-bold text-green-700">R$ {record.outputs.revenueHa?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/ha</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-auto">
                                    <button onClick={(e) => shareWhatsApp(e, record)}
                                        className="p-2 text-[#25D366] hover:bg-[#25D366]/10 rounded-md transition-colors" title="Compartilhar no WhatsApp">
                                        <MessageCircle size={20} />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); generateProfessionalPDF(record.inputs, record.outputs, record.inputs?.propertyData?.farmName || record.metadata?.ranch_name || 'Histórico') }}
                                        className="p-2 text-green-700 hover:bg-green-100 rounded-md transition-colors" title="Baixar PDF">
                                        <Download size={20} />
                                    </button>
                                    <button onClick={(e) => requestDelete(e, record.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Excluir">
                                        <Trash2 size={20} />
                                    </button>
                                    <ChevronDown size={24} className={`text-gray-400 transform transition-transform ${expandedId === record.id ? 'rotate-180' : ''}`} />
                                </div>
                            </div>

                            {expandedId === record.id && (
                                <div className="p-6 bg-gray-50 grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-bold text-gray-500 uppercase border-b border-gray-200 pb-2">Parâmetros</h4>
                                        <HistoryField label="Amostra" value={`${record.inputs.sampleWeight} kg`} />
                                        <HistoryField label="Matéria Seca" value={`${record.inputs.dryMatterPercent}%`} />
                                        <HistoryField label="Lotação" value={`${record.outputs.stockingRateUA} UA`} />
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-bold text-gray-500 uppercase border-b border-gray-200 pb-2">Local</h4>
                                        {record.inputs.propertyData?.farmName ? (
                                            <>
                                                <HistoryField label="Dono" value={record.inputs.propertyData.owner} />
                                                <HistoryField label="Cidade" value={`${record.inputs.propertyData.city}/${record.inputs.propertyData.state}`} />
                                            </>
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">Sem dados de local</p>
                                        )}
                                    </div>
                                    <div className="bg-green-700 text-white p-5 rounded-lg shadow-inner">
                                        <h4 className="text-sm font-bold text-green-200 uppercase mb-4">Financeiro por Hectare</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Receita Estimada</span>
                                                <span className="font-bold">R$ {record.outputs.revenueHa?.toLocaleString('pt-BR')}</span>
                                            </div>
                                            <div className="flex justify-between text-sm text-red-200">
                                                <span>Redução de Receita</span>
                                                <span className="font-bold">- R$ {record.outputs.reductionHa?.toLocaleString('pt-BR')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {createPortal(
                <AnimatePresence>
                    {pendingDeleteId && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setPendingDeleteId(null)}>
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                                <div className="p-6 text-center">
                                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <AlertCircle size={32} className="text-red-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Excluir Registro?</h3>
                                    <p className="text-gray-600 mb-6">
                                        Tem certeza que deseja excluir "{pendingName}"? Esta ação não tem volta.
                                    </p>
                                    <div className="flex gap-3">
                                        <button onClick={() => setPendingDeleteId(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-md transition-colors">
                                            Cancelar
                                        </button>
                                        <button onClick={confirmDelete} disabled={deleting} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-md transition-colors flex justify-center items-center gap-2">
                                            {deleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />} Excluir
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    )
}

function HistoryField({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
            <span className="text-sm font-bold text-gray-500">{label}</span>
            <span className="text-sm font-bold text-gray-900">{value}</span>
        </div>
    )
}
