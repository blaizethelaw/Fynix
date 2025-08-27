import { Link } from 'react-router-dom'
import { asUSD, asPct0 } from '@/lib/format'
import { useDashboardStats } from '@/lib/useDashboardStats'
import { CalendarDays, PiggyBank, Wallet } from 'lucide-react'

const resources = [
  {
    title:
      'The Fynix Plan: A Strategic Guide to Financial Recovery, Credit Dominance, and Wealth Creation',
    description:
      'Stabilize cash flow, counter wage garnishment, and build a resilient foundation.',
    to: '/docs/financial-planning-for-difficult-situations'
  },
  {
    title:
      'The Architecture of Financial Transformation: Stability, Growth, and Personal Success',
    description: 'Order, debt elimination, and long-term wealth.',
    to: '/docs/financial-recovery-and-credit-rebuilding'
  }
]

export default function Dashboard() {
  const { monthlyIncome, monthlyExpenses, budgetBalance, savingsRate, nextPaydayISO } =
    useDashboardStats()
  const nextPayday = new Date(nextPaydayISO).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })

  return (
    <main className="container-padded py-8 space-y-8">
      <header className="flex items-end justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
      </header>

      {/* KPI ROW */}
      <section className="grid gap-4 sm:grid-cols-3">
        <KPI
          icon={<Wallet className="h-5 w-5" />}
          label="Budget Balance"
          value={asUSD(budgetBalance)}
          sub={budgetBalance >= 0 ? 'Surplus' : 'Deficit'}
        />
        <KPI
          icon={<PiggyBank className="h-5 w-5" />}
          label="Savings Rate"
          value={asPct0(savingsRate)}
          sub={`${asUSD(monthlyIncome - monthlyExpenses)} / ${asUSD(monthlyIncome)}`}
        />
        <KPI
          icon={<CalendarDays className="h-5 w-5" />}
          label="Next Payday"
          value={nextPayday}
          sub="Configured in settings (default 1st & 15th)"
        />
      </section>

      {/* CONTENT CARDS */}
      <section className="grid gap-4 sm:grid-cols-2">
        {resources.map((r) => (
          <article key={r.title} className="card p-6 hover:shadow-md transition-shadow">
            <h2 className="font-semibold leading-tight">{r.title}</h2>
            <p className="mt-2 text-sm text-white/75">{r.description}</p>
            <Link
              to={r.to}
              className="mt-3 inline-flex items-center gap-2 text-amber-300 hover:underline"
            >
              Open →
            </Link>
          </article>
        ))}
      </section>
    </main>
  )
}

function KPI(props: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  const { icon, label, value, sub } = props
  return (
    <div className="card px-5 py-4 flex items-center gap-4">
      <div className="grid place-items-center h-10 w-10 rounded-xl bg-white/10 shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-wide text-white/60">{label}</div>
        <div className="text-xl font-semibold">{value}</div>
        {sub && <div className="text-xs text-white/60">{sub}</div>}
      </div>
    </div>
  )
}
