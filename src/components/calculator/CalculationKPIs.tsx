import React from 'react'
import { TrendingUp } from 'lucide-react'

export const DashboardKPI = React.memo(({ label, value, unit, icon, trend, highlight }: any) => (
    <div className={`kpi-card group relative rounded-2xl p-6 border transition-all duration-300 ${highlight ? 'ring-2 ring-emerald-500/30' : 'hover:border-emerald-500/30'}`}
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex flex-col h-full">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${highlight ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'group-hover:bg-emerald-600/15 group-hover:text-emerald-500'}`}
                    style={!highlight ? { background: 'var(--surface-2)', color: 'var(--muted)' } : {}}>
                    {React.cloneElement(icon as React.ReactElement<any>, { size: 22 })}
                </div>
            </div>
            <div className="space-y-1">
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-emerald-500/60">{label}</p>
                <h3 className="text-2xl font-black leading-none tabular-nums tracking-tighter" style={{ color: 'var(--foreground)' }}>{value}</h3>
                <p className="text-[12px] font-bold text-slate-400 dark:text-emerald-600/40">{unit}</p>
            </div>
            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <p className="text-[11px] font-black uppercase tracking-tighter text-emerald-600 dark:text-emerald-400">{trend}</p>
            </div>
        </div>
    </div>
))

export const FinancialCard = React.memo(({ label, value, color, negative, featured, icon }: any) => {
    // ... featured logic stays same ...
    if (featured) {
        return (
            <div className="financial-card relative overflow-hidden rounded-[2.5rem] p-8 shadow-2xl border border-emerald-500/20"
                style={{ background: 'linear-gradient(135deg, #064e29 0%, #0d8a43 100%)' }}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[50px] rounded-full -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-emerald-300/15 rounded-full blur-xl" />
                <div className="relative z-10 flex flex-col gap-5 animate-sweep">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-300">Lucro Líquido</p>
                        <TrendingUp size={18} className="text-emerald-300" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-4xl font-black tracking-tighter leading-none tabular-nums text-white">
                            R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </h3>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-100">Projeção Estimada</p>
                    </div>
                </div>
            </div>
        )
    }
    return (
        <div className="financial-card relative overflow-hidden rounded-[2.5rem] p-8 border shadow-xl transition-all duration-300 hover:border-emerald-500/20"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-emerald-500/60">{label}</p>
                    {icon && <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner" style={{ background: 'var(--surface-2)' }}>{icon}</div>}
                </div>
                <div className="space-y-2">
                    <h3 className={`text-3xl font-black tracking-tighter leading-none tabular-nums ${color}`}>
                        {negative ? '-' : ''} R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </h3>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-emerald-600/40">Estimativa do Período</p>
                </div>
            </div>
        </div>
    )
})
