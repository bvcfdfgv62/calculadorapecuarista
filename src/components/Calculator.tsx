import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { calculateResults } from '../utils/calculator'
import type { CalculatorInputs, CalculatorOutputs } from '../utils/calculator'
import { localDB } from '../lib/storage'
import localforage from 'localforage'
import { useAuth } from '../context/AuthContext'
import { generateProfessionalPDF } from '../utils/pdfGenerator'
import { Toast } from './calculator/SharedUI'
import { InputPanel } from './calculator/InputPanel'
import { ResultsPanel } from './calculator/ResultsPanel'

const INITIAL_INPUTS: CalculatorInputs = {
    sampleArea: 1.0,
    sampleWeight: 0.35,
    dryMatterPercent: 25,
    forageSupplyPercent: 9,
    paddockCount: 1,
    occupationDays: 5,
    growthPeriod: 90,
    category: 'BoiGordo',
    bodyWeight: 255,
    gpd: 0.41,
    unavailabilityPercent: 4,
    pricePerArroba: 255,
    pastureArea: 100,
    areaUnit: 'ha'
}

export function Calculator() {
    const { user, profile } = useAuth()
    const [inputs, setInputs] = useState<CalculatorInputs>(INITIAL_INPUTS)
    const [outputs, setOutputs] = useState<CalculatorOutputs | null>(null)
    const [rawValues, setRawValues] = useState<Record<string, string>>({})
    const [isSaving, setIsSaving] = useState(false)
    const [isExporting, setIsExporting] = useState(false)
    const [toast, setToast] = useState<{ m: string, t: 'success' | 'error' } | null>(null)
    const [isCalculated, setIsCalculated] = useState(false)

    // Auto-load draft on mount
    useEffect(() => {
        if (!user?.email) return
        localforage.getItem(`@valerio:draft_${user.email}`).then((draft: any) => {
            if (draft) {
                if (draft.inputs) {
                    setInputs(prev => ({ ...prev, ...draft.inputs, propertyData: prev.propertyData }))
                }
                if (draft.rawValues) setRawValues(draft.rawValues)
            }
        }).catch(console.error)
    }, [user?.email])

    // Auto-save draft on inputs/rawValues change
    useEffect(() => {
        if (!user?.email) return
        const timer = setTimeout(() => {
            localforage.setItem(`@valerio:draft_${user.email}`, { inputs, rawValues }).catch(console.error)
        }, 1000)
        return () => clearTimeout(timer)
    }, [inputs, rawValues, user?.email])

    // Preenche os dados da fazenda automaticamente quando o perfil carrega
    useEffect(() => {
        if (profile) {
            setInputs(prev => ({
                ...prev,
                propertyData: {
                    farmName: prev.propertyData?.farmName || profile.farmName || '',
                    owner: prev.propertyData?.owner || profile.name || '',
                    city: prev.propertyData?.city || '',
                    state: prev.propertyData?.state || '',
                    phone: prev.propertyData?.phone || profile.phone || '',
                    email: prev.propertyData?.email || user?.email || ''
                }
            }))
        }
    }, [profile, user?.email])

    // Clear results on any numeric/technical input change
    useEffect(() => {
        setIsCalculated(false)
    }, [
        inputs.sampleArea, inputs.sampleWeight, inputs.dryMatterPercent, inputs.forageSupplyPercent, 
        inputs.paddockCount, inputs.occupationDays, inputs.growthPeriod, inputs.category, 
        inputs.bodyWeight, inputs.gpd, inputs.unavailabilityPercent, inputs.pricePerArroba
    ])

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setRawValues(prev => ({ ...prev, [name]: value }))
        const num = parseFloat(value.replace(',', '.'))
        if (!isNaN(num)) {
            setInputs(prev => ({ ...prev, [name]: num }))
        }
    }, [])

    const handleCalculate = useCallback(() => {
        const res = calculateResults(inputs)
        setOutputs(res)
        setIsCalculated(true)
        setToast({ m: "Cálculo processado com sucesso!", t: "success" })
    }, [inputs])

    const handleSave = useCallback(async () => {
        if (!user || !user.email || !outputs) return
        setIsSaving(true)
        try {
            await localDB.saveCalculation(user.email, inputs, outputs)
            setToast({ m: "Cálculo salvo no seu histórico!", t: 'success' })
        } catch (err: any) {
            setToast({ m: err.message || "Erro ao salvar", t: 'error' })
        } finally {
            setIsSaving(false)
        }
    }, [user, inputs, outputs])

    const handleReset = useCallback(() => {
        setInputs(INITIAL_INPUTS)
        setRawValues({})
        setOutputs(null)
        setIsCalculated(false)
        if (user?.email) localforage.removeItem(`@valerio:draft_${user.email}`).catch(console.error)
    }, [user?.email])

    const exportToPDF = useCallback(async () => {
        if (!outputs) return
        setIsExporting(true)
        try {
            await generateProfessionalPDF(inputs, outputs, inputs.propertyData?.farmName || "Simulação")
            setToast({ m: "PDF gerado e pronto para download!", t: 'success' })
        } catch (err) {
            setToast({ m: "Erro ao gerar PDF", t: 'error' })
        } finally {
            setIsExporting(false)
        }
    }, [inputs, outputs])

    const chartData = useMemo(() => outputs ? [
        { name: 'Bruto', value: outputs.revenue, color: '#10b981' },
        { name: 'Líquido', value: outputs.profit, color: '#0d8a43' }
    ] : [], [outputs])

    const scenarioData = useMemo(() => outputs ? [
        { name: '-15%', val: outputs.profit * 0.85, color: '#f43f5e' },
        { name: 'Atual', val: outputs.profit, color: '#10b981' },
        { name: '+15%', val: outputs.profit * 1.15, color: '#34d399' }
    ] : [], [outputs])

    return (
        <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-140px)] animate-fade-in relative">
            {toast && <Toast message={toast.m} type={toast.t} onClose={() => setToast(null)} />}

            <div className="w-full lg:w-[420px] shrink-0">
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
    )
}
