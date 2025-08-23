const resources = [
  {
    title:
      'The Phoenix Plan: A Strategic Guide to Financial Recovery, Credit Dominance, and Wealth Creation',
    description:
      'Step-by-step playbook to stabilize cash flow, address wage garnishment, and build a resilient financial foundation.',
  },
  {
    title:
      'The Architecture of Financial Transformation: A Holistic Plan for Stability, Growth, and Personal Success',
    description:
      'Comprehensive blueprint for creating order, eliminating debt, and cultivating long-term wealth.',
  },
]

export default function Dashboard() {
  return (
    <main className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <ul className="space-y-4 text-left max-w-prose">
        {resources.map((r) => (
          <li key={r.title} className="border rounded p-4">
            <h2 className="font-semibold">{r.title}</h2>
            <p className="text-sm text-gray-700 dark:text-gray-300">{r.description}</p>
          </li>
        ))}
      </ul>
    </main>
  )
}
