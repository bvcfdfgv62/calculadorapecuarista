import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Info } from 'lucide-react'

export const Toast = React.memo(({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => {
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

export const SectionDivider = React.memo(({ label }: { label: string }) => (
    <div className="flex items-center gap-4 py-2">
        <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] whitespace-nowrap opacity-60" style={{ color: 'var(--muted)' }}>{label}</span>
        <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
    </div>
))

export const InputField = React.memo(({ label, name, value, onChange, placeholder, type = "text", tooltip, required = true }: any) => (
    <div className="space-y-1.5 flex-1 min-w-[120px]">
        <div className="flex items-center gap-1">
            <label className="text-[13px] font-semibold opacity-80" style={{ color: 'var(--muted)' }}>
                {label} {required && <span>*</span>}
            </label>
            {tooltip && (
                <span className="group relative cursor-help">
                    <Info size={13} style={{ color: 'var(--muted)' }} className="opacity-40" />
                    <span className="absolute left-1/2 -translate-x-1/2 -top-9 w-52 bg-slate-800 text-white text-xs rounded-lg px-2.5 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 leading-snug font-normal shadow-xl border border-white/10">{tooltip}</span>
                </span>
            )}
        </div>
        <input type={type} name={name} value={value ?? ''} onChange={onChange} placeholder={placeholder}
            className="w-full rounded-xl py-3 px-4 text-sm font-medium placeholder-slate-400 transition-all focus:outline-none border shadow-sm hover:border-emerald-500/50 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
    </div>
))
