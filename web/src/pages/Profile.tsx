import { useEffect, useState } from 'react'
import { hasSupabaseConfig, getSupabase } from '@/lib/supabase'

export default function Profile() {
  const [email, setEmail] = useState<string | null>(null)

  if (!hasSupabaseConfig) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-2">Profile</h1>
        <p className="opacity-80">Auth is disabled. Add Supabase env vars to enable profile data.</p>
      </main>
    )
  }

  useEffect(() => {
    getSupabase().auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null)
    })
  }, [])

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      {email ? <p>Signed in as <strong>{email}</strong></p> : <p>Not signed in.</p>}
    </main>
  )
}
