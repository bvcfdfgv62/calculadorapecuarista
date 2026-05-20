import { useState } from 'react'
import { localDB } from '../lib/storage'
import { Database, Download, Upload, Trash2, ShieldAlert, Loader2, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export const AdminPanel = () => {
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const showToast = (msg: string, type: 'success' | 'error') => {
    if (type === 'success') {
      setSuccessMessage(msg)
      setTimeout(() => setSuccessMessage(null), 3000)
    } else {
      setErrorMessage(msg)
      setTimeout(() => setErrorMessage(null), 3000)
    }
  }

  // 1. Exportar Backup como JSON
  const handleExportBackup = () => {
    try {
      setLoading(true)
      const history = localDB.getHistory()
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
    fileReader.onload = (event) => {
      try {
        const parsedData = JSON.parse(event.target?.result as string)
        
        if (!parsedData.history || !Array.isArray(parsedData.history)) {
          throw new Error('Formato de arquivo de backup inválido.')
        }

        // Salva o perfil se houver no backup
        if (parsedData.profile) {
          localDB.saveProfile(parsedData.profile)
        }

        // Sincroniza o histórico mesclando ou substituindo
        const currentHistory = localDB.getHistory()
        const newHistory = parsedData.history

        // Evita duplicatas por ID
        const mergedHistory = [...newHistory]
        currentHistory.forEach(item => {
          if (!mergedHistory.some(m => m.id === item.id)) {
            mergedHistory.push(item)
          }
        })

        localStorage.setItem('@valerio:calculations', JSON.stringify(mergedHistory))
        
        showToast('Backup restaurado e mesclado com sucesso!', 'success')
        // Recarrega a página após 1.5s para aplicar mudanças
        setTimeout(() => window.location.reload(), 1500)
      } catch (err: any) {
        showToast(err.message || 'Erro ao importar arquivo de backup.', 'error')
      } finally {
        setLoading(false)
      }
    }
    fileReader.readAsText(file)
  }

  // 3. Limpar todos os dados do dispositivo
  const handleClearAll = () => {
    if (window.confirm('ATENÇÃO: Isso apagará permanentemente todos os cálculos e dados de perfil deste aparelho. Deseja continuar?')) {
      try {
        setLoading(true)
        localDB.clearAllData()
        showToast('Todos os dados locais foram apagados.', 'success')
        setTimeout(() => window.location.reload(), 1500)
      } catch (err) {
        showToast('Erro ao apagar os dados.', 'error')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* Toast de Notificação */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 p-4 bg-emerald-600 text-white rounded-2xl shadow-xl flex items-center gap-3 font-semibold text-sm"
          >
            <CheckCircle2 size={18} />
            {successMessage}
          </motion.div>
        )}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 p-4 bg-rose-600 text-white rounded-2xl shadow-xl flex items-center gap-3 font-semibold text-sm"
          >
            <ShieldAlert size={18} />
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-8 rounded-[2.5rem] border shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight uppercase" style={{ color: 'var(--foreground)' }}>Gerenciamento de Dados</h2>
          <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Controle de forma autônoma os dados locais no seu dispositivo.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600">
            <Database size={24} />
          </div>
          <span className="text-xs font-black uppercase text-emerald-600 tracking-wider">Modo Offline Ativo</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card: Exportar */}
        <div className="p-8 rounded-[2rem] border transition-all flex flex-col justify-between h-64 shadow-sm hover:shadow-md" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="space-y-3">
            <div className="p-3.5 bg-emerald-500/10 text-emerald-600 rounded-2xl w-fit">
              <Download size={22} />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight" style={{ color: 'var(--foreground)' }}>Exportar Backup</h3>
            <p className="text-xs font-medium leading-relaxed" style={{ color: 'var(--muted)' }}>
              Baixe um arquivo JSON seguro com todos os seus cálculos e configurações de perfil para guardar ou transferir de aparelho.
            </p>
          </div>
          <button
            onClick={handleExportBackup}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider transition-colors cursor-pointer mt-4 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : 'Exportar (.json)'}
          </button>
        </div>

        {/* Card: Importar */}
        <div className="p-8 rounded-[2rem] border transition-all flex flex-col justify-between h-64 shadow-sm hover:shadow-md" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="space-y-3">
            <div className="p-3.5 bg-indigo-500/10 text-indigo-600 rounded-2xl w-fit">
              <Upload size={22} />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight" style={{ color: 'var(--foreground)' }}>Restaurar Backup</h3>
            <p className="text-xs font-medium leading-relaxed" style={{ color: 'var(--muted)' }}>
              Selecione um arquivo de backup (.json) exportado anteriormente para mesclar e recuperar seu histórico local.
            </p>
          </div>
          <label className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider transition-colors cursor-pointer mt-4 flex items-center justify-center gap-2 text-center">
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              disabled={loading}
              className="hidden"
            />
            {loading ? <Loader2 size={14} className="animate-spin" /> : 'Importar Backup'}
          </label>
        </div>

        {/* Card: Resetar */}
        <div className="p-8 rounded-[2rem] border transition-all flex flex-col justify-between h-64 shadow-sm hover:shadow-md" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="space-y-3">
            <div className="p-3.5 bg-rose-500/10 text-rose-600 rounded-2xl w-fit">
              <Trash2 size={22} />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight" style={{ color: 'var(--foreground)' }}>Limpar Tudo</h3>
            <p className="text-xs font-medium leading-relaxed" style={{ color: 'var(--muted)' }}>
              Apaga permanentemente todos os dados salvos (histórico e perfil) do seu navegador ou webview. Use com cautela.
            </p>
          </div>
          <button
            onClick={handleClearAll}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider transition-colors cursor-pointer mt-4 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : 'Limpar Aparelho'}
          </button>
        </div>
      </div>
    </div>
  )
}
