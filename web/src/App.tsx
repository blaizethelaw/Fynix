import { Link, Route, Routes } from 'react-router-dom'
import Home from '@/pages/Home'
import Dashboard from '@/pages/Dashboard'
import Login from '@/pages/Login'
import Profile from '@/pages/Profile'
import Protected from '@/components/Protected'
import Docs from '@/pages/Docs'
import Tools from '@/pages/Tools'
import Onboarding from '@/pages/Onboarding'
import Phoenix from '@/pages/Phoenix'
import { Flame } from 'lucide-react'

export default function App() {
  return (
    <div className="min-h-full text-slate-100">
      <header className="sticky top-0 z-20 backdrop-blur border-b border-white/10">
        <div className="container-padded flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-extrabold tracking-tight">
            <Flame className="h-5 w-5 text-amber-300" /> Fynix
          </Link>
          <nav className="flex gap-2">
            <Link className="btn-muted" to="/">Home</Link>
            <Link className="btn-muted" to="/dashboard">Dashboard</Link>
            <Link className="btn-muted" to="/docs">Docs</Link>
            <Link className="btn-muted" to="/tools">Tools</Link>
            <Link className="btn-muted" to="/onboarding">Onboarding</Link>
            <Link className="btn-muted" to="/phoenix">Phoenix</Link>
            <Link className="btn-muted" to="/login">Login</Link>
            <Link className="btn-muted" to="/profile">Profile</Link>
          </nav>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/docs/:slug" element={<Docs />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/phoenix" element={<Phoenix />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Protected><Profile /></Protected>} />
      </Routes>
    </div>
  )
}
