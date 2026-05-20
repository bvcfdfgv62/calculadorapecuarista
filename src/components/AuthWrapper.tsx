import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AuthWrapperProps {
    children: React.ReactNode
    view: 'login' | 'register'
    setView: (view: 'login' | 'register') => void  // kept for App.tsx compat
}

export const AuthWrapper = ({ children, view }: AuthWrapperProps) => {
    return (
        <div className="lg:min-h-screen lg:grid lg:grid-cols-2 block bg-white selection:bg-emerald-100">
            {/* ========== BRANDING SIDE — Desktop Only ========== */}
            <div className="hidden lg:flex relative overflow-hidden bg-slate-900 items-center justify-center p-20">
                <motion.img
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1.0, opacity: 0.8 }}
                    transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
                    src="./premium_livestock_bg_1775318109173.png"
                    className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Modern Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/40 to-emerald-900/30" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

                <div className="relative z-10 flex flex-col items-center max-w-sm text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                        className="glass-panel p-12 rounded-[4rem] mb-12 shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-sweep"
                    >
                        <img
                            src="./logo-corteva.png"
                            alt="Corteva Agriscience"
                            className="h-32 w-auto filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]"
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-6"
                    >
                        <h2 className="text-4xl font-black text-white leading-tight uppercase tracking-tighter">
                            Excelência no Controle <br /> Pecuário
                        </h2>
                        <div className="h-1 w-12 bg-emerald-500 mx-auto rounded-full" />
                        <p className="text-slate-200 text-lg font-medium leading-relaxed">
                            Tecnologia Corteva para o pecuarista de alta performance.
                        </p>
                    </motion.div>
                </div>

                {/* Subtle light spots */}
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full" />
            </div>

            {/* ========== FORM SIDE ========== */}
            <div className="lg:flex lg:flex-col lg:relative lg:overflow-y-auto">

                {/* ===== MOBILE HERO — Fixed pixel height ===== */}
                <div className="lg:hidden relative overflow-hidden" style={{ height: '220px' }}>
                    {/* Background Image */}
                    <motion.img
                        initial={{ scale: 1.15, opacity: 0 }}
                        animate={{ scale: 1.0, opacity: 1 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        src="./premium_livestock_bg_1775318109173.png"
                        className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Dark gradient overlays */}
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-900/30 to-slate-950/90" />
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/40 to-transparent" />

                    {/* Ambient glow */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-500/20 blur-[60px] rounded-full" />

                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col items-center justify-center px-8 pb-4 pt-8">
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.85 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: 0.15, type: "spring", stiffness: 120, damping: 14 }}
                            className="mb-5"
                        >
                            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl px-8 py-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                                <img
                                    src="./logo-corteva.png"
                                    alt="Corteva Agriscience"
                                    className="h-14 w-auto filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35 }}
                            className="text-center"
                        >
                            <h1 className="text-xl font-black text-white uppercase tracking-tight leading-none drop-shadow-lg">
                                Calculadora Pecuarista
                            </h1>
                            <div className="flex items-center gap-2 justify-center mt-2">
                                <div className="h-px w-8 bg-emerald-400/60 rounded-full" />
                                <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-[0.2em]">
                                    Corteva Official
                                </p>
                                <div className="h-px w-8 bg-emerald-400/60 rounded-full" />
                            </div>
                        </motion.div>
                    </div>

                    {/* Bottom Wave / Soft Fade Transition */}
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#f8faf9] to-transparent" />
                </div>

                {/* ===== FORM CONTAINER ===== */}
                <div className="lg:flex-1 lg:flex lg:items-center lg:justify-center px-5 py-5 sm:px-10 sm:py-8 lg:p-24 bg-[#f8faf9]">
                    <div className="w-full max-w-[440px] mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={view}
                                initial={{ opacity: 0, x: 20, filter: "blur(4px)" }}
                                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                exit={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                                transition={{ duration: 0.4, ease: "anticipate" }}
                            >
                                <React.Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" /></div>}>
                                    {children}
                                </React.Suspense>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    )
}
