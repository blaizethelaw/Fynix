import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { ChartContainer } from '../components/ui/ChartContainer'
import { calculateGarnishment } from '../lib/finance'

export default function GarnishmentCalculator() {
  const income = 4000
  const rate = 0.25
  const result = useMemo(
    () => calculateGarnishment({ income, garnishmentRate: rate }),
    [income, rate]
  )
  const data = [
    { name: 'Income', value: income },
    { name: 'Garnished', value: result.garnishment },
    { name: 'Remaining', value: result.remainingIncome },
  ]

  return (
    <main className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Garnishment Calculator</h1>
      <ChartContainer>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ChartContainer>
    </main>
  )
}
