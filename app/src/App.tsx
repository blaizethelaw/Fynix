import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { BrandMark } from './components/BrandMark'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Docs from './pages/Docs'
import Onboarding from './pages/Onboarding'

export default function App() {
  return (
    <BrowserRouter>
      <header className="flex items-center justify-between p-4 border-b">
        <BrandMark />
        <nav className="flex gap-4 text-sm">
          <Link to="/">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/docs">Docs</Link>
          <Link to="/onboarding">Onboarding</Link>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/docs/:slug" element={<Docs />} />
        <Route path="/onboarding" element={<Onboarding />} />
      </Routes>
    </BrowserRouter>
  )
}
