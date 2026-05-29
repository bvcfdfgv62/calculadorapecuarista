import React from 'react'
import { Info, Download, Loader2, BarChart3, MessageCircle } from 'lucide-react'
import { SectionDivider } from './SharedUI'
import { DashboardKPI, FinancialCard } from './CalculationKPIs'
import type { CalculatorInputs, CalculatorOutputs } from '../../utils/calculator'

const ChartCard = React.lazy(() => import('./CalculationCharts').then(m => ({ default: m.ChartCard })))
const OptimizedBarChart = React.lazy(() => import('./CalculationCharts').then(m => ({ default: m.OptimizedBarChart })))

interface ResultsPanelProps {
    outputs: CalculatorOutputs | null
    inputs: CalculatorInputs
    exportToPDF: () => Promise<void>
    isExporting: boolean
    chartData: Array<{ name: string; value: number; color: string }>
    scenarioData: Array<{ name: string; val: number; color: string }>
    isCalculated: boolean
}

export const ResultsPanel = React.memo(({
    outputs,
    inputs,
    exportToPDF,
    isExporting,
    chartData,
    isCalculated
}: ResultsPanelProps) => {

    const shareWhatsApp = () => {
        if (!outputs) return
        const farm = inputs.propertyData?.farmName || "Minha Fazenda"
        let msg = `*RESUMO DA SIMULAÇÃO - ${farm}*\n\n`
        msg += `*Financeiro:*\n`
        msg += `- Receita Estimada por hectare: R$ ${outputs.revenueHa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`
        msg += `- Redução de Receita por Hectare: R$ ${outputs.reductionHa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n\n`
        msg += `*Produtivo:*\n`
        msg += `- KG MS/HA: ${outputs.forageMass.toFixed(0)}\n`
        msg += `- KG Peso Corporal: ${outputs.supportCapacity.toFixed(0)}\n`
        msg += `- Lotação Total (UA): ${outputs.stockingRateUA.toFixed(1)}\n`
        msg += `- Lotação (cab/ha): ${outputs.stockingRateHeadsHa.toFixed(1)}\n`
        msg += `- Lotação Instantânea (cab/ha): ${(outputs.stockingRateHeadsHa * inputs.paddockCount).toFixed(1)}\n`
        msg += `- Produtividade (@/ha): ${outputs.productivityHa.toFixed(1)}\n\n`
        msg += `_Gerado por Calculadora Pecuarista_`
        const url = `https://wa.me/?text=${encodeURIComponent(msg)}`
        window.open(url, '_blank')
    }

    return (
    <div className="flex-1 space-y-6">
        {/* Main Header Simples mas Elegante */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">
                    Resultados da Simulação
                </h2>
                <p className="text-gray-500 font-semibold mt-1">
                    {inputs.propertyData?.farmName || 'Propriedade Não Identificada'}
                </p>
            </div>
            <div className="flex gap-2">
                <button onClick={shareWhatsApp} disabled={!isCalculated}
                    className="bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-md active:scale-95">
                    <MessageCircle size={20} />
                    <span className="hidden sm:inline">WHATSAPP</span>
                </button>
                <button onClick={exportToPDF} disabled={isExporting || !isCalculated}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-md active:scale-95">
                    {isExporting ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
                    <span className="hidden sm:inline">{isExporting ? 'GERANDO...' : 'BAIXAR PDF'}</span>
                    <span className="sm:hidden">PDF</span>
                </button>
            </div>
        </div>

        {!isCalculated || !outputs ? (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-xl">
                <BarChart3 size={48} className="text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-600 mb-2">Nenhum cálculo realizado</h3>
                <p className="text-gray-500">
                    Preencha os dados ao lado e clique em calcular para ver os resultados.
                </p>
            </div>
        ) : (
            <>
                <div className="space-y-4">
                    <SectionDivider label="Resumo Zootécnico" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <DashboardKPI label="KG MS/HA" value={outputs.forageMass.toFixed(0)} unit="" icon={null} trend="Forragem" />
                        <DashboardKPI label="KG Peso Corporal" value={outputs.supportCapacity.toFixed(0)} unit="/ha" icon={null} trend="Suporte" />
                        <DashboardKPI label="Lotação Total" value={outputs.stockingRateUA.toFixed(2)} unit="UA" icon={null} trend="Capacidade" />
                        <DashboardKPI label="Lotação" value={outputs.stockingRateHeadsHa.toFixed(2)} unit="cab/ha" icon={null} trend="Média" />
                        <DashboardKPI label="Cabeça por hectare instantânea e real" value={(outputs.stockingRateHeadsHa * inputs.paddockCount).toFixed(2)} unit="cab/ha" icon={null} trend="Piquete" />
                        <DashboardKPI label="Produtividade" value={outputs.productivityHa.toFixed(2)} unit="@/ha" icon={null} trend="Resultado" highlight={true} />
                    </div>
                </div>

                <div className="space-y-4 pt-2">
                    <SectionDivider label="Estimativa Financeira" />
                    <div className="grid grid-cols-1 gap-4">
                        <FinancialCard label="Receita Estimada por hectare" value={outputs.revenueHa} featured={true} />
                        <FinancialCard label="Redução de Receita por Hectare" value={outputs.reductionHa} color="text-red-700" negative={true} />
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                    <React.Suspense fallback={
                        <div className="h-[280px] w-full rounded-lg bg-gray-50 border border-gray-200 flex flex-col items-center justify-center gap-3">
                            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                            <span className="text-sm font-bold text-gray-400 uppercase">Carregando Gráficos...</span>
                        </div>
                    }>
                        <ChartCard title="Análise Gráfica" subtitle="Composição do Valor">
                            <OptimizedBarChart data={chartData} dataKey="value" />
                        </ChartCard>
                    </React.Suspense>
                </div>
            </>
        )}

        <div className="bg-gray-100 p-4 rounded-lg border border-gray-300 flex items-start gap-3 mt-8">
            <Info size={24} className="text-gray-500 shrink-0 mt-0.5" />
            <div>
                <p className="font-bold text-gray-700 uppercase mb-1">Referência Embrapa</p>
                <p className="text-sm text-gray-600">
                    Fórmula base: Massa de Forragem = (Amostra × 10.000 / Área) × %MS. Os cálculos consideram perdas e consumo diário animal estipulado.
                </p>
            </div>
        </div>
    </div>
)})

ResultsPanel.displayName = 'ResultsPanel'
