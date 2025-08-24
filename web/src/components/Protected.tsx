import { Navigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'

export default function Protected({ children }: { children: React.ReactNode }){
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}
