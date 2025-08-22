import type { ReactElement } from 'react'
import { ResponsiveContainer } from 'recharts'

export function ChartContainer({ children }: { children: ReactElement }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  )
}
