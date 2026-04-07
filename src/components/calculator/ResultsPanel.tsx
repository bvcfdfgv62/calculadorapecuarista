import React from 'react'
import { motion } from 'framer-motion'
import { Info, Download, Loader2, Leaf, Activity, Beef, TrendingUp, CircleDollarSign, BarChart3, FileText, Calculator as CalculatorIcon } from 'lucide-react'
import { SectionDivider } from './SharedUI'
import { DashboardKPI, FinancialCard } from './CalculationKPIs'
import { ChartCard, OptimizedBarChart } from './CalculationCharts'

export const ResultsPanel = React.memo(({ outputs, inputs, exportToPDF, isExporting, chartData, scenarioData, isCalculated }: any) => (
    <div className="flex-1 space-y-8">
        <div className="relative overflow-hidden rounded-[2.5rem] p-10 md:p-12 shadow-[0_32px_64px_rgba(0,0,0,0.3)] transition-all duration-700"
            style={{ background: 'linear-gradient(135deg, #0a0f0d 0%, #0d1f14 50%, #0f2318 100%)' }}>
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 blur-[100px] rounded-full -mr-20 -mt-20" />
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-emerald-400 via-emerald-600 to-transparent rounded-full opacity-60" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20 backdrop-blur-md">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">Motor de Cálculo Ativo</span>
                        </div>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
                    </div>
                    <h2 className="text-5xl md:text-6xl font-black tracking-tighter uppercase mb-2 text-white leading-none">
                        Painel de<br /><span className="text-emerald-500">Resultados</span>
                    </h2>
                    <p className="text-sm font-bold uppercase tracking-widest flex items-center gap-3" style={{ color: '#8fb09a' }}>
                        <Info size={16} className="text-emerald-500 opacity-60" />
                        {inputs.propertyData?.farmName || 'Simulação de Precisão em Tempo Real'}
                    </p>
                </div>
                <button onClick={exportToPDF} disabled={isExporting || !isCalculated}
                    className="shrink-0 group px-8 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs overflow-hidden transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-30 flex items-center gap-4 border border-white/10 hover:border-white/30 hover:bg-white/5"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'white', backdropFilter: 'blur(20px)' }}>
                    {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} className="transition-transform group-hover:-translate-y-0.5" />}
                    {isExporting ? 'Processando...' : 'Exportar PDF PRO'}
                </button>
            </div>
        </div>

        {!isCalculated ? (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 rounded-[3rem] border-2 border-dashed border-emerald-500/10 bg-emerald-500/[0.02] transition-all duration-500">
                <div className="p-8 bg-emerald-600/5 rounded-full text-emerald-600/40">
                    <CalculatorIcon size={64} strokeWidth={1.5} />
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-800 dark:text-emerald-100 tracking-tight">Pronto para Analisar?</h3>
                    <p className="text-[15px] font-medium text-slate-500 dark:text-emerald-500/40 max-w-sm mx-auto leading-relaxed">Ajuste os parâmetros laterais e clique em calcular para processar a inteligência piauieira.</p>
                </div>
            </div>
        ) : (
            <>
                <div className="space-y-6">
                    <SectionDivider label="Métricas de Produção" />
                    <motion.div className="grid grid-cols-2 xl:grid-cols-4 gap-6"
                        initial="hidden" animate="visible"
                        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}>
                        {[
                            { label: 'Massa de Forragem', value: outputs.forageMass.toFixed(0), unit: 'kg MS / ha', icon: <Leaf />, trend: 'Capacidade de Suporte' },
                            { label: 'Cap. de Suporte', value: outputs.supportCapacity.toFixed(0), unit: 'kg PV / ha', icon: <Activity />, trend: 'Potencial Máximo' },
                            { label: 'Taxa de Lotação', value: outputs.stockingRateUA.toFixed(2), unit: `UA/ha (${outputs.stockingRateHeads.toFixed(1)} Cab)`, icon: <Beef />, trend: 'Otimização de Pastejo' },
                            { label: 'Produtividade', value: outputs.productivity.toFixed(1), unit: '@ Total Período', icon: <TrendingUp />, trend: 'Foco em Resultado', highlight: true },
                        ].map((kpi, i) => (
                            <motion.div key={i}
                                variants={{ hidden: { opacity: 0, scale: 0.95, y: 20 }, visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } } }}>
                                <DashboardKPI {...kpi} />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                <div className="space-y-6 pt-4">
                    <SectionDivider label="Performance Financeira" />
                    <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-6"
                        initial="hidden" animate="visible"
                        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>
                        {[
                            { label: 'Faturamento Bruto', value: outputs.revenue, color: 'text-emerald-600 dark:text-emerald-400', icon: <CircleDollarSign size={20} className="text-emerald-500" /> },
                            { label: 'Deduções Estimadas', value: outputs.reduction, color: 'text-rose-600', negative: true },
                            { label: 'Lucro Líquido', value: outputs.profit, color: 'text-white', featured: true },
                        ].map((card, i) => (
                            <motion.div key={i}
                                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 25 } } }}>
                                <FinancialCard {...card} />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pt-4">
                    <ChartCard title="Composição de Valor" subtitle="Análise de Fluxo" icon={<BarChart3 size={24} />}>
                        <OptimizedBarChart data={chartData} dataKey="value" />
                    </ChartCard>
                    <ChartCard title="Cenários de Escala" subtitle="Expectativa de Lucro" icon={<FileText size={24} />}>
                        <OptimizedBarChart data={scenarioData} dataKey="val" />
                    </ChartCard>
                </div>
            </>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative overflow-hidden rounded-[2.5rem] p-10 flex flex-col sm:flex-row items-center gap-8 border transition-all hover:border-emerald-500/20"
            style={{ background: 'linear-gradient(135deg, #0a110e 0%, #0d1711 100%)', borderColor: 'var(--border)' }}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[90px] rounded-full" />
            <div className="w-20 h-20 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center text-emerald-400 border border-emerald-500/10 flex-shrink-0 shadow-inner">
                <Info size={32} />
            </div>
            <div className="flex-1 text-center sm:text-left space-y-1">
                <p className="text-[11px] font-black uppercase tracking-[0.5em] text-emerald-500 mb-1 opacity-70">Monitor Inteligente</p>
                <p className="text-[15px] font-bold leading-relaxed" style={{ color: '#8fb09a' }}>
                    MF = (Amostra × 10.000 / Área) × %MS | Produtividade = R$ Líquido / Área
                </p>
            </div>
            <span className="text-[10px] font-black uppercase text-emerald-500/40 tracking-[0.3em] bg-emerald-500/5 px-6 py-3 rounded-full border border-emerald-500/10 backdrop-blur-sm">Referência: Embrapa</span>
        </motion.div>
    </div>
))
