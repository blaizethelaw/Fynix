import { describe, it, expect } from 'vitest'
import { payoffMonths, project } from './finance'

describe('payoffMonths', () => {
  it('finishes for reasonable inputs', () => {
    expect(payoffMonths(1200, 24, 100)).toBeGreaterThan(0)
  })
  it('is Infinity if payment too low', () => {
    expect(payoffMonths(1000, 24, 1)).toBe(Infinity)
  })
})

describe('project', () => {
  it('grows with contributions', () => {
    const series = project(1000, 100, 6, 1)
    expect(series.at(-1)!).toBeGreaterThan(1000)
  })
})
