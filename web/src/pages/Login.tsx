import { useState } from 'react'
import { hasSupabaseConfig, getSupabase } from '@/lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  if (!hasSupabaseConfig) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-2">Login</h1>
        <p className="opacity-80">
          Auth is <strong>disabled</strong>. Add
          <code className="mx-1">VITE_SUPABASE_URL</code> and
          <code className="mx-1">VITE_SUPABASE_ANON_KEY</code> in Vercel env vars to enable it.
        </p>
      </main>
    )
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    try {
      await getSupabase().auth.signInWithOtp({ email })
      setSent(true)
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to send magic link')
    }
  }

  return (
    <main className="p-6 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      {sent ? (
        <p>Check your inbox for a magic link.</p>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2"
            placeholder="you@example.com"
          />
          <button className="btn" type="submit">Send magic link</button>
          {err && <p className="text-red-400 text-sm">{err}</p>}
        </form>
      )}
    </main>
  )
}
