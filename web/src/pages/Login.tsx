import { supabase } from '@/lib/supabase'

export default function Login(){
  const signIn = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email: (document.getElementById('email') as HTMLInputElement).value })
    if (error) alert(error.message)
    else alert('Check your email for a magic link!')
  }
  return (
    <main className="container-padded py-10 max-w-lg">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <input id="email" type="email" placeholder="you@example.com" className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2" />
      <button onClick={signIn} className="btn mt-3 w-full">Send magic link</button>
    </main>
  )
}
