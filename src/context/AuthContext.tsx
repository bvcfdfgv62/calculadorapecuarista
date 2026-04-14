import { createContext, useContext, useEffect, useRef, useState } from 'react'
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
    // Prevent stale profile fetches from previous sessions overwriting current state
    const fetchCounterRef = useRef(0)

    const fetchProfile = async (uid: string) => {
        const fetchId = ++fetchCounterRef.current
        const { data } = await supabase
            .from('profiles')
            .select('id, full_name, role, phone')
            .eq('id', uid)
            .single()

        // Ignore result if a newer fetch has started (race condition guard)
        if (fetchId !== fetchCounterRef.current) return

        setProfile(data as UserProfile ?? null)
        setLoading(false)
    }

    useEffect(() => {
        let mounted = true

        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!mounted) return
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user.id)
            } else {
                setLoading(false)
            }
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!mounted) return
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user.id)
            } else {
                setProfile(null)
                setLoading(false)
            }
        })

        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, [])

    return (
        <AuthContext.Provider value={{ user, session, profile, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)

