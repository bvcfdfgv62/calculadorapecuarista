import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { localDB } from '../lib/storage'
import type { UserProfile } from '../lib/storage'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: any | null
  session: any | null
  profile: UserProfile | null
  loading: boolean
  isMock: boolean
  login: (email: string, password: string) => Promise<{ error: string | null }>
  register: (email: string, password: string, name: string, farmName: string, phone: string) => Promise<{ error: string | null }>
  logout: () => Promise<void>
  updateProfile: (profile: UserProfile) => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  isMock: false,
  login: async () => ({ error: null }),
  register: async () => ({ error: null }),
  logout: async () => {},
  updateProfile: async () => ({ error: null }),
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<any | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const fetchCounterRef = useRef(0)

  // 1. Carrega Perfil e Sessão Inicial do Supabase Real
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchRealProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchRealProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Buscar perfil no Supabase Real
  const fetchRealProfile = async (uid: string) => {
    const fetchId = ++fetchCounterRef.current
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, role, phone, farm_name')
        .eq('id', uid)
        .single()

      if (fetchId !== fetchCounterRef.current) return

      if (data) {
        const uProfile: UserProfile = {
          name: data.full_name || '',
          farmName: data.farm_name || 'Fazenda Principal',
          phone: data.phone || '',
          role: (data.role as 'admin' | 'user') || 'user',
        }
        setProfile(uProfile)
        localDB.saveProfile(uProfile)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // 2. Ações de Autenticação (Supabase Real)
  const login = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        return { error: 'E-mail ou senha incorretos. Verifique seus dados ou crie uma conta.' }
      }
      return { error: error.message }
    }
    return { error: null }
  }

  const register = async (email: string, password: string, name: string, farmName: string, phone: string): Promise<{ error: string | null }> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          farm_name: farmName,
          phone: phone,
        }
      }
    })
    if (error) return { error: error.message }
    
    // Cria registro na tabela profiles se o signup foi bem-sucedido
    if (data?.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          full_name: name,
          farm_name: farmName,
          phone,
          role: 'user'
        })
      if (profileError) console.error('Erro ao salvar perfil em profiles:', profileError.message)
    }
    return { error: null }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    localDB.deleteProfile()
    setProfile(null)
    setUser(null)
    setSession(null)
  }

  const updateProfile = async (updated: UserProfile): Promise<{ error: string | null }> => {
    localDB.saveProfile(updated)
    setProfile(updated)

    if (user?.id) {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updated.name,
          farm_name: updated.farmName,
          phone: updated.phone,
        })
        .eq('id', user.id)
      if (error) return { error: error.message }
    }
    return { error: null }
  }

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, isMock: false, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
