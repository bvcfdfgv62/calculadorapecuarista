import { motion } from 'framer-motion'

export function SplashScreen() {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8 } }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300"
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex flex-col items-center bg-white p-10 md:p-14 rounded-3xl shadow-xl border border-gray-200 max-w-sm w-full mx-4"
            >
                <div className="flex items-center gap-4 mb-8">
                    <img
                        src="./logo-corteva.png"
                        alt="Corteva"
                        className="h-16 md:h-20 w-auto object-contain"
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                    />
                    <div className="h-16 w-[2px] bg-gray-200 rounded-full"></div>
                    <div className="flex flex-col">
                        <span className="text-xl md:text-2xl font-black text-green-800 uppercase tracking-tighter leading-none">Calculadora</span>
                        <span className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Pecuarista</span>
                    </div>
                </div>
                
                <div className="flex flex-col items-center gap-4 w-full mt-4">
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2 overflow-hidden shadow-inner">
                        <motion.div 
                            className="bg-green-600 h-1.5 rounded-full"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 1.8, ease: "easeInOut" }}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-green-600 rounded-full animate-spin" />
                        <p className="text-gray-500 font-bold text-xs tracking-widest uppercase">Iniciando Ambiente Seguro</p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}
