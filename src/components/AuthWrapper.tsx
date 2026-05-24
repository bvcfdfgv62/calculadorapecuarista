import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AuthWrapperProps {
    children: React.ReactNode
    view: 'login' | 'register'
    setView: (view: 'login' | 'register') => void
}

export const AuthWrapper = ({ children, view }: AuthWrapperProps) => {
    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-white font-sans">
            
            {/* Lado Esquerdo - Imagem (Oculto no mobile, 50% no Desktop) */}
            <div className="hidden md:flex md:w-1/2 relative bg-gray-900 overflow-hidden">
                <div className="absolute inset-0">
                    <img 
                        src="https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c10?q=80&w=2000&auto=format&fit=crop" 
                        className="w-full h-full object-cover opacity-70 mix-blend-overlay" 
                        alt="Agricultura e Pecuária" 
                    />
                </div>
                {/* Degradê sobre a imagem para leitura do texto */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1f11] via-transparent to-transparent opacity-90"></div>
                
                {/* Overlay Text */}
                <div className="absolute bottom-0 left-0 p-12 lg:p-16 text-white z-10 w-full">
                    <h2 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight tracking-tight text-white">
                        O futuro da gestão<br />pecuária começa aqui.
                    </h2>
                    <p className="text-lg text-gray-300 max-w-lg font-medium leading-relaxed">
                        Acesse as métricas da sua fazenda com precisão, segurança e tecnologia de ponta desenvolvida para o produtor rural.
                    </p>
                </div>
            </div>

            {/* Lado Direito - Formulário */}
            <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-24 bg-white relative">
                
                <div className="w-full max-w-md mx-auto">
                    
                    {/* Cabeçalho do Form e Logo */}
                    <div className="mb-10 text-center md:text-left">
                        <img
                            src="./logo-corteva.png"
                            alt="Corteva Agriscience"
                            className="h-16 sm:h-20 w-auto mb-8 mx-auto md:mx-0 object-contain"
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
                            <React.Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="w-8 h-8 border-2 border-green-700 border-t-transparent rounded-full animate-spin" /></div>}>
                                {children}
                            </React.Suspense>
                        </motion.div>
                    </AnimatePresence>

                    {/* Footer */}
                    <div className="mt-12 text-center md:text-left text-sm text-gray-400 font-medium">
                        <p>© {new Date().getFullYear()} Corteva Agriscience. Todos os direitos reservados.</p>
                    </div>

                </div>
            </div>
            
        </div>
    )
}
