import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Seo from '@/seo/Seo'

export default function Home(){
  const navigate = useNavigate()
  return (
    <>
      <Seo title="From ashes to assets" description="Modern tools and playbooks for financial stability, recovery, and growth." />
      <main>
        <section className="container-padded py-16 text-center">
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4 }} className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-amber-200 to-brand-500 bg-clip-text text-transparent">
            From ashes to assets
          </motion.h1>
          <p className="mt-3 text-slate-300 max-w-2xl mx-auto">Practical calculators and step‑by‑step guides that help you stabilize, recover, and build wealth — without the fluff.</p>
          <div className="mt-7 flex items-center justify-center gap-3">
            <button className="btn" onClick={() => navigate('/phoenix')}>Open Phoenix</button>
            <Link className="btn-muted" to="/docs">Browse Guides</Link>
          </div>
        </section>

        <section className="container-padded grid gap-4 md:grid-cols-3 py-8">
          {[{t:'Stability',d:'Zero‑based budgets, income planning, emergency buffers.'},{t:'Recovery',d:'Debt payoff math, credit rebuilding, score hygiene.'},{t:'Growth',d:'Compounding, portfolios, and milestones.'}].map((f)=> (
            <div key={f.t} className="card p-6">
              <div className="text-lg font-semibold">{f.t}</div>
              <p className="text-slate-300 mt-1">{f.d}</p>
            </div>
          ))}
        </section>

        <section className="container-padded py-12 text-center">
          <h2 className="text-2xl font-bold">Ready to go further?</h2>
          <p className="text-slate-300 mt-2">Installable PWA, cloud sync, and premium playbooks.</p>
          <Link to="/pricing" className="btn mt-4">See Pricing</Link>
        </section>
      </main>
    </>
  )
}
