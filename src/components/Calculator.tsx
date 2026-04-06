import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
    TrendingUp, Leaf, Beef, Save, Info, Activity, Trash2, BarChart3,
    ChevronRight, CircleDollarSign, ChevronLeft, FileText, Download,
    Loader2, Settings2, Calculator as CalculatorIcon
} from 'lucide-react'
import { calculateResults } from '../utils/calculator'
import type { CalculatorInputs, CalculatorOutputs } from '../utils/calculator'
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { generateProfessionalPDF } from '../utils/pdfGenerator'

// ─── Sub-components (Memoized for peak performance) ──────────────────────────
const Toast = React.memo(({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => {
    useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t) }, [onClose])
    return (
        <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 rounded-2xl shadow-2xl font-bold text-sm flex items-center gap-3 whitespace-nowrap ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}
        >
            {type === 'success' ? '✓' : '✕'} {message}
        </motion.div>
    )
})

const SectionDivider = React.memo(({ label }: { label: string }) => (
    <div className="flex items-center gap-4">
        <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] whitespace-nowrap" style={{ color: 'var(--muted)' }}>{label}</span>
        <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
    </div>
))

const ChartCard = React.memo(({ title, subtitle, icon, children }: { title: string; subtitle: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="rounded-[2.5rem] p-7 shadow-xl relative overflow-hidden border"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between mb-7">
            <div>
                <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-1" style={{ color: 'var(--muted)' }}>{title}</h3>
                <p className="text-base font-black tracking-tighter uppercase" style={{ color: 'var(--foreground)' }}>{subtitle}</p>
            </div>
            <div className="p-3 bg-emerald-600/10 rounded-2xl text-emerald-600 border border-emerald-600/20">{icon}</div>
        </div>
        <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">{children as any}</ResponsiveContainer>
        </div>
    </motion.div>
))

const InputField = React.memo(({ label, name, value, onChange, placeholder, type = "text", tooltip }: any) => (
    <div className="space-y-1.5 flex-1 min-w-[120px]">
        <div className="flex items-center gap-1.5">
            <label className="text-[13px] font-semibold" style={{ color: 'var(--muted)' }}>{label}</label>
            {tooltip && (
                <span className="group relative cursor-help">
                    <Info size={12} style={{ color: 'var(--muted)' }} />
                    <span className="absolute left-1/2 -translate-x-1/2 -top-9 w-52 bg-slate-800 text-white text-xs rounded-lg px-2.5 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 leading-snug font-normal shadow-xl">{tooltip}</span>
                </span>
            )}
        </div>
        <input type={type} name={name} value={value ?? ''} onChange={onChange} placeholder={placeholder}
            className="w-full rounded-xl py-2.5 px-4 text-sm font-medium placeholder-slate-400 transition-all focus:outline-none border shadow-sm hover:border-emerald-500/50 focus:border-emerald-500"
            style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
    </div>
))

const DashboardKPI = React.memo(({ label, value, unit, icon, trend, highlight }: any) => (
    <div className={`kpi-card group relative rounded-2xl p-5 border transition-all duration-300 ${highlight ? 'ring-2 ring-emerald-500/30' : 'hover:border-emerald-500/30'}`}
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex flex-col h-full">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${highlight ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'group-hover:bg-emerald-600/15 group-hover:text-emerald-500'}`}
                    style={!highlight ? { background: 'var(--surface-2)', color: 'var(--muted)' } : {}}>
                    {React.cloneElement(icon as React.ReactElement<any>, { size: 20 })}
                </div>
            </div>
            <div className="space-y-0.5">
                <p className="text-xs font-semibold leading-tight" style={{ color: 'var(--muted)' }}>{label}</p>
                <h3 className="text-2xl font-bold leading-none tabular-nums" style={{ color: 'var(--foreground)' }}>{value}</h3>
                <p className="text-[11px] font-medium pt-0.5" style={{ color: 'var(--muted)' }}>{unit}</p>
            </div>
            <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                <p className="text-[11px] font-semibold text-emerald-600/80">{trend}</p>
            </div>
        </div>
    </div>
))

const FinancialCard = React.memo(({ label, value, color, negative, featured, icon }: any) => {
    if (featured) {
        return (
            <div className="financial-card relative overflow-hidden rounded-[2rem] p-8 shadow-2xl border border-emerald-500/20"
                style={{ background: 'linear-gradient(135deg, #064e29 0%, #0d8a43 100%)' }}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[50px] rounded-full -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-emerald-300/15 rounded-full blur-xl" />
                <div className="relative z-10 flex flex-col gap-4 animate-sweep">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-300">Lucro Líquido</p>
                        <TrendingUp size={16} className="text-emerald-300" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-3xl font-black tracking-tighter leading-none tabular-nums text-white">
                            R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/60">Estimativa do Período</p>
                    </div>
                </div>
            </div>
        )
    }
    return (
        <div className="financial-card relative overflow-hidden rounded-[2rem] p-8 border shadow-xl transition-all duration-300 hover:border-emerald-500/20"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="relative z-10 flex flex-col gap-5">
                <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--muted)' }}>{label}</p>
                    {icon && <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-inner" style={{ background: 'var(--surface-2)' }}>{icon}</div>}
                </div>
                <div className="space-y-1">
                    <h3 className={`text-3xl font-black tracking-tighter leading-none tabular-nums ${color}`}>
                        {negative ? '-' : ''} R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Estimativa do Período</p>
                </div>
            </div>
        </div>
    )
})

const InputPanel = React.memo(({ inputs, rawValues, handleInputChange, handleReset, setInputs, isSaving, handleSave, handleCalculate, isCalculated }: any) => (
    <div className="space-y-5">
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-green-800 rounded-[2rem] p-7 text-white shadow-2xl shadow-emerald-900/30 border border-white/10">
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-400/20 rounded-full blur-xl" />
            <div className="relative z-10 flex flex-col gap-4 mb-3">
                <img
                    src="./logo-corteva.png"
                    alt="Corteva Agriscience"
                    className="h-10 w-auto object-contain brightness-0 invert opacity-90"
                />
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm shadow-inner">
                        <CircleDollarSign size={28} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black leading-tight tracking-tight uppercase">Simulador<br />Pecuário</h2>
                    </div>
                </div>
            </div>
            <p className="relative z-10 text-sm font-semibold text-emerald-50/80 leading-relaxed">
                Métrica avançada para gestão de pastagens.
            </p>
        </div>

        <div className="rounded-[2rem] p-7 shadow-sm border"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="space-y-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-1 h-5 bg-emerald-600 rounded-full" />
                        <h3 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>Configurações</h3>
                    </div>
                    <button onClick={handleReset}
                        className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl transition-colors hover:bg-rose-500/10 hover:text-rose-600"
                        style={{ color: 'var(--muted)' }}>
                        <Trash2 size={12} /> Limpar
                    </button>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>Área Amostral</label>
                    <div className="grid grid-cols-2 gap-3">
                        {[1.0, 0.25].map(val => (
                            <button key={val}
                                onClick={() => setInputs((p: any) => ({ ...p, sampleArea: val as any }))}
                                className={`py-3 rounded-2xl text-sm font-black transition-all border-2 ${inputs.sampleArea === val
                                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-700/30 scale-[1.02]'
                                    : 'border-2'}`}
                                style={inputs.sampleArea !== val ? { borderColor: 'var(--border)', background: 'var(--surface-2)', color: 'var(--muted)' } : {}}>
                                {val.toFixed(2)} m²
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-sm font-bold text-emerald-600">Dados da Amostra</p>
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Peso amostra (kg)" name="sampleWeight" value={rawValues['sampleWeight'] ?? String(inputs.sampleWeight)} onChange={handleInputChange} tooltip="Peso verde da amostra coletada" />
                        <InputField label="% MS" name="dryMatterPercent" value={rawValues['dryMatterPercent'] ?? String(inputs.dryMatterPercent)} onChange={handleInputChange} tooltip="Percentual de matéria seca" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="OF (%)" name="forageSupplyPercent" value={rawValues['forageSupplyPercent'] ?? String(inputs.forageSupplyPercent)} onChange={handleInputChange} tooltip="Oferta de forragem % PV/dia" />
                        <InputField label="Nº Piquetes" name="paddockCount" value={rawValues['paddockCount'] ?? String(inputs.paddockCount)} onChange={handleInputChange} tooltip="Número total de piquetes" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Dias de Ocupação" name="occupationDays" value={rawValues['occupationDays'] ?? String(inputs.occupationDays)} onChange={handleInputChange} tooltip="Dias por piquete" />
                        <InputField label="Período (dias)" name="growthPeriod" value={rawValues['growthPeriod'] ?? String(inputs.growthPeriod)} onChange={handleInputChange} tooltip="Período total de engorda" />
                    </div>
                </div>

                <div className="space-y-3 pt-1">
                    <p className="text-sm font-bold text-emerald-600">Dados do Animal</p>
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>Categoria</label>
                        <div className="grid grid-cols-2 gap-3">
                            {(['Macho', 'Fêmea'] as const).map(cat => (
                                <button key={cat}
                                    onClick={() => setInputs((p: any) => ({ ...p, category: cat }))}
                                    className={`py-3 rounded-2xl text-sm font-black transition-all border-2 flex items-center justify-center gap-2 ${inputs.category === cat ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg scale-[1.02]' : 'border-2'}`}
                                    style={inputs.category !== cat ? { borderColor: 'var(--border)', background: 'var(--surface-2)', color: 'var(--muted)' } : {}}>
                                    <span className={`w-3 h-3 rounded-full border-2 ${inputs.category === cat ? 'bg-white border-white' : 'border-current'}`} />
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Peso Corporal (kg)" name="bodyWeight" value={rawValues['bodyWeight'] ?? String(inputs.bodyWeight)} onChange={handleInputChange} tooltip="Peso vivo médio" />
                        <InputField label="GPD (kg/dia)" name="gpd" value={rawValues['gpd'] ?? String(inputs.gpd)} onChange={handleInputChange} tooltip="Ganho de peso diário" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="% Indisponibilidade" name="unavailabilityPercent" value={rawValues['unavailabilityPercent'] ?? String(inputs.unavailabilityPercent)} onChange={handleInputChange} tooltip="Percentual de perdas" />
                        <InputField label="R$/@" name="pricePerArroba" value={rawValues['pricePerArroba'] ?? String(inputs.pricePerArroba)} onChange={handleInputChange} tooltip="Preço de venda por arroba" />
                    </div>
                </div>

                <div className="pt-4 border-t space-y-3" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-5 bg-emerald-400 rounded-full" />
                        <h3 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>Dados da Propriedade</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField label="Nome da Fazenda" name="propertyData.farmName" value={inputs.propertyData?.farmName} onChange={handleInputChange} placeholder="Ex: Fazenda Progresso" type="text" />
                        <InputField label="Proprietário" name="propertyData.owner" value={inputs.propertyData?.owner} onChange={handleInputChange} placeholder="Nome Completo" type="text" />
                        <InputField label="Cidade" name="propertyData.city" value={inputs.propertyData?.city} onChange={handleInputChange} placeholder="Cidade" type="text" />
                        <InputField label="Estado" name="propertyData.state" value={inputs.propertyData?.state} onChange={handleInputChange} placeholder="UF" type="text" />
                        <InputField label="Telefone" name="propertyData.phone" value={inputs.propertyData?.phone} onChange={handleInputChange} placeholder="(00) 00000-0000" type="text" />
                        <InputField label="E-mail" name="propertyData.email" value={inputs.propertyData?.email} onChange={handleInputChange} placeholder="fazenda@email.com" type="email" />
                    </div>
                </div>

                <div className="pt-2 space-y-3">
                    <button onClick={handleCalculate}
                        className="w-full py-5 rounded-2xl font-black uppercase tracking-widest bg-emerald-600 text-white shadow-xl shadow-emerald-700/30 hover:bg-emerald-500 active:scale-95 transition-all flex justify-center items-center gap-3">
                        <CalculatorIcon size={20} /> Calcular Resultados
                    </button>

                    <button onClick={handleSave} disabled={isSaving || !isCalculated}
                        className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest border-2 transition-all flex justify-center items-center gap-3 active:scale-95 ${isCalculated ? 'border-emerald-500 text-emerald-600 hover:bg-emerald-500/10' : 'border-gray-200 text-gray-400 cursor-not-allowed opacity-50'}`}
                        style={{ background: 'var(--surface-2)' }}>
                        {isSaving ? <Activity className="animate-spin w-5 h-5" /> : <><Save size={18} /> Salvar no Histórico</>}
                    </button>
                </div>

                <div className="p-5 rounded-3xl border" style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-2 mb-3">
                        <Activity size={14} style={{ color: 'var(--muted)' }} />
                        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Memória de Cálculo</span>
                    </div>
                    <div className="space-y-1 font-mono text-[10px] leading-relaxed" style={{ color: 'var(--muted)' }}>
                        <p>MF = (Amostra × 10.000 / Área) × %MS/100</p>
                        <p>TL = (MF / Dias Ocup.) / (PV × OF/100)</p>
                        <p>Prod. = (TL × GPD × Período) / 30</p>
                        <p>Lucro = Prod. × R$/@ × (1 - %Indsp/100)</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
))

const ResultsPanel = React.memo(({ outputs, inputs, exportToPDF, isExporting, chartData, scenarioData, isCalculated }: any) => (
    <div className="flex-1 space-y-8">
        <div className="relative overflow-hidden rounded-[2.5rem] p-8 md:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.25)]"
            style={{ background: 'linear-gradient(135deg, #0a0f0d 0%, #0d1f14 50%, #0f2318 100%)' }}>
            <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/15 blur-[80px] rounded-full -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-600/10 blur-[60px] rounded-full" />
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 via-emerald-600 to-transparent rounded-full" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="px-3 py-1.5 bg-emerald-500/15 rounded-full border border-emerald-500/25 backdrop-blur-sm">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Sistema Ativo</span>
                        </div>
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-2 text-white leading-tight">
                        Painel de<br /><span className="text-emerald-400">Resultados</span>
                    </h2>
                    <p className="text-sm font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: '#6b8f7a' }}>
                        <Info size={14} className="text-emerald-500" />
                        {inputs.propertyData?.farmName || 'Simulação Global em Tempo Real'}
                    </p>
                </div>
                <button onClick={exportToPDF} disabled={isExporting || !isCalculated}
                    className="shrink-0 group px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs overflow-hidden transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-3 border border-white/20 hover:border-white/40 hover:bg-white/10"
                    style={{ background: 'rgba(255,255,255,0.08)', color: 'white', backdropFilter: 'blur(12px)' }}>
                    {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                    {isExporting ? 'Processando...' : 'Exportar PDF PRO'}
                </button>
            </div>
        </div>

        {!isCalculated ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-[2.5rem] border-2 border-dashed border-emerald-500/20 bg-emerald-500/5">
                <div className="p-6 bg-emerald-100 rounded-full dark:bg-emerald-900/20 text-emerald-600">
                    <CalculatorIcon size={48} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-emerald-100">Pronto para Calcular?</h3>
                    <p className="text-sm text-slate-500 dark:text-emerald-500/60 max-w-xs mx-auto">Preencha os dados ao lado e clique em calcular para visualizar as métricas avançadas.</p>
                </div>
            </div>
        ) : (
            <>
                <div className="space-y-5">
                    <SectionDivider label="Métricas de Produção" />
                    <motion.div className="grid grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5"
                        initial="hidden" animate="visible"
                        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.09 } } }}>
                        {[
                            { label: 'Massa de Forragem', value: outputs.forageMass.toFixed(0), unit: 'kg MS / ha', icon: <Leaf />, trend: 'Capacidade Agronômica' },
                            { label: 'Cap. de Suporte', value: outputs.supportCapacity.toFixed(0), unit: 'kg PV / ha', icon: <Activity />, trend: 'Potencial de Pastejo' },
                            { label: 'Taxa de Lotação', value: outputs.stockingRateUA.toFixed(2), unit: `UA/ha (${outputs.stockingRateHeads.toFixed(0)} CAB)`, icon: <Beef />, trend: 'Densidade Populacional' },
                            { label: 'Produtividade', value: outputs.productivity.toFixed(1), unit: '@ Total período', icon: <TrendingUp />, trend: 'Rentabilidade', highlight: true },
                        ].map((kpi, i) => (
                            <motion.div key={i}
                                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } } }}>
                                <DashboardKPI {...kpi} />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                <div className="space-y-5">
                    <SectionDivider label="Inteligência Financeira" />
                    <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-5"
                        initial="hidden" animate="visible"
                        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>
                        {[
                            { label: 'Faturamento Bruto', value: outputs.revenue, color: 'text-emerald-600 dark:text-emerald-400', icon: <CircleDollarSign className="text-emerald-600" /> },
                            { label: 'Deduções Previstas', value: outputs.reduction, color: 'text-rose-600', negative: true },
                            { label: 'Lucro Líquido', value: outputs.profit, color: 'text-emerald-700 dark:text-emerald-400', featured: true },
                        ].map((card, i) => (
                            <motion.div key={i}
                                variants={{ hidden: { opacity: 0, scale: 0.94, y: 16 }, visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 240, damping: 20 } } }}>
                                <FinancialCard {...card} />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <ChartCard title="Análise de Fluxo" subtitle="Composição Financeira" icon={<BarChart3 size={22} />}>
                        <BarChart data={chartData} barSize={48} margin={{ left: -30, bottom: 20 }}>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b8f7a', fontSize: 11, fontWeight: 900 }} dy={10} />
                            <Tooltip cursor={{ fill: 'rgba(13,138,67,0.05)' }} contentStyle={{ backgroundColor: '#0d1710', border: '1px solid #1e3028', borderRadius: '16px', padding: '14px' }} itemStyle={{ color: '#fff', fontSize: '13px', fontWeight: '900' }} formatter={(val: any) => [`R$ ${Number(val).toLocaleString('pt-BR')}`, '']} />
                            <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                                {chartData.map((entry: any, index: number) => (<Cell key={index} fill={entry.color} />))}
                            </Bar>
                        </BarChart>
                    </ChartCard>
                    <ChartCard title="Projeção de Escala" subtitle="Análise de Lucratividade" icon={<FileText size={22} />}>
                        <BarChart data={scenarioData} barSize={48} margin={{ left: -30, bottom: 20 }}>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b8f7a', fontSize: 11, fontWeight: 900 }} dy={10} />
                            <Tooltip cursor={{ fill: 'rgba(13,138,67,0.05)' }} contentStyle={{ backgroundColor: '#0d1710', border: '1px solid #1e3028', borderRadius: '16px', padding: '14px' }} itemStyle={{ color: '#fff', fontSize: '13px', fontWeight: '900' }} formatter={(val: any) => [`R$ ${Number(val).toLocaleString('pt-BR')}`, '']} />
                            <Bar dataKey="val" radius={[10, 10, 0, 0]}>
                                {scenarioData.map((entry: any, index: number) => (<Cell key={index} fill={entry.color} />))}
                            </Bar>
                        </BarChart>
                    </ChartCard>
                </div>
            </>
        )}

        <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="relative overflow-hidden rounded-[2.5rem] p-8 flex flex-col sm:flex-row items-center gap-6"
            style={{ background: 'linear-gradient(135deg, #0a0f0d 0%, #0d1f14 100%)', boxShadow: '0 20px 48px rgba(0,0,0,0.2)' }}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full" />
            <div className="w-16 h-16 bg-emerald-500/15 rounded-3xl flex items-center justify-center text-emerald-400 border border-emerald-500/20 flex-shrink-0">
                <Info size={28} />
            </div>
            <div className="flex-1 text-center sm:text-left">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-1">Dica Técnica</p>
                <p className="text-sm font-semibold leading-relaxed" style={{ color: '#8fb09a' }}>
                    MF = (Amostra × 10k / Área) × %MS | Produtividade = R$ Ganho / ha
                </p>
            </div>
            <span className="text-[10px] font-black uppercase text-emerald-500/50 tracking-[0.2em] bg-emerald-500/5 px-5 py-2.5 rounded-full border border-emerald-500/10 whitespace-nowrap">Ref: Embrapa</span>
        </motion.div>
    </div>
))

export const Calculator = () => {
    const { user } = useAuth()
    const [mobileSection, setMobileSection] = useState<'inputs' | 'results'>('inputs')
    const [isInputPanelCollapsed, setIsInputPanelCollapsed] = useState(false)
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
    const showToast = useCallback((message: string, type: 'success' | 'error') => setToast({ message, type }), [])

    const [inputs, setInputs] = useState<CalculatorInputs>({
        sampleArea: 1.0, sampleWeight: 0, dryMatterPercent: 0, forageSupplyPercent: 12,
        paddockCount: 0, occupationDays: 0, growthPeriod: 0, category: 'Macho',
        bodyWeight: 0, gpd: 0, unavailabilityPercent: 0, pricePerArroba: 0,
        propertyData: { farmName: '', owner: '', city: '', state: '', phone: '', email: '' }
    })
    const [rawValues, setRawValues] = useState<Record<string, string>>({})
    const [outputs, setOutputs] = useState<CalculatorOutputs>(calculateResults(inputs))
    const [isSaving, setIsSaving] = useState(false)
    const [isExporting, setIsExporting] = useState(false)
    const [isCalculated, setIsCalculated] = useState(false)

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setIsCalculated(false) // Reset calculation status on any change

        if (name.includes('.')) {
            setInputs(prev => ({ ...prev, [name.split('.')[0]]: { ...(prev as any)[name.split('.')[0]], [name.split('.')[1]]: value } }))
            return
        }
        if (name === 'category') {
            setInputs(prev => ({ ...prev, [name]: value as 'Macho' | 'Fêmea' }))
        } else {
            setRawValues(prev => ({ ...prev, [name]: value }))
            const numValue = parseFloat(value.replace(',', '.'))
            setInputs(prev => ({ ...prev, [name]: isNaN(numValue) ? 0 : numValue }))
        }
    }, [])

    const handleCalculate = useCallback(() => {
        // Simple validation
        if (inputs.sampleWeight <= 0 || inputs.bodyWeight <= 0) {
            showToast('Por favor, preencha os pesos corretamente.', 'error')
            return
        }

        const results = calculateResults(inputs)
        setOutputs(results)
        setIsCalculated(true)
        showToast('Resultados calculados com sucesso!', 'success')

        // Auto-switch to results on mobile
        if (window.innerWidth < 1024) {
            setMobileSection('results')
        }
    }, [inputs, showToast])

    const handleSave = useCallback(async () => {
        if (!user) {
            showToast('Você precisa estar logado para salvar.', 'error')
            return
        }
        if (!isCalculated) {
            showToast('Calcule primeiro antes de salvar.', 'error')
            return
        }

        setIsSaving(true)
        const { error } = await supabase.from('calculations').insert({
            user_id: user.id, inputs, outputs,
            metadata: { ranch_name: inputs.propertyData?.farmName || 'Simulação' }
        })
        setIsSaving(false)
        if (error) showToast('Erro ao salvar. Tente novamente.', 'error')
        else showToast('Cálculo salvo no histórico!', 'success')
    }, [user, inputs, outputs, isCalculated, showToast])

    const handleReset = useCallback(() => {
        setInputs({
            sampleArea: 1.0, sampleWeight: 0, dryMatterPercent: 0, forageSupplyPercent: 0,
            paddockCount: 0, occupationDays: 0, growthPeriod: 0, category: 'Macho',
            bodyWeight: 0, gpd: 0, unavailabilityPercent: 0, pricePerArroba: 0,
            propertyData: { farmName: '', owner: '', city: '', state: '', phone: '', email: '' }
        })
        setRawValues({})
        setIsCalculated(false)
    }, [])

    const exportToPDF = useCallback(async () => {
        setIsExporting(true)
        try {
            await generateProfessionalPDF(inputs, outputs, inputs.propertyData?.farmName || 'Simulação')
            showToast('PDF gerado com sucesso!', 'success')
        } catch { showToast('Erro ao gerar PDF.', 'error') }
        finally { setIsExporting(false) }
    }, [inputs, outputs, showToast])

    const chartData = useMemo(() => [
        { name: 'Receita', value: outputs.revenue, color: '#0d8a43' },
        { name: 'Perda', value: outputs.reduction, color: '#ef4444' },
        { name: 'Lucro', value: outputs.profit, color: '#10b981' },
    ], [outputs.revenue, outputs.reduction, outputs.profit])

    const scenarioData = useMemo(() => [
        { name: 'Pessimista', val: Math.round(outputs.profit * 0.85), color: '#94a3b8' },
        { name: 'Médio', val: Math.round(outputs.profit), color: '#0d8a43' },
        { name: 'Otimista', val: Math.round(outputs.profit * 1.15), color: '#10b981' },
    ], [outputs.profit])

    return (
        <div className="max-w-[1600px] mx-auto">
            <AnimatePresence>
                {toast && <Toast key="toast" message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </AnimatePresence>

            {/* ── MOBILE ── */}
            <div className="lg:hidden pb-28">
                <div className="flex rounded-2xl p-1 mb-5 border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                    <button onClick={() => setMobileSection('inputs')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${mobileSection === 'inputs' ? 'bg-emerald-600 text-white shadow-md' : ''}`}
                        style={mobileSection !== 'inputs' ? { color: 'var(--muted)' } : {}}>
                        <Settings2 size={16} /> Dados
                    </button>
                    <button onClick={() => setMobileSection('results')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${mobileSection === 'results' ? 'bg-emerald-600 text-white shadow-md' : ''}`}
                        style={mobileSection !== 'results' ? { color: 'var(--muted)' } : {}}>
                        <TrendingUp size={16} /> Resultados
                        {isCalculated && outputs.profit > 0 && (
                            <span className="bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                                R${(outputs.profit / 1000).toFixed(0)}k
                            </span>
                        )}
                    </button>
                </div>
                <AnimatePresence mode="wait">
                    <motion.div key={mobileSection}
                        initial={{ opacity: 0, x: mobileSection === 'inputs' ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
                        {mobileSection === 'inputs' ?
                            <InputPanel
                                inputs={inputs}
                                rawValues={rawValues}
                                handleInputChange={handleInputChange}
                                handleReset={handleReset}
                                setInputs={setInputs}
                                isSaving={isSaving}
                                handleSave={handleSave}
                                handleCalculate={handleCalculate}
                                isCalculated={isCalculated}
                            /> :
                            <ResultsPanel
                                outputs={outputs}
                                inputs={inputs}
                                exportToPDF={exportToPDF}
                                isExporting={isExporting}
                                chartData={chartData}
                                scenarioData={scenarioData}
                                isCalculated={isCalculated}
                            />
                        }
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* ── DESKTOP ── */}
            <div className="hidden lg:flex gap-8 min-h-[calc(100vh-160px)] pb-10">
                <motion.div animate={{ width: isInputPanelCollapsed ? 80 : 420 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="relative flex-shrink-0">
                    <div className={`space-y-5 ${isInputPanelCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'} transition-opacity duration-300`}>
                        <InputPanel
                            inputs={inputs}
                            rawValues={rawValues}
                            handleInputChange={handleInputChange}
                            handleReset={handleReset}
                            setInputs={setInputs}
                            isSaving={isSaving}
                            handleSave={handleSave}
                            handleCalculate={handleCalculate}
                            isCalculated={isCalculated}
                        />
                    </div>
                    <button onClick={() => setIsInputPanelCollapsed(!isInputPanelCollapsed)}
                        className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-20 rounded-xl flex items-center justify-center shadow-sm z-30 transition-colors border hover:text-emerald-600 hover:border-emerald-500"
                        style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--muted)' }}>
                        {isInputPanelCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </motion.div>
                <ResultsPanel
                    outputs={outputs}
                    inputs={inputs}
                    exportToPDF={exportToPDF}
                    isExporting={isExporting}
                    chartData={chartData}
                    scenarioData={scenarioData}
                    isCalculated={isCalculated}
                />
            </div>
        </div>
    )
}
