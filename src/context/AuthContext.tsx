import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface UserProfile {
    id: string
    full_name: string | null
    role: 'admin' | 'user'
    phone: string | null
}

interface AuthContextType {
    user: User | null
    session: Session | null
    profile: UserProfile | null
    loading: boolean
}

const AuthContext = createContext<AuthContextType>({ user: null, session: null, profile: null, loading: true })

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchProfile = async (uid: string, email?: string) => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', uid)
            .single()

        let profileData = data as UserProfile
        if (email === 'valerio@gmail.com' || email === 'kaian@gmail.com') {
            if (profileData) profileData.role = 'admin'
            else profileData = { id: uid, full_name: 'Admin', role: 'admin', phone: null }
        }
        setProfile(profileData)
    }

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user.id, session.user.email)
            }
            if (!session) setLoading(false)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user.id, session.user.email)
            } else {
                setProfile(null)
            }
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    // Ensure loading is false only after profile is potentially fetched
    useEffect(() => {
        if (user && profile) setLoading(false)
        if (!user) setLoading(false)
    }, [user, profile])

    return (
        <AuthContext.Provider value={{ user, session, profile, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
