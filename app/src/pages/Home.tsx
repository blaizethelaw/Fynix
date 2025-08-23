import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()
  return (
    <main className="min-h-[70vh] grid place-items-center bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      <div className="text-center px-6">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">From ashes to assets</h1>
        <p className="mt-2 text-base md:text-lg text-gray-600 dark:text-gray-300">Welcome to Fynix.</p>
        <div className="mt-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-base px-6 py-3 rounded-xl shadow bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring"
          >
            Get Started
          </button>
        </div>
      </div>
    </main>
  )
}
