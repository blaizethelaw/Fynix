export function calculateBudget(
  income: number,
  expenses: Record<string, number>
) {
  const totalExpenses = Object.values(expenses).reduce(
    (sum, n) => sum + n,
    0
  )
  return {
    totalIncome: income,
    totalExpenses,
    disposableIncome: income - totalExpenses,
  }
}

export function calculateGarnishment({
  income,
  garnishmentRate,
}: {
  income: number
  garnishmentRate: number
}) {
  const garnishment = income * garnishmentRate
  return {
    garnishment,
    remainingIncome: income - garnishment,
  }
}
