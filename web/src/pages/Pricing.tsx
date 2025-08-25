import Seo from '@/seo/Seo'
import { startSquareCheckout } from '@/square/client'
import { useAuth } from '@/lib/auth'

export default function Pricing(){
  const { user } = useAuth()
  return (
    <main className="container-padded py-10">
      <Seo title="Pricing" description="Choose a plan and upgrade with Square checkout." />
      <h1 className="text-3xl font-bold mb-4">Pricing</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-6">
          <div className="text-lg font-semibold">Free</div>
          <ul className="text-slate-300 list-disc list-inside mt-2">
            <li>Fynix Daily tools (local)</li>
            <li>Core guides</li>
            <li>Installable PWA</li>
          </ul>
        </div>
        <div className="card p-6">
          <div className="text-lg font-semibold">Pro</div>
          <div className="text-4xl font-extrabold mt-1">$9<span className="text-lg align-super">/mo</span></div>
          <ul className="text-slate-300 list-disc list-inside mt-2">
            <li>Cloud sync</li>
            <li>Premium guides</li>
            <li>Priority support</li>
          </ul>
          <button className="btn mt-4" onClick={() => startSquareCheckout({ amount: 900, email: user?.email || undefined, name: 'Fynix Pro Monthly' })}>Upgrade with Square</button>
        </div>
      </div>
    </main>
  )
}
