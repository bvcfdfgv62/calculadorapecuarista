import React, { useState } from 'react'
import { Trash2, Save, Calculator as CalculatorIcon, ChevronDown, MapPin } from 'lucide-react'
import { InputField } from './SharedUI'
import type { CalculatorInputs } from '../../utils/calculator'

interface InputPanelProps {
    inputs: CalculatorInputs
    rawValues: Record<string, string>
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    handleReset: () => void
    setInputs: React.Dispatch<React.SetStateAction<CalculatorInputs>>
    isSaving: boolean
    handleSave: () => Promise<void>
    handleCalculate: () => void
    isCalculated: boolean
}

export const InputPanel = React.memo(({
    inputs,
    rawValues,
    handleInputChange,
    handleReset,
    setInputs,
    isSaving,
    handleSave,
    handleCalculate,
    isCalculated
}: InputPanelProps) => {
    const [showProperty, setShowProperty] = useState(false)

    const handlePropertyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setInputs((p) => ({
            ...p,
            propertyData: {
                farmName: p.propertyData?.farmName ?? '',
                owner: p.propertyData?.owner ?? '',
                city: p.propertyData?.city ?? '',
                state: p.propertyData?.state ?? '',
                phone: p.propertyData?.phone ?? '',
                email: p.propertyData?.email ?? '',
                ...p.propertyData,
                [name]: value
            }
        }))
    }

    return (
        <div className="space-y-6">
            {/* Header Simples */}
            <div className="bg-gradient-to-r from-green-700 to-green-800 rounded-xl p-6 text-white shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[40px] rounded-full -mr-10 -mt-10 pointer-events-none" />
                <h2 className="text-xl font-bold uppercase mb-1 tracking-tight">Simulador Pecuário</h2>
                <p className="text-sm font-medium text-green-100">
                    Insira os dados da amostra e do rebanho.
                </p>
            </div>

            {/* Parameters container */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 tracking-tight">Dados da Simulação</h3>
                        <button onClick={handleReset}
                            className="flex items-center gap-1.5 text-sm font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
                            <Trash2 size={16} /> Limpar
                        </button>
                    </div>

                    {/* Sample area selector */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Tamanho da Área Amostral</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[1.0, 0.25].map(val => (
                                <button key={val}
                                    onClick={() => setInputs((p) => ({ ...p, sampleArea: val as 1.0 | 0.25 }))}
                                    className={`py-3.5 rounded-lg text-base font-bold transition-all border ${inputs.sampleArea === val
                                        ? 'bg-green-600 border-green-700 text-white shadow-sm'
                                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'}`}>
                                    {val.toFixed(2)} m²
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main parameter inputs */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField label="Peso colhido (kg)" name="sampleWeight" value={rawValues['sampleWeight'] ?? String(inputs.sampleWeight)} onChange={handleInputChange} tooltip="Peso verde colhido" />
                            <InputField label="Matéria Seca (%)" name="dryMatterPercent" value={rawValues['dryMatterPercent'] ?? String(inputs.dryMatterPercent)} onChange={handleInputChange} tooltip="Ex: 25" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField label="Oferta (OF%)" name="forageSupplyPercent" value={rawValues['forageSupplyPercent'] ?? String(inputs.forageSupplyPercent)} onChange={handleInputChange} tooltip="Ex: 10" />
                            <InputField label="Nº de piquetes" name="paddockCount" value={rawValues['paddockCount'] ?? String(inputs.paddockCount)} onChange={handleInputChange} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField label="Dias de ocupação" name="occupationDays" value={rawValues['occupationDays'] ?? String(inputs.occupationDays)} onChange={handleInputChange} />
                            <InputField label="Período de descanso" name="growthPeriod" value={rawValues['growthPeriod'] ?? String(inputs.growthPeriod)} onChange={handleInputChange} required={false} />
                        </div>

                        {/* Categoria do Gado Dropdown */}
                        <div className="space-y-1.5 pt-2">
                            <label className="text-sm font-bold text-gray-700">
                                Categoria Animal
                            </label>
                            <div className="relative">
                                <select
                                    name="category"
                                    value={inputs.category}
                                    onChange={(e) => setInputs((p) => ({ ...p, category: e.target.value as any }))}
                                    className="w-full py-3 px-4 rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 font-semibold text-base appearance-none"
                                >
                                    <option value="Bezerro">Bezerro / Bezerra (Desmama)</option>
                                    <option value="Novilha">Garrote / Novilha (Recria)</option>
                                    <option value="BoiGordo">Boi Gordo / Touro (Terminação)</option>
                                    <option value="VacaCria">Vaca de Cria (Lactante)</option>
                                    <option value="VacaSeca">Vaca Seca / Solteira</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                    <ChevronDown size={18} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <InputField label="Peso do Animal (kg)" name="bodyWeight" value={rawValues['bodyWeight'] ?? String(inputs.bodyWeight)} onChange={handleInputChange} />
                            <InputField label="% de Infestação" name="unavailabilityPercent" value={rawValues['unavailabilityPercent'] ?? String(inputs.unavailabilityPercent)} onChange={handleInputChange} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField label="GPD (kg/dia)" name="gpd" value={rawValues['gpd'] ?? String(inputs.gpd)} onChange={handleInputChange} />
                            <InputField label="Preço da Arroba (R$)" name="pricePerArroba" value={rawValues['pricePerArroba'] ?? String(inputs.pricePerArroba)} onChange={handleInputChange} />
                        </div>
                    </div>

                    {/* Área Total */}
                    <div className="space-y-3 pt-2">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Área Total do Pasto</label>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="number"
                                name="pastureArea"
                                value={rawValues['pastureArea'] ?? String(inputs.pastureArea)}
                                onChange={handleInputChange}
                                className="flex-1 rounded-md px-3 py-2 border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-green-500 font-semibold text-gray-900"
                            />
                            <select
                                name="areaUnit"
                                value={inputs.areaUnit}
                                onChange={(e) => setInputs(p => ({ ...p, areaUnit: e.target.value as any }))}
                                className="w-full sm:w-36 rounded-md px-2 py-2 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 font-semibold"
                            >
                                <option value="ha">Hectares</option>
                                <option value="alq_sp">Alq. SP (2.42)</option>
                                <option value="alq_mg">Alq. MG (4.84)</option>
                            </select>
                        </div>
                    </div>

                    {/* Propriedade (collapsible) */}
                    <div className="border border-gray-300 rounded-md overflow-hidden mt-4 bg-gray-50">
                        <button
                            onClick={() => setShowProperty(!showProperty)}
                            className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <MapPin size={18} className="text-gray-600" />
                                <span className="text-sm font-bold text-gray-800 uppercase">
                                    Identificação da Propriedade
                                </span>
                            </div>
                            <ChevronDown size={18} className={`text-gray-600 transform transition-transform ${showProperty ? 'rotate-180' : ''}`} />
                        </button>

                        {showProperty && (
                            <div className="p-4 border-t border-gray-200 bg-white space-y-4">
                                <InputField label="Nome da Fazenda" name="farmName" value={inputs.propertyData?.farmName ?? ''} onChange={handlePropertyChange} required={false} />
                                <InputField label="Proprietário" name="owner" value={inputs.propertyData?.owner ?? ''} onChange={handlePropertyChange} required={false} />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <InputField label="Cidade" name="city" value={inputs.propertyData?.city ?? ''} onChange={handlePropertyChange} required={false} />
                                    <InputField label="Estado (UF)" name="state" value={inputs.propertyData?.state ?? ''} onChange={handlePropertyChange} required={false} />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <InputField label="Telefone" name="phone" value={inputs.propertyData?.phone ?? ''} onChange={handlePropertyChange} required={false} />
                                    <InputField label="E-mail" name="email" value={inputs.propertyData?.email ?? ''} onChange={handlePropertyChange} required={false} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="pt-4 space-y-3">
                        <button onClick={handleCalculate}
                            className="w-full py-4 rounded-md font-bold uppercase text-lg bg-green-700 text-white hover:bg-green-800 active:scale-95 transition-all flex justify-center items-center gap-2 shadow">
                            <CalculatorIcon size={20} /> Calcular Resultados
                        </button>

                        <button onClick={handleSave} disabled={isSaving || !isCalculated}
                            className={`w-full py-3 rounded-md font-bold uppercase text-sm border flex justify-center items-center gap-2 transition-all ${isCalculated ? 'border-gray-400 text-gray-800 hover:bg-gray-100' : 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-300 text-gray-400'}`}>
                            {isSaving ? 'Salvando...' : <><Save size={18} /> Salvar no Histórico</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
})

InputPanel.displayName = 'InputPanel'
