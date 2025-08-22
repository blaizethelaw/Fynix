import type { ReactNode } from 'react'

export function Card({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={`rounded border p-4 shadow-sm ${className}`}>{children}</div>
}
