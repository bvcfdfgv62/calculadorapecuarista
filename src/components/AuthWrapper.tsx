import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AuthWrapperProps {
    children: React.ReactNode
    view: 'login' | 'register'
    setView: (view: 'login' | 'register') => void
}

export const AuthWrapper = ({ children, view }: AuthWrapperProps) => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            {/* Header Simples com Logo */}
            <div className="mb-8 text-center">
                <img
                    src="./logo-corteva.png"
                    alt="Corteva Agriscience"
                    className="h-16 w-auto mx-auto mb-4"
                />
                <h1 className="text-2xl font-bold text-gray-900">
                    Calculadora Pecuarista
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                    Gestão fácil para o produtor rural
                </p>
            </div>

            {/* Container do Formulário */}
            <div className="w-full max-w-md">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={view}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-lg shadow border border-gray-200"
                    >
                        <React.Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /></div>}>
                            {children}
                        </React.Suspense>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}
