import { Link } from 'react-router-dom'

const resources = [
  {
    title:
      'The Phoenix Plan: A Strategic Guide to Financial Recovery, Credit Dominance, and Wealth Creation',
    description:
      'Step-by-step playbook to stabilize cash flow, address wage garnishment, and build a resilient financial foundation.',
    to: '/docs/financial-planning-for-difficult-situations'
  },
  {
    title:
      'The Architecture of Financial Transformation: A Holistic Plan for Stability, Growth, and Personal Success',
    description:
      'Comprehensive blueprint for creating order, eliminating debt, and cultivating long-term wealth.',
    to: '/docs/financial-recovery-and-credit-rebuilding'
  }
]

export default function Dashboard() {
  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {resources.map((r) => (
          <div key={r.title} className="rounded-2xl p-6 border shadow-sm hover:shadow-md transition">
            <div className="space-y-2">
              <h2 className="font-semibold leading-tight">{r.title}</h2>
              <p className="text-sm text-gray-700 dark:text-gray-300">{r.description}</p>
              <Link
                to={r.to}
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
              >
                Open →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
