import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Info } from 'lucide-react'

export const Toast = React.memo(({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => {
    useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t) }, [onClose])
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded shadow-lg font-bold text-sm flex items-center gap-3 whitespace-nowrap ${type === 'success' ? 'bg-green-700 text-white' : 'bg-red-700 text-white'}`}
        >
            {type === 'success' ? '✓' : '✕'} {message}
        </motion.div>
    )
})

Toast.displayName = 'Toast'

export const SectionDivider = React.memo(({ label }: { label: string }) => (
    <div className="flex items-center gap-4 py-4">
        <div className="h-px flex-1 bg-gray-300" />
        <span className="text-sm font-bold text-gray-500 uppercase">{label}</span>
        <div className="h-px flex-1 bg-gray-300" />
    </div>
))

SectionDivider.displayName = 'SectionDivider'

export const InputField = React.memo(({ label, name, value, onChange, placeholder, type = "text", tooltip, required = true }: any) => (
    <div className="space-y-1 flex-1 min-w-[120px]">
        <div className="flex items-center gap-1">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {tooltip && (
                <span className="group relative cursor-help">
                    <Info size={14} className="text-gray-400 hover:text-gray-600" />
                    <span className="absolute left-1/2 -translate-x-1/2 -top-10 w-48 bg-gray-800 text-white text-xs rounded px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-md text-center">{tooltip}</span>
                </span>
            )}
        </div>
        <input type={type} name={name} value={value ?? ''} onChange={onChange} placeholder={placeholder}
            className="w-full rounded-lg py-3 px-4 text-base font-semibold placeholder-gray-400 transition-all focus:outline-none border border-gray-200 bg-gray-50 text-gray-900 focus:border-green-600 focus:ring-2 focus:ring-green-600/20 hover:border-gray-300"
        />
    </div>
))

InputField.displayName = 'InputField'
