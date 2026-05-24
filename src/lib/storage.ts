import localforage from 'localforage'

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

// Configuração do IndexedDB via localforage
localforage.config({
  name: 'CalculadoraPecuarista',
  storeName: 'history_store',
  description: 'Armazenamento ilimitado de cálculos pecuários'
})

// Helper robusto para gerar IDs únicos mesmo sem internet
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export const localDB = {
  // ─── GERENCIAMENTO DE PERFIL (Mantido Síncrono no LocalStorage por ser leve) ───
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

  // ─── GERENCIAMENTO DE SIMULAÇÕES (Histórico Assíncrono via IndexedDB) ─────────
  async getHistory(userEmail: string): Promise<Calculation[]> {
    try {
      if (!userEmail) return []
      const userKey = `${KEYS.HISTORY}_${userEmail}`
      
      // Tenta ler do IndexedDB
      let data = await localforage.getItem<Calculation[]>(userKey)
      
      // MIGRATION: Se não tem no IndexedDB, verifica se tem no localStorage e migra
      if (!data) {
        const legacyData = localStorage.getItem(userKey)
        if (legacyData) {
          data = JSON.parse(legacyData) as Calculation[]
          await localforage.setItem(userKey, data) // Salva no IndexedDB
          localStorage.removeItem(userKey) // Remove do localStorage pesado
        }
      }

      if (!data) return []
      
      return data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } catch (e) {
      console.error('Erro ao ler histórico do IndexedDB:', e)
      return []
    }
  },

  async saveCalculation(userEmail: string, inputs: any, outputs: any): Promise<Calculation> {
    try {
      if (!userEmail) throw new Error('Usuário não identificado.')
      
      const history = await this.getHistory(userEmail)
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
      const userKey = `${KEYS.HISTORY}_${userEmail}`
      await localforage.setItem(userKey, updatedHistory)
      
      return newCalc
    } catch (e) {
      console.error('Erro ao salvar cálculo no IndexedDB:', e)
      throw new Error('Não foi possível salvar a simulação no banco de dados local.')
    }
  },

  async deleteCalculation(userEmail: string, id: string): Promise<Calculation[]> {
    try {
      if (!userEmail) return []
      const history = await this.getHistory(userEmail)
      const filtered = history.filter(item => item.id !== id)
      
      const userKey = `${KEYS.HISTORY}_${userEmail}`
      await localforage.setItem(userKey, filtered)
      return filtered
    } catch (e) {
      console.error('Erro ao deletar cálculo do IndexedDB:', e)
      throw new Error('Não foi possível excluir esta simulação do seu dispositivo.')
    }
  },

  async clearAllData(): Promise<void> {
    try {
      localStorage.removeItem(KEYS.PROFILE)
      // Limpa todo o banco de dados localforage
      await localforage.clear()
    } catch (e) {
      console.error('Erro ao limpar bancos de dados:', e)
    }
  }
}
