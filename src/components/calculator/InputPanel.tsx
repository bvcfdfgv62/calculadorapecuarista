import React from 'react'
import { Trash2, CircleDollarSign, Activity, Save, Calculator as CalculatorIcon, Info } from 'lucide-react'
import { InputField } from './SharedUI'

export const InputPanel = React.memo(({ inputs, rawValues, handleInputChange, handleReset, setInputs, isSaving, handleSave, handleCalculate, isCalculated }: any) => (
    <div className="space-y-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-green-800 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-emerald-900/40 border border-white/10">
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl opacity-50" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-400/20 rounded-full blur-xl" />

            <div className="relative z-10 flex items-center gap-5 mb-5">
                <div className="p-4 bg-white/15 rounded-[1.5rem] backdrop-blur-md shadow-inner border border-white/10">
                    <CircleDollarSign size={32} />
                </div>
                <div>
                    <h2 className="text-2xl font-black leading-none tracking-tighter uppercase mb-1">Simulador</h2>
                    <h2 className="text-xl font-bold opacity-80 leading-none tracking-tight uppercase">Pecuário</h2>
                </div>
            </div>
            <p className="relative z-10 text-[13px] font-medium text-emerald-50/70 leading-relaxed max-w-[240px]">
                Inteligência de precisão para gestão avançada de pastagens.
            </p>
        </div>

        <div className="rounded-[2.5rem] p-8 shadow-sm border transition-all duration-500"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="space-y-7">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
                        <h3 className="text-lg font-black tracking-tight" style={{ color: 'var(--foreground)' }}>Parâmetros</h3>
                    </div>
                    <button onClick={handleReset}
                        className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest px-3 py-2 rounded-xl transition-all hover:bg-rose-500/10 hover:text-rose-600 active:scale-95"
                        style={{ color: 'var(--muted)' }}>
                        <Trash2 size={13} /> Limpar
                    </button>
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest opacity-60 px-1" style={{ color: 'var(--muted)' }}>Área Amostral</label>
                    <div className="grid grid-cols-2 gap-4">
                        {[1.0, 0.25].map(val => (
                            <button key={val}
                                onClick={() => setInputs((p: any) => ({ ...p, sampleArea: val as any }))}
                                className={`py-4 rounded-2xl text-sm font-black transition-all border-2 ${inputs.sampleArea === val
                                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-700/30 scale-[1.02]'
                                    : 'border-2'}`}
                                style={inputs.sampleArea !== val ? { borderColor: 'var(--border)', background: 'var(--surface-2)', color: 'var(--muted)' } : {}}>
                                {val.toFixed(2)} m²
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-5">
                        <InputField label="Peso da amostra (kg)" name="sampleWeight" value={rawValues['sampleWeight'] ?? String(inputs.sampleWeight)} onChange={handleInputChange} tooltip="Peso verde em kg" />
                        <InputField label="% MS" name="dryMatterPercent" value={rawValues['dryMatterPercent'] ?? String(inputs.dryMatterPercent)} onChange={handleInputChange} tooltip="Matéria Seca" />
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                        <InputField label="OF (%)" name="forageSupplyPercent" value={rawValues['forageSupplyPercent'] ?? String(inputs.forageSupplyPercent)} onChange={handleInputChange} tooltip="Oferta de forragem" />
                        <InputField label="Nº piquetes" name="paddockCount" value={rawValues['paddockCount'] ?? String(inputs.paddockCount)} onChange={handleInputChange} tooltip="Número de divisões" />
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                        <InputField label="Dias de ocupação" name="occupationDays" value={rawValues['occupationDays'] ?? String(inputs.occupationDays)} onChange={handleInputChange} />
                        <InputField label="Período crescimento (dias)" name="growthPeriod" value={rawValues['growthPeriod'] ?? String(inputs.growthPeriod)} onChange={handleInputChange} required={false} />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <label className="text-[13px] font-semibold opacity-80" style={{ color: 'var(--muted)' }}>Categoria</label>
                            <span className="group relative cursor-help">
                                <Info size={13} style={{ color: 'var(--muted)' }} className="opacity-40" />
                            </span>
                        </div>
                        <div className="flex items-center gap-12 px-2">
                            {['Macho', 'Fêmea'].map((cat: any) => (
                                <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative flex items-center justify-center">
                                        <input type="radio" name="category" value={cat} checked={inputs.category === cat} onChange={() => setInputs((p: any) => ({ ...p, category: cat }))} className="sr-only" />
                                        <div className={`w-5 h-5 rounded-full border-2 transition-all ${inputs.category === cat ? 'border-emerald-500 scale-110' : 'border-slate-300 group-hover:border-slate-400'}`} />
                                        {inputs.category === cat && <div className="absolute w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                                    </div>
                                    <span className={`text-sm font-medium transition-colors ${inputs.category === cat ? 'text-emerald-700' : 'text-slate-500'}`}>{cat}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5 pt-2">
                        <InputField label="Peso corporal (kg)" name="bodyWeight" value={rawValues['bodyWeight'] ?? String(inputs.bodyWeight)} onChange={handleInputChange} />
                        <InputField label="% indisponibilidade" name="unavailabilityPercent" value={rawValues['unavailabilityPercent'] ?? String(inputs.unavailabilityPercent)} onChange={handleInputChange} />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <InputField label="GPD (kg/dia)" name="gpd" value={rawValues['gpd'] ?? String(inputs.gpd)} onChange={handleInputChange} tooltip="Ganho de Peso Diário" />
                        <InputField label="R$/@" name="pricePerArroba" value={rawValues['pricePerArroba'] ?? String(inputs.pricePerArroba)} onChange={handleInputChange} />
                    </div>
                </div>

                <div className="pt-4 space-y-4">
                    <button onClick={handleCalculate}
                        className="w-full py-5 rounded-[1.25rem] font-black uppercase text-sm tracking-[0.15em] bg-emerald-600 text-white shadow-[0_12px_24px_-8px_rgba(5,150,105,0.4)] hover:bg-emerald-500 active:scale-[0.98] transition-all flex justify-center items-center gap-3">
                        <CalculatorIcon size={18} /> Calcular Resultados
                    </button>

                    <button onClick={handleSave} disabled={isSaving || !isCalculated}
                        className={`w-full py-4 rounded-[1.25rem] font-black uppercase text-xs tracking-widest border-2 transition-all flex justify-center items-center gap-3 active:scale-[0.98] ${isCalculated ? 'border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10' : 'border-gray-200 text-gray-400 cursor-not-allowed opacity-50'}`}
                        style={{ background: 'var(--surface-2)' }}>
                        {isSaving ? <Activity className="animate-spin w-5 h-5" /> : <><Save size={16} /> Salvar no Histórico</>}
                    </button>
                </div>

                <div className="p-6 rounded-[2rem] border bg-emerald-50/30 dark:bg-emerald-950/20" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-600/10 rounded-lg text-emerald-600"><Activity size={14} /></div>
                        <span className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--muted)' }}>Memória de Inteligência</span>
                    </div>
                    <div className="space-y-2 font-mono text-[10px] opacity-70" style={{ color: 'var(--muted)' }}>
                        <p>MF = (Amostra × 10k / Área) × %MS</p>
                        <p>TL = (Util / Dias) / (PV × OF%)</p>
                        <p>Lucro = Prod × R$/@ × (1 - Perdas)</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
))
