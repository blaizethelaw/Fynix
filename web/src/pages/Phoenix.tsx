import { useMemo, useRef, useEffect } from 'react'
import { Button, ButtonMuted } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Field, Input } from '@/components/ui/Field'
import { Progress } from '@/components/ui/Progress'
import { useLocalStorage } from '@/lib/useLocalStorage'
import { fmt, pct } from '@/lib/format'
import { useAuth } from '@/lib/auth'
import { saveBudget, startCheckout } from '@/lib/api'
import type { Income, Expense, DebtInput, InvestInput } from '@/types/budget'
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts'
import { Flame } from 'lucide-react'

const COLORS = ['#ff7a45', '#ffd166', '#22c55e', '#0ea5e9', '#a78bfa', '#f472b6', '#facc15']

export default function Phoenix(){
  const [incomes, setIncomes] = useLocalStorage<Income[]>('phoenix.incomes', [ { id: crypto.randomUUID(), name: 'Primary Job', amount: 4000 } ])
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('phoenix.expenses', [ { id: crypto.randomUUID(), category: 'Rent', amount: 1200 }, { id: crypto.randomUUID(), category: 'Groceries', amount: 450 } ])
  const [debt, setDebt] = useLocalStorage<DebtInput>('phoenix.debt', { balance: 8500, apr: 22, payment: 300 })
  const [invest, setInvest] = useLocalStorage<InvestInput>('phoenix.invest', { principal: 1000, monthly: 200, rate: 7, years: 10 })
  const { user } = useAuth()

  const totalIncome = useMemo(() => incomes.reduce((s, i) => s + (Number(i.amount) || 0), 0), [incomes])
  const totalExpenses = useMemo(() => expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0), [expenses])
  const savings = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0

  const payoff = useMemo(() => {
    const { balance, apr, payment } = debt
    const r = apr / 100 / 12
    if (payment <= balance * r) return { months: Infinity, interest: Infinity, series: [] as { m: number; bal: number }[] }
    let bal = balance, m = 0, interestPaid = 0
    const series: { m: number; bal: number }[] = []
    while (bal > 0 && m < 600) {
      const interest = bal * r
      const principal = payment - interest
      bal = Math.max(0, bal - principal)
      interestPaid += interest
      m++
      series.push({ m, bal })
    }
    return { months: m, interest: interestPaid, series }
  }, [debt])

  const projection = useMemo(() => {
    const { principal, monthly, rate, years } = invest
    const r = rate / 100 / 12
    let bal = principal
    const data: { m: number; bal: number }[] = [{ m: 0, bal }]
    for (let m = 1; m <= years * 12; m++) { bal = bal * (1 + r) + monthly; data.push({ m, bal }) }
    return data
  }, [invest])

  const nameRef = useRef<HTMLInputElement>(null)
  const incRef = useRef<HTMLInputElement>(null)
  const catRef = useRef<HTMLInputElement>(null)
  const expRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const summary = { monthlyIncome: totalIncome, monthlyExpenses: totalExpenses }
    localStorage.setItem('fynix.dashboard.summary', JSON.stringify(summary))
  }, [totalIncome, totalExpenses])

  const addIncome = () => { const name = nameRef.current?.value?.trim() || 'Income'; const amount = Number(incRef.current?.value || 0); if (!amount) return; setIncomes(v => [...v, { id: crypto.randomUUID(), name, amount }]); if (nameRef.current) nameRef.current.value = ''; if (incRef.current) incRef.current.value = '' }
  const addExpense = () => { const category = catRef.current?.value?.trim() || 'Expense'; const amount = Number(expRef.current?.value || 0); if (!amount) return; setExpenses(v => [...v, { id: crypto.randomUUID(), category, amount }]); if (catRef.current) catRef.current.value = ''; if (expRef.current) expRef.current.value = '' }
  const resetAll = () => { setIncomes([]); setExpenses([]); setDebt({ balance: 0, apr: 0, payment: 0 }); setInvest({ principal: 0, monthly: 0, rate: 7, years: 10 }) }

  return (
    <main className="container-padded py-8 space-y-8">
      <section className="text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-amber-200 to-brand-500 bg-clip-text text-transparent inline-flex items-center gap-2">
          <Flame className="h-8 w-8 text-amber-300"/> Fynix Daily
        </h1>
        <p className="text-slate-300 mt-2">Your command center for income, budget, debt payoff, and growth.</p>
        <div className="mt-4 flex justify-center gap-2">
          <ButtonMuted onClick={resetAll}>Reset</ButtonMuted>
          <ButtonMuted onClick={() => navigator.clipboard.writeText(JSON.stringify({ incomes, expenses, debt, invest }, null, 2))}>Copy data</ButtonMuted>
          {user && <Button onClick={() => saveBudget(user.id, { incomes, expenses, debt, invest })}>Save to cloud</Button>}
          <Button onClick={() => startCheckout(user?.email || undefined)}>Go Pro</Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Card className="p-5"><div className="text-sm text-slate-300">Monthly Income</div><div className="mt-1 text-2xl font-bold">{fmt(totalIncome)}</div></Card>
        <Card className="p-5"><div className="text-sm text-slate-300">Monthly Expenses</div><div className="mt-1 text-2xl font-bold">{fmt(totalExpenses)}</div></Card>
        <Card className="p-5"><div className="text-sm text-slate-300">Savings</div><div className="mt-1 text-2xl font-bold">{fmt(savings)}</div><div className="mt-3"><Progress value={savingsRate}/><div className="mt-1 text-xs text-slate-400">Savings rate: {pct(savingsRate)}</div></div></Card>
        <Card className="p-5"><div className="text-sm text-slate-300">Debt Months to Zero</div><div className="mt-1 text-2xl font-bold">{isFinite(payoff.months) ? payoff.months : '—'}</div></Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Income Sources</h2>
          <div className="grid grid-cols-5 gap-2">
            <Field label="Name" ><Input ref={nameRef} placeholder="e.g. Job"/></Field>
            <Field label="Amount ($)"><Input ref={incRef} type="number" min={0} step="1"/></Field>
            <div className="col-span-3 flex items-end"><Button onClick={addIncome} className="w-full">Add Income</Button></div>
          </div>
          <ul className="space-y-2">
            {incomes.map((i) => (
              <li key={i.id} className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-3 py-2">
                <span>{i.name}</span>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{fmt(i.amount)}</span>
                  <button className="text-amber-200/80 hover:text-amber-200" onClick={() => setIncomes(v => v.filter(x => x.id !== i.id))}>Remove</button>
                </div>
              </li>
            ))}
          </ul>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={incomes.map((i)=>({ name: i.name, value: i.amount }))} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                  {incomes.map((_, idx) => (<Cell key={idx} fill={COLORS[idx % COLORS.length]} />))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Zero‑Based Budget</h2>
          <div className="grid grid-cols-5 gap-2">
            <Field label="Category"><Input ref={catRef} placeholder="e.g. Rent"/></Field>
            <Field label="Amount ($)"><Input ref={expRef} type="number" min={0} step="1"/></Field>
            <div className="col-span-3 flex items-end"><Button onClick={addExpense} className="w-full">Add Expense</Button></div>
          </div>
          <ul className="space-y-2 max-h-56 overflow-auto pr-2">
            {expenses.map(e => (
              <li key={e.id} className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-3 py-2">
                <span>{e.category}</span>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{fmt(e.amount)}</span>
                  <button className="text-amber-200/80 hover:text-amber-200" onClick={() => setExpenses(v => v.filter(x => x.id !== e.id))}>Remove</button>
                </div>
              </li>
            ))}
          </ul>
          <div className="text-sm text-slate-300">Budget Balance: <span className={savings >= 0 ? 'text-green-400' : 'text-rose-300'}>{fmt(savings)}</span></div>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Debt Payoff Calculator</h2>
          <div className="grid grid-cols-3 gap-2">
            <Field label="Balance ($)"><Input type="number" min={0} step="1" value={debt.balance} onChange={e => setDebt({ ...debt, balance: Number(e.currentTarget.value) })} /></Field>
            <Field label="APR (%)"><Input type="number" min={0} step="0.1" value={debt.apr} onChange={e => setDebt({ ...debt, apr: Number(e.currentTarget.value) })} /></Field>
            <Field label="Monthly Payment ($)"><Input type="number" min={0} step="1" value={debt.payment} onChange={e => setDebt({ ...debt, payment: Number(e.currentTarget.value) })} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
              <div className="text-slate-300">Months to payoff</div>
              <div className="text-xl font-bold">{isFinite(payoff.months) ? payoff.months : '—'}</div>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
              <div className="text-slate-300">Total interest</div>
              <div className="text-xl font-bold">{isFinite(payoff.interest) ? fmt(payoff.interest) : '—'}</div>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={payoff.series} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                <CartesianGrid strokeOpacity={.15} vertical={false} />
                <XAxis dataKey="m" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip formatter={(v:number)=>fmt(Number(v))} labelFormatter={(l)=>`Month ${l}`} />
                <Line type="monotone" dataKey="bal" stroke="#ff7a45" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Compound Interest</h2>
          <div className="grid grid-cols-4 gap-2">
            <Field label="Principal ($)"><Input type="number" min={0} step="1" value={invest.principal} onChange={e => setInvest({ ...invest, principal: Number(e.currentTarget.value) })} /></Field>
            <Field label="Monthly ($)"><Input type="number" min={0} step="1" value={invest.monthly} onChange={e => setInvest({ ...invest, monthly: Number(e.currentTarget.value) })} /></Field>
            <Field label="Rate (%)"><Input type="number" min={0} step="0.1" value={invest.rate} onChange={e => setInvest({ ...invest, rate: Number(e.currentTarget.value) })} /></Field>
            <Field label="Years"><Input type="number" min={1} step="1" value={invest.years} onChange={e => setInvest({ ...invest, years: Number(e.currentTarget.value) })} /></Field>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projection} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                <CartesianGrid strokeOpacity={.15} vertical={false} />
                <XAxis dataKey="m" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip formatter={(v:number)=>fmt(Number(v))} labelFormatter={(l)=>`Month ${l}`} />
                <Line type="monotone" dataKey="bal" stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      <section>
        <Card className="p-6">
          <h2 className="text-lg font-semibold">Interactive Guides</h2>
          <p className="text-slate-300 mt-1">Deep dives that pair with these tools.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a className="btn-muted" href="/docs/financial-planning-for-difficult-situations">Financial Planning</a>
            <a className="btn-muted" href="/docs/financial-recovery-and-credit-rebuilding">Credit & Recovery</a>
          </div>
        </Card>
      </section>
    </main>
  )
}
