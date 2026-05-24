import { useState } from 'react'
import { localDB } from '../lib/storage'
import localforage from 'localforage'
import { supabase, isMockMode } from '../lib/supabase'
import { Database, Download, Upload, Trash2, ShieldAlert, Loader2, CheckCircle2, Key } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { generateAccessCode } from '../lib/accessCode'

export const AdminPanel = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [newToken, setNewToken] = useState<string | null>(null)

  const isAdminEmail = user?.email === 'valerio@gmail.com' || user?.email === 'kaian@gmail.com'

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
    if (!isAdminEmail) {
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

  // 1. Exportar Backup como JSON
  const handleExportBackup = async () => {
    try {
      if (!user || !user.email) {
        showToast('Você precisa estar logado para exportar.', 'error')
        return
      }
      setLoading(true)
      const history = await localDB.getHistory(user.email)
      const profile = localDB.getProfile()
      
      const backupData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        profile,
        history,
      }

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2))
      const downloadAnchor = document.createElement('a')
      downloadAnchor.setAttribute("href", dataStr)
      downloadAnchor.setAttribute("download", `backup_calculadora_pecuarista_${new Date().toISOString().split('T')[0]}.json`)
      document.body.appendChild(downloadAnchor)
      downloadAnchor.click()
      downloadAnchor.remove()

      showToast('Backup exportado com sucesso!', 'success')
    } catch (err) {
      showToast('Erro ao exportar o backup.', 'error')
    } finally {
      setLoading(false)
    }
  }

  // 2. Importar Backup de arquivo JSON
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader()
    const file = e.target.files?.[0]
    
    if (!file) return

    setLoading(true)
    fileReader.onload = async (event) => {
      try {
        if (!user || !user.email) throw new Error('Usuário não identificado.')
        const parsedData = JSON.parse(event.target?.result as string)
        
        if (!parsedData.history || !Array.isArray(parsedData.history)) {
          throw new Error('Formato de arquivo de backup inválido.')
        }

        if (parsedData.profile) {
          localDB.saveProfile(parsedData.profile)
        }

        const currentHistory = await localDB.getHistory(user.email)
        const newHistory = parsedData.history

        const mergedHistory = [...newHistory]
        currentHistory.forEach(item => {
          if (!mergedHistory.some(m => m.id === item.id)) {
            mergedHistory.push(item)
          }
        })

        const userKey = `@valerio:calculations_${user.email}`
        await localforage.setItem(userKey, mergedHistory)
        
        showToast('Backup restaurado com sucesso!', 'success')
        setTimeout(() => window.location.reload(), 1500)
      } catch (err: any) {
        showToast(err.message || 'Erro ao importar arquivo.', 'error')
      } finally {
        setLoading(false)
      }
    }
    fileReader.readAsText(file)
  }

  // 3. Limpar todos os dados do dispositivo
  const handleClearAll = async () => {
    if (window.confirm('ATENÇÃO: Isso apagará permanentemente todos os cálculos. Deseja continuar?')) {
      try {
        setLoading(true)
        await localDB.clearAllData()
        showToast('Dados apagados com sucesso.', 'success')
        setTimeout(() => window.location.reload(), 1500)
      } catch (err) {
        showToast('Erro ao apagar dados.', 'error')
      } finally {
        setLoading(false)
      }
    }
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
          <p className="text-gray-600 font-medium">Controle seus dados locais.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-green-100 rounded text-green-700">
            <Database size={24} />
          </div>
          <span className="text-sm font-bold text-green-700 uppercase">Modo Offline</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card: Gerar Token (Apenas Super Admins) */}
        {isAdminEmail && (
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

        {/* Card: Exportar */}
        <div className="p-6 rounded-lg bg-white border border-gray-200 shadow-sm flex flex-col justify-between h-64">
          <div className="space-y-3">
            <div className="p-3 bg-green-100 text-green-700 rounded-md w-fit">
              <Download size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 uppercase">Exportar Backup</h3>
            <p className="text-sm text-gray-600">
              Baixe um arquivo seguro com seus cálculos para guardar ou trocar de celular.
            </p>
          </div>
          <button
            onClick={handleExportBackup}
            disabled={loading}
            className="w-full py-3 rounded-md bg-green-700 hover:bg-green-800 text-white font-bold uppercase transition-colors flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Exportar Dados'}
          </button>
        </div>

        {/* Card: Importar */}
        <div className="p-6 rounded-lg bg-white border border-gray-200 shadow-sm flex flex-col justify-between h-64">
          <div className="space-y-3">
            <div className="p-3 bg-blue-100 text-blue-700 rounded-md w-fit">
              <Upload size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 uppercase">Restaurar Backup</h3>
            <p className="text-sm text-gray-600">
              Selecione o arquivo de backup baixado anteriormente para recuperar seus dados.
            </p>
          </div>
          <label className="w-full py-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase transition-colors cursor-pointer mt-4 flex items-center justify-center gap-2 text-center">
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              disabled={loading}
              className="hidden"
            />
            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Importar Dados'}
          </label>
        </div>

        {/* Card: Resetar */}
        <div className="p-6 rounded-lg bg-white border border-gray-200 shadow-sm flex flex-col justify-between h-64">
          <div className="space-y-3">
            <div className="p-3 bg-red-100 text-red-600 rounded-md w-fit">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 uppercase">Limpar Tudo</h3>
            <p className="text-sm text-gray-600">
              Apaga permanentemente todos os cálculos deste aparelho.
            </p>
          </div>
          <button
            onClick={handleClearAll}
            disabled={loading}
            className="w-full py-3 rounded-md bg-red-600 hover:bg-red-700 text-white font-bold uppercase transition-colors flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Limpar Aparelho'}
          </button>
        </div>
      </div>
    </div>
  )
}
