// Adaptador de Armazenamento Local (Local-First) para a Calculadora Pecuária Premium
// 100% Offline, seguro e sem custos.

export interface UserProfile {
  name: string
  farmName: string
  phone: string
  role: 'admin' | 'user'
}

export interface Calculation {
  id: string
  created_at: string
  inputs: any
  outputs: any
  metadata?: {
    ranch_name?: string
    [key: string]: any
  }
}

const KEYS = {
  PROFILE: '@valerio:profile',
  HISTORY: '@valerio:calculations',
}

// Helper robusto para gerar IDs únicos mesmo sem internet
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export const localDB = {
  // ─── GERENCIAMENTO DE PERFIL ──────────────────────────────────────────────
  getProfile(): UserProfile | null {
    try {
      const data = localStorage.getItem(KEYS.PROFILE)
      return data ? JSON.parse(data) : null
    } catch (e) {
      console.error('Erro ao ler perfil do localStorage:', e)
      return null
    }
  },

  saveProfile(profile: UserProfile): UserProfile {
    try {
      localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile))
      return profile
    } catch (e) {
      console.error('Erro ao salvar perfil no localStorage:', e)
      throw new Error('Não foi possível salvar os dados do seu perfil no dispositivo.')
    }
  },

  deleteProfile(): void {
    try {
      localStorage.removeItem(KEYS.PROFILE)
    } catch (e) {
      console.error('Erro ao remover perfil do localStorage:', e)
    }
  },

  // ─── GERENCIAMENTO DE SIMULAÇÕES (HISTÓRICO) ──────────────────────────────
  getHistory(): Calculation[] {
    try {
      const data = localStorage.getItem(KEYS.HISTORY)
      if (!data) return []
      
      const parsed = JSON.parse(data) as Calculation[]
      // Ordena do mais recente para o mais antigo por padrão
      return parsed.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } catch (e) {
      console.error('Erro ao ler histórico do localStorage:', e)
      return []
    }
  },

  saveCalculation(inputs: any, outputs: any): Calculation {
    try {
      const history = this.getHistory()
      
      // Captura o nome da fazenda atual do inputs se existir, senão usa o perfil
      const profile = this.getProfile()
      const farmName = inputs?.propertyData?.farmName || profile?.farmName || 'Minha Fazenda'
      
      const newCalc: Calculation = {
        id: generateUUID(),
        created_at: new Date().toISOString(),
        inputs,
        outputs,
        metadata: {
          ranch_name: farmName,
        }
      }

      const updatedHistory = [newCalc, ...history]
      localStorage.setItem(KEYS.HISTORY, JSON.stringify(updatedHistory))
      return newCalc
    } catch (e) {
      console.error('Erro ao salvar cálculo no localStorage:', e)
      throw new Error('Espaço de armazenamento cheio ou indisponível. Não foi possível salvar a simulação.')
    }
  },

  deleteCalculation(id: string): Calculation[] {
    try {
      const history = this.getHistory()
      const filtered = history.filter(item => item.id !== id)
      localStorage.setItem(KEYS.HISTORY, JSON.stringify(filtered))
      return filtered
    } catch (e) {
      console.error('Erro ao deletar cálculo do localStorage:', e)
      throw new Error('Não foi possível excluir esta simulação do seu dispositivo.')
    }
  },

  clearAllData(): void {
    try {
      localStorage.removeItem(KEYS.PROFILE)
      localStorage.removeItem(KEYS.HISTORY)
    } catch (e) {
      console.error('Erro ao limpar localStorage:', e)
    }
  }
}
