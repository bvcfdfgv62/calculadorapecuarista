import React from 'react'
import { TrendingUp } from 'lucide-react'

interface DashboardKPIProps {
    label: string
    value: string
    unit: string
    icon: React.ReactNode
    trend: string
    highlight?: boolean
}

export const DashboardKPI = React.memo(({
    label,
    value,
    unit,
    icon,
    trend,
    highlight
}: DashboardKPIProps) => (
    <div className={`p-5 rounded-xl border transition-all ${highlight ? 'bg-green-50/50 border-green-500 shadow-sm' : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm hover:shadow'}`}>
        <div className="flex flex-col h-full justify-between gap-4">
            <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${highlight ? 'bg-green-600 text-white shadow-md' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}>
                    {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 24 }) : icon}
                </div>
            </div>
            
            <div>
                <p className="text-sm font-bold text-gray-600 uppercase mb-1">{label}</p>
                <div className="flex items-baseline gap-1">
                    <h3 className="text-2xl font-bold text-gray-900 leading-none">{value}</h3>
                    <span className="text-sm font-semibold text-gray-500">{unit}</span>
                </div>
            </div>

            <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-xs font-bold text-gray-500 uppercase">{trend}</p>
            </div>
        </div>
    </div>
))

DashboardKPI.displayName = 'DashboardKPI'

interface FinancialCardProps {
    label?: string
    value: number
    color?: string
    negative?: boolean
    featured?: boolean
    icon?: React.ReactNode
}

export const FinancialCard = React.memo(({
    label,
    value,
    color,
    negative,
    featured,
    icon
}: FinancialCardProps) => {
    if (featured) {
        return (
            <div className="rounded-xl p-6 border border-green-600 bg-gradient-to-br from-green-700 to-green-800 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[40px] rounded-full -mr-16 -mt-16 pointer-events-none" />
                <div className="relative z-10 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-bold uppercase tracking-widest text-green-100">{label || 'Destaque'}</p>
                        <TrendingUp size={24} className="text-green-300" />
                    </div>
                    <div>
                        <h3 className="text-3xl sm:text-4xl font-black leading-none mb-1 tracking-tight">
                            R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </h3>
                        <p className="text-xs font-bold text-green-200 uppercase tracking-widest mt-2">Total Projetado no Período</p>
                    </div>
                </div>
            </div>
        )
    }
    return (
        <div className="rounded-xl p-6 bg-white border border-gray-200 shadow-sm flex flex-col gap-4 hover:shadow transition-shadow">
            <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{label}</p>
                {icon && <div className="text-gray-400 bg-gray-50 p-2 rounded-lg border border-gray-100">{icon}</div>}
            </div>
            <div>
                <h3 className={`text-2xl font-black leading-none tracking-tight ${color || 'text-gray-900'}`}>
                    {negative ? '-' : ''} R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Estimativa do Período</p>
            </div>
        </div>
    )
})

FinancialCard.displayName = 'FinancialCard'
