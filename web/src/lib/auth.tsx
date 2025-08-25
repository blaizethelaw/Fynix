import { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { hasSupabaseConfig, getSupabase } from './supabase'

type AuthState = {
  user: User | null
  loading: boolean
  enabled: boolean
  signInWithOtp: (email: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthCtx = createContext<AuthState>({
  user: null,
  loading: false,
  enabled: false,
  signInWithOtp: async () => {},
  signOut: async () => {}
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(hasSupabaseConfig)

  useEffect(() => {
    if (!hasSupabaseConfig) { setLoading(false); return }
    const supabase = getSupabase()
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => {
      // SDK shapes vary by version
      // @ts-expect-error
      sub?.subscription?.unsubscribe?.() ?? sub?.unsubscribe?.()
    }
  }, [])

  const signInWithOtp = async (email: string) => {
    if (!hasSupabaseConfig) return
    await getSupabase().auth.signInWithOtp({ email })
  }

  const signOut = async () => {
    if (!hasSupabaseConfig) return
    await getSupabase().auth.signOut()
  }

  return (
    <AuthCtx.Provider value={{ user, loading, enabled: hasSupabaseConfig, signInWithOtp, signOut }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)
