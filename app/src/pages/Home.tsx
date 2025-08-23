import { Button } from '../components/ui/Button'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()
  return (
    <main className="p-4 text-center space-y-4">
      <h1 className="text-3xl font-bold">From ashes to assets</h1>
      <p className="text-gray-600 dark:text-gray-300">Welcome to Fynix.</p>
      <Button onClick={() => navigate('/dashboard')}>Get Started</Button>
    </main>
  )
}
