import { describe, it, expect } from 'vitest'
import { formatCurrency, parseCurrency } from '../currency'

describe('currency utilities', () => {
  it('formats numbers as USD currency', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56')
  })

  it('parses currency strings back to numbers', () => {
    expect(parseCurrency('$1,234.56')).toBeCloseTo(1234.56)
  })
})
