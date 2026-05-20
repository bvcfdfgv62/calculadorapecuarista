import { createContext, useContext, useEffect, useState } from 'react'
import { localDB } from '../lib/storage'
import type { UserProfile } from '../lib/storage'

interface MockUser {
  email: string
  id: string
}

interface AuthContextType {
  user: MockUser | null
  profile: UserProfile | null
  loading: boolean
  login: (email: string, password: string, name?: string, farmName?: string, phone?: string) => void
  logout: () => void
  updateProfile: (profile: UserProfile) => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  login: () => {},
  logout: () => {},
  updateProfile: () => {},
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [user, setUser] = useState<MockUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const localProfile = localDB.getProfile()
    if (localProfile) {
      setProfile(localProfile)
      setUser({
        email: localStorage.getItem('@valerio:email') || localProfile.name,
        id: 'local-producer-id',
      })
    }
    setLoading(false)
  }, [])

  const login = (email: string, password: string, name?: string, farmName?: string, phone?: string) => {
    const isAdmin = (email === 'kaian@gmail.com' || email === 'valerio@gmail.com') && password === '124578'
    
    const newProfile: UserProfile = {
      name: name || email.split('@')[0],
      farmName: farmName || 'Fazenda Principal',
      phone: phone || '',
      role: isAdmin ? 'admin' : 'user',
    }
    
    const saved = localDB.saveProfile(newProfile)
    localStorage.setItem('@valerio:email', email)
    setProfile(saved)
    setUser({
      email,
      id: 'local-producer-id',
    })
  }

  const logout = () => {
    localDB.deleteProfile()
    localStorage.removeItem('@valerio:email')
    setProfile(null)
    setUser(null)
  }

  const updateProfile = (updated: UserProfile) => {
    const saved = localDB.saveProfile(updated)
    setProfile(saved)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
