import Seo from '@/seo/Seo'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'

export default function Billing(){
  const { user } = useAuth()
  const [customer, setCustomer] = useState<any>(null)

  useEffect(() => {
    (async () => {
      if (!user?.email) return
      const res = await fetch(`/api/square/customer?email=${encodeURIComponent(user.email)}`)
      if (res.ok) setCustomer(await res.json())
    })()
  }, [user?.email])

  return (
    <main className="container-padded py-10">
      <Seo title="Billing" description="Manage your Fynix subscription." />
      <h1 className="text-3xl font-bold mb-4">Billing</h1>
      {!user ? (
        <p className="text-slate-300">Please log in to view your billing profile.</p>
      ) : !customer ? (
        <p className="text-slate-300">Loading customer…</p>
      ) : (
        <div className="card p-6">
          <div className="text-lg font-semibold">Customer</div>
          <div className="text-slate-300">{customer.email_address}</div>
          <div className="text-slate-400 text-sm mt-2">Square customer id: {customer.id}</div>
        </div>
      )}
    </main>
  )
}
