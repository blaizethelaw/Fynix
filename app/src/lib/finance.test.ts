import { describe, it, expect } from 'vitest'
import { calculateBudget, calculateGarnishment } from './finance'

describe('finance utilities', () => {
  it('calculates budget summary', () => {
    const result = calculateBudget(5000, { rent: 1000, food: 500 })
    expect(result.totalIncome).toBe(5000)
    expect(result.totalExpenses).toBe(1500)
    expect(result.disposableIncome).toBe(3500)
  })

  it('calculates wage garnishment', () => {
    const result = calculateGarnishment({ income: 4000, garnishmentRate: 0.25 })
    expect(result.garnishment).toBe(1000)
    expect(result.remainingIncome).toBe(3000)
  })
})
