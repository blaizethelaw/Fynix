import { Link } from 'react-router-dom'

const resources = [
  {
    title: 'The Fynix Plan: A Strategic Guide to Financial Recovery, Credit Dominance, and Wealth Creation',
    description: 'Stabilize cash flow, counter wage garnishment, and build a resilient foundation.',
    to: '/docs/financial-planning-for-difficult-situations'
  },
  {
    title: 'The Architecture of Financial Transformation: Stability, Growth, and Personal Success',
    description: 'Comprehensive blueprint for order, debt elimination, and long‑term wealth.',
    to: '/docs/financial-recovery-and-credit-rebuilding'
  }
]

export default function Dashboard(){
  return (
    <main className="container-padded py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {resources.map(r => (
          <Link key={r.title} to={r.to} className="card p-6 hover:shadow-xl transition">
            <h2 className="text-lg font-semibold">{r.title}</h2>
            <p className="text-sm text-slate-300 mt-1">{r.description}</p>
            <div className="mt-3 text-amber-200">Open →</div>
          </Link>
        ))}
      </div>
    </main>
  )
}
