import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Home(){
  const navigate = useNavigate()
  return (
    <main className="min-h-[72vh] grid place-items-center">
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4 }} className="container-padded text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-amber-200 to-brand-500 bg-clip-text text-transparent">
          From ashes to assets
        </h1>
        <p className="mt-3 text-slate-300 max-w-2xl mx-auto">
          A clear, modern path to financial stability, recovery, and long‑term growth.
        </p>
        <div className="mt-7 flex items-center justify-center gap-3">
          <button className="btn" onClick={() => navigate('/dashboard')}>Get Started</button>
          <button className="btn-muted" onClick={() => navigate('/docs')}>Read the playbooks</button>
        </div>
      </motion.section>
    </main>
  )
}
