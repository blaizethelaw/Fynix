import { Button } from '../components/ui/Button'

export default function Home() {
  return (
    <main className="p-4 text-center space-y-4">
      <h1 className="text-3xl font-bold">From ashes to assets</h1>
      <p className="text-gray-600 dark:text-gray-300">Welcome to Fynix.</p>
      <Button>Get Started</Button>
    </main>
  )
}
