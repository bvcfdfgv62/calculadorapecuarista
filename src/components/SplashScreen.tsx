import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useEffect } from 'react'

// --- Sub-component: Particle Field ---
function ParticleField() {
    const particles = Array.from({ length: 40 })
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-emerald-500/30 rounded-full"
                    initial={{
                        x: Math.random() * 2000 - 1000,
                        y: Math.random() * 2000 - 1000,
                        opacity: 0
                    }}
                    animate={{
                        opacity: [0, 0.8, 0],
                        scale: [0, 1.5, 0],
                        y: '-100vh',
                        x: i % 2 === 0 ? '+=50px' : '-=50px'
                    }}
                    transition={{
                        duration: 5 + Math.random() * 10,
                        repeat: Infinity,
                        ease: "linear",
                        delay: Math.random() * 10
                    }}
                    style={{ left: `${Math.random() * 100}%`, top: '110%' }}
                />
            ))}
        </div>
    )
}


export function SplashScreen() {
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    const springX = useSpring(mouseX, { stiffness: 100, damping: 30 })
    const springY = useSpring(mouseY, { stiffness: 100, damping: 30 })

    // Parallax transforms
    const rotateX = useTransform(springY, [-500, 500], [10, -10])
    const rotateY = useTransform(springX, [-500, 500], [-10, 10])
    const logoX = useTransform(springX, [-500, 500], [-20, 20])
    const logoY = useTransform(springY, [-500, 500], [-20, 20])
    const bgScale = useTransform(springY, [-500, 500], [1.05, 1.1])

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX - window.innerWidth / 2)
            mouseY.set(e.clientY - window.innerHeight / 2)
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{
                opacity: 0,
                scale: 1.1,
                filter: 'blur(20px)',
                transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] }
            }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950 overflow-hidden perspective-distant"
        >
            {/* 1. Deep Background Layer */}
            <motion.div
                style={{ scale: bgScale }}
                className="absolute inset-0 z-0"
            >
                <motion.img
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    src="./premium_livestock_bg_1775318109173.png"
                    className="w-full h-full object-cover grayscale brightness-50"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/80 to-emerald-950/40" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
            </motion.div>

            {/* 2. Interactive Particle Field */}
            <ParticleField />

            {/* 3. Floating Light Orbs */}
            <motion.div
                animate={{
                    x: [0, 100, -50, 0],
                    y: [0, -50, 80, 0],
                    opacity: [0.2, 0.4, 0.2]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none"
            />
            <motion.div
                animate={{
                    x: [0, -120, 70, 0],
                    y: [0, 90, -40, 0],
                    opacity: [0.1, 0.3, 0.1]
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 2 }}
                className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-500/10 blur-[180px] rounded-full pointer-events-none"
            />

            {/* 4. Main 3D Content Container */}
            <motion.div
                style={{ rotateX, rotateY, x: logoX, y: logoY }}
                className="relative z-10 flex flex-col items-center transform-gpu preserve-3d"
            >
                {/* Holographic Logo Card */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{
                        type: "spring",
                        stiffness: 100,
                        damping: 20,
                        delay: 0.2
                    }}
                    className="group relative w-48 h-48 md:w-56 md:h-56 mb-8 preserve-3d"
                >
                    {/* Main Glass Body */}
                    <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-3xl rounded-[3.5rem] border border-white/10 shadow-2xl overflow-hidden shadow-black/40">
                        {/* Shifting Shine Effect */}
                        <motion.div
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12"
                        />

                        <div className="absolute inset-0 flex items-center justify-center p-12 md:p-14">
                            <motion.img
                                src="./logo-corteva.png"
                                alt="Corteva"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
                                className="w-full h-auto filter drop-shadow-2xl transform-gpu"
                                style={{ transform: 'translateZ(30px)' }}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Minimalist Loader */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="relative w-48 h-[1px] bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: "0%" }}
                            transition={{ duration: 4, ease: [0.22, 1, 0.36, 1] }}
                            className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500"
                        />
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    )
}
