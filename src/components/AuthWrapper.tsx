import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AuthWrapperProps {
    children: React.ReactNode
    view: 'login' | 'register'
    setView: (view: 'login' | 'register') => void
}

export const AuthWrapper = ({ children, view }: AuthWrapperProps) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans p-4 sm:p-8">
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-12 relative overflow-hidden">
                {/* Detalhe de cor sutil no topo do card */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-700 to-green-600"></div>
                
                {/* Cabeçalho do Form e Logo */}
                <div className="mb-10 text-center">
                    <img
                        src="./logo-corteva.png"
                        alt="Corteva Agriscience"
                        className="h-16 sm:h-20 w-auto mb-8 mx-auto object-contain"
                    />
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
                        Calculadora Pecuarista
                    </h1>
                    <p className="text-gray-500 text-base">
                        Bem-vindo(a) à plataforma oficial.
                    </p>
                </div>

                {/* Formulário animado */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={view}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        <React.Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#005ea2] border-t-transparent rounded-full animate-spin" /></div>}>
                            {children}
                        </React.Suspense>
                    </motion.div>
                </AnimatePresence>

                {/* Footer */}
                <div className="mt-12 text-center text-sm text-gray-400 font-medium">
                    <p>© {new Date().getFullYear()} Corteva Agriscience. Todos os direitos reservados.</p>
                </div>
            </div>
        </div>
    )
}
