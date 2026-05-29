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

import { supabase } from './supabase'

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

  // ─── GERENCIAMENTO DE SIMULAÇÕES (Histórico Assíncrono via SUPABASE) ─────────
  async getHistory(userEmail: string): Promise<Calculation[]> {
    try {
      if (!userEmail) return []
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('calculations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return data as Calculation[]
    } catch (e) {
      console.error('Erro ao ler histórico do Supabase:', e)
      return []
    }
  },

  async saveCalculation(userEmail: string, inputs: any, outputs: any): Promise<Calculation> {
    try {
      if (!userEmail) throw new Error('Usuário não identificado.')
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado no Supabase.')

      const profile = this.getProfile()
      const farmName = inputs?.propertyData?.farmName || profile?.farmName || 'Minha Fazenda'
      
      const newCalc = {
        user_id: user.id,
        user_email: user.email,
        inputs,
        outputs,
        metadata: {
          ranch_name: farmName,
        }
      }

      const { data, error } = await supabase
        .from('calculations')
        .insert([newCalc])
        .select()
        .single()

      if (error) {
        console.error("Supabase insert error:", error)
        throw new Error('Não foi possível salvar a simulação na nuvem.')
      }

      return data as Calculation
    } catch (e: any) {
      console.error('Erro ao salvar cálculo no Supabase:', e)
      throw new Error(e.message || 'Erro de conexão com o banco de dados.')
    }
  },

  async deleteCalculation(userEmail: string, id: string): Promise<Calculation[]> {
    try {
      if (!userEmail) return []
      
      const { error } = await supabase
        .from('calculations')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Retorna o histórico atualizado após deletar
      return await this.getHistory(userEmail)
    } catch (e) {
      console.error('Erro ao deletar cálculo do Supabase:', e)
      throw new Error('Não foi possível excluir esta simulação da nuvem.')
    }
  },

  async clearAllData(): Promise<void> {
    try {
      localStorage.removeItem(KEYS.PROFILE)
    } catch (e) {
      console.error('Erro ao limpar bancos de dados:', e)
    }
  }
}

