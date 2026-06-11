import { useState } from 'react'
import { localDB } from '../lib/storage'
import localforage from 'localforage'
import { supabase, isMockMode } from '../lib/supabase'
import { Database, Download, Upload, Trash2, ShieldAlert, Loader2, CheckCircle2, Key } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { generateAccessCode } from '../lib/accessCode'

export const AdminPanel = () => {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [newToken, setNewToken] = useState<string | null>(null)

  const isAdmin = profile?.role === 'admin'

  const showToast = (msg: string, type: 'success' | 'error') => {
    if (type === 'success') {
      setSuccessMessage(msg)
      setTimeout(() => setSuccessMessage(null), 3000)
    } else {
      setErrorMessage(msg)
      setTimeout(() => setErrorMessage(null), 3000)
    }
  }

  const handleGenerateToken = () => {
    if (!isAdmin) {
      showToast('Apenas administradores podem gerar códigos.', 'error')
      return
    }
    
    setLoading(true)
    setTimeout(() => {
        try {
          const code = generateAccessCode()
          setNewToken(code)
          showToast('Código gerado! Copie para enviar ao produtor.', 'success')
        } catch (err: any) {
          showToast('Erro ao gerar o código.', 'error')
        } finally {
          setLoading(false)
        }
    }, 500)
  }



  return (
    <div className="space-y-6">
      {/* Toast de Notificação */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 p-4 bg-green-600 text-white rounded-md shadow-lg flex items-center gap-3 font-bold"
          >
            <CheckCircle2 size={20} />
            {successMessage}
          </motion.div>
        )}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 p-4 bg-red-600 text-white rounded-md shadow-lg flex items-center gap-3 font-bold"
          >
            <ShieldAlert size={20} />
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 rounded-lg bg-white border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 uppercase">Administração</h2>
          <p className="text-gray-600 font-medium">Gerencie os acessos do sistema.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-green-100 rounded text-green-700">
            <ShieldAlert size={24} />
          </div>
          <span className="text-sm font-bold text-green-700 uppercase">Administrador</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card: Gerar Token (Apenas Super Admins) */}
        {isAdmin && (
          <div className="p-6 rounded-lg bg-green-50 border border-green-200 shadow-sm flex flex-col justify-between h-64 md:col-span-3 lg:col-span-1">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-green-600 text-white rounded-md w-fit shadow-sm">
                  <Key size={24} />
                </div>
                {newToken && (
                  <span className="bg-white border border-green-200 text-green-800 text-lg font-mono font-bold px-4 py-1 rounded-md shadow-sm">
                    {newToken}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-green-900 uppercase">Gerar Código</h3>
              <p className="text-sm text-green-800">
                Gere um novo código de acesso único para enviar a um produtor.
              </p>
            </div>
            <button
              onClick={handleGenerateToken}
              disabled={loading}
              className="w-full py-3 rounded-md bg-green-600 hover:bg-green-700 text-white font-bold uppercase transition-colors flex items-center justify-center gap-2 mt-4 shadow-sm"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : 'Criar Novo Código'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
