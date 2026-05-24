import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AuthWrapperProps {
    children: React.ReactNode
    view: 'login' | 'register'
    setView: (view: 'login' | 'register') => void
}

export const AuthWrapper = ({ children, view }: AuthWrapperProps) => {
    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-8 bg-gray-50 overflow-hidden font-sans">
            {/* Background elements to make it look premium (Glassmorphism blobs) */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-green-200/40 blur-3xl opacity-70"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-200/40 blur-3xl opacity-70"></div>
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-blue-100/40 blur-3xl opacity-50"></div>
            </div>

            {/* Container do Formulário */}
            <div className="w-full max-w-md relative z-10">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 overflow-hidden">
                    
                    {/* Header com Logo - Fixo dentro do card */}
                    <div className="pt-10 px-8 pb-4 text-center">
                        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white shadow-sm border border-gray-100 mb-6">
                            <img
                                src="./logo-corteva.png"
                                alt="Corteva Agriscience"
                                className="h-10 w-auto object-contain"
                            />
                        </div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                            Calculadora Pecuarista
                        </h1>
                        <p className="text-gray-500 text-sm mt-1 font-medium">
                            Gestão fácil para o produtor rural
                        </p>
                    </div>

                    {/* Divisor suave */}
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-50"></div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={view}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                            <React.Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /></div>}>
                                {children}
                            </React.Suspense>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="mt-8 text-center text-xs font-medium text-gray-400">
                    <p>© {new Date().getFullYear()} Corteva Agriscience.<br className="sm:hidden" /> Todos os direitos reservados.</p>
                </div>
            </div>
        </div>
    )
}
