import { useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip } from 'recharts'
import { ChartContainer } from '../components/ui/ChartContainer'
import { calculateBudget } from '../lib/finance'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export default function BudgetPlanner() {
  const data = useMemo(() => {
    const result = calculateBudget(5000, {
      rent: 1500,
      groceries: 500,
      utilities: 200,
    })
    return [
      { name: 'Rent', value: 1500 },
      { name: 'Groceries', value: 500 },
      { name: 'Utilities', value: 200 },
      { name: 'Remaining', value: result.disposableIncome },
    ]
  }, [])

  return (
    <main className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Budget Planner</h1>
      <ChartContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" label>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ChartContainer>
    </main>
  )
}
