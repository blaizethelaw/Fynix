import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { BrandMark } from './components/BrandMark'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <BrowserRouter>
      <header className="flex items-center justify-between p-4 border-b">
        <BrandMark />
        <nav className="flex gap-4 text-sm">
          <Link to="/">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}
