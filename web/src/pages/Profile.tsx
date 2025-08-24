import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export default function Profile(){
  const { user } = useAuth()
  return (
    <main className="container-padded py-10">
      <h1 className="text-2xl font-bold mb-2">Profile</h1>
      <div className="text-slate-300">{user?.email}</div>
      <button className="btn-muted mt-4" onClick={() => supabase.auth.signOut()}>Sign out</button>
    </main>
  )
}
