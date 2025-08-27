import { useEffect, useMemo, useState } from 'react'

/**
 * Where Phoenix writes the running summary (added below).
 * { monthlyIncome: number, monthlyExpenses: number }
 */
const DASHBOARD_KEY = 'fynix.dashboard.summary'

/** Payday rules (configurable; default = semi-monthly on 1 & 15). */
export type PaydayRule =
  | { type: 'weekly'; weekday: 0 | 1 | 2 | 3 | 4 | 5 | 6 }
  | { type: 'biweekly'; startDate: string }
  | { type: 'semiMonthly'; days: [number, number] }
  | { type: 'monthly'; day: number }

const PAYDAY_KEY = 'fynix.payday.rule'

function readJSON<T>(key: string): T | null {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null') as T | null
  } catch {
    return null
  }
}
function writeJSON<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function addDays(d: Date, n: number) {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

function nextWeekly(now: Date, weekday: number) {
  const n = now.getDay()
  const delta = ((weekday - n + 7) % 7) || 7
  return addDays(startOfDay(now), delta)
}
function nextBiweekly(now: Date, startISO: string) {
  const start = startOfDay(new Date(startISO))
  const ms14 = 14 * 86400000
  let t = start.getTime()
  const nowT = now.getTime()
  while (t <= nowT) t += ms14
  return new Date(t)
}
function nextSemiMonthly(now: Date, [a, b]: [number, number]) {
  const d = now.getDate()
  const [first, second] = a < b ? [a, b] : [b, a]
  const y = now.getFullYear(), m = now.getMonth()
  if (d < first) return new Date(y, m, first)
  if (d < second) return new Date(y, m, second)
  return new Date(y, m + 1, first)
}
function nextMonthly(now: Date, day: number) {
  const y = now.getFullYear(), m = now.getMonth()
  const d = now.getDate()
  return d < day ? new Date(y, m, day) : new Date(y, m + 1, day)
}

function computeNextPayday(rule: PaydayRule, now = new Date()): Date {
  switch (rule.type) {
    case 'weekly':
      return nextWeekly(now, rule.weekday)
    case 'biweekly':
      return nextBiweekly(now, rule.startDate)
    case 'semiMonthly':
      return nextSemiMonthly(now, rule.days)
    case 'monthly':
      return nextMonthly(now, rule.day)
  }
}

export type DashboardStats = {
  monthlyIncome: number
  monthlyExpenses: number
  budgetBalance: number
  savingsRate: number
  nextPaydayISO: string
  paydayRule: PaydayRule
  setPaydayRule: (r: PaydayRule) => void
}

const defaultRule: PaydayRule = { type: 'semiMonthly', days: [1, 15] }

export function useDashboardStats(): DashboardStats {
  const [summary, setSummary] = useState<{ monthlyIncome: number; monthlyExpenses: number } | null>(() =>
    readJSON(DASHBOARD_KEY)
  )
  const [rule, setRule] = useState<PaydayRule>(() => readJSON<PaydayRule>(PAYDAY_KEY) ?? defaultRule)

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === DASHBOARD_KEY) setSummary(readJSON(DASHBOARD_KEY))
      if (e.key === PAYDAY_KEY) setRule(readJSON(PAYDAY_KEY) ?? defaultRule)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const setPaydayRule = (r: PaydayRule) => {
    writeJSON(PAYDAY_KEY, r)
    setRule(r)
  }

  const stats = useMemo(() => {
    const inc = Math.max(0, summary?.monthlyIncome ?? 0)
    const exp = Math.max(0, summary?.monthlyExpenses ?? 0)
    const bal = inc - exp
    const rate = inc > 0 ? bal / inc : 0
    const next = computeNextPayday(rule)
    return {
      monthlyIncome: inc,
      monthlyExpenses: exp,
      budgetBalance: bal,
      savingsRate: rate,
      nextPaydayISO: next.toISOString(),
      paydayRule: rule,
      setPaydayRule
    }
  }, [summary, rule])

  return stats
}
