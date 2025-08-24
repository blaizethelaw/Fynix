import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

export type SessionUser = { id: string; email: string | null }

const AuthCtx = createContext<{ user: SessionUser | null; loading: boolean }>({ user: null, loading: true })

export function AuthProvider({ children }: { children: React.ReactNode }){
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ? { id: data.user.id, email: data.user.email ?? null } : null)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email ?? null } : null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  return <AuthCtx.Provider value={{ user, loading }}>{children}</AuthCtx.Provider>
}

export function useAuth(){ return useContext(AuthCtx) }
