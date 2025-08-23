import { create } from 'zustand'

interface BudgetState {
  income: number
  expenses: number
  setIncome: (income: number) => void
  setExpenses: (expenses: number) => void
}

export const useBudgetStore = create<BudgetState>((set) => ({
  income: 0,
  expenses: 0,
  setIncome: (income) => set({ income }),
  setExpenses: (expenses) => set({ expenses })
}))
