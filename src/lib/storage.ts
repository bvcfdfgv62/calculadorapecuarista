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

  // ─── GERENCIAMENTO DE SIMULAÇÕES (Histórico Assíncrono via SUPABASE ENTERPRISE) ─────────
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

      // Reconstrói o formato que o React espera (separando inputs e outputs)
      return data.map((row: any) => ({
        id: row.id,
        created_at: row.created_at,
        inputs: {
          sampleArea: row.sample_area,
          sampleWeight: row.sample_weight,
          dryMatterPercent: row.dry_matter_percent,
          forageSupplyPercent: row.forage_supply_percent,
          paddockCount: row.paddock_count,
          occupationDays: row.occupation_days,
          growthPeriod: row.growth_period,
          category: row.category,
          bodyWeight: row.body_weight,
          gpd: row.gpd,
          unavailabilityPercent: row.unavailability_percent,
          pricePerArroba: row.price_per_arroba,
          pastureArea: row.pasture_area,
          areaUnit: row.area_unit,
          propertyData: {
            farmName: row.farm_name,
            owner: '', city: '', state: '', phone: '', email: row.user_email
          }
        },
        outputs: {
          forageMass: row.forage_mass,
          supportCapacity: row.support_capacity,
          stockingRateUA: row.stocking_rate_ua,
          stockingRateUAHa: row.stocking_rate_ua_ha,
          stockingRateHeads: row.stocking_rate_heads,
          stockingRateHeadsHa: row.stocking_rate_heads_ha,
          productivity: row.productivity,
          productivityHa: row.productivity_ha,
          revenue: row.revenue,
          revenueHa: row.revenue_ha,
          reduction: row.reduction,
          reductionHa: row.reduction_ha,
          profit: row.profit
        },
        metadata: {
          ranch_name: row.farm_name,
        }
      })) as Calculation[]
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
      
      const flatRow = {
        user_id: user.id,
        user_email: user.email,
        farm_name: farmName,

        sample_area: inputs.sampleArea,
        sample_weight: inputs.sampleWeight,
        dry_matter_percent: inputs.dryMatterPercent,
        forage_supply_percent: inputs.forageSupplyPercent,
        paddock_count: inputs.paddockCount,
        occupation_days: inputs.occupationDays,
        growth_period: inputs.growthPeriod,
        category: inputs.category,
        body_weight: inputs.bodyWeight,
        gpd: inputs.gpd,
        unavailability_percent: inputs.unavailabilityPercent,
        price_per_arroba: inputs.pricePerArroba,
        pasture_area: inputs.pastureArea,
        area_unit: inputs.areaUnit,

        forage_mass: outputs.forageMass,
        support_capacity: outputs.supportCapacity,
        stocking_rate_ua: outputs.stockingRateUA,
        stocking_rate_ua_ha: outputs.stockingRateUAHa,
        stocking_rate_heads: outputs.stockingRateHeads,
        stocking_rate_heads_ha: outputs.stockingRateHeadsHa,
        instant_stocking_rate_heads_ha: outputs.stockingRateHeadsHa * inputs.paddockCount,
        productivity: outputs.productivity,
        productivity_ha: outputs.productivityHa,

        revenue: outputs.revenue,
        revenue_ha: outputs.revenueHa,
        reduction: outputs.reduction,
        reduction_ha: outputs.reductionHa,
        profit: outputs.profit
      }

      const { data, error } = await supabase
        .from('calculations')
        .insert([flatRow])
        .select()
        .single()

      if (error) {
        console.error("Supabase insert error:", error)
        throw new Error('Não foi possível salvar a simulação na nuvem.')
      }

      // Converte de volta pro formato JSON pro React não quebrar na mesma hora da tela
      return {
        id: data.id,
        created_at: data.created_at,
        inputs,
        outputs,
        metadata: { ranch_name: farmName }
      } as Calculation
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

