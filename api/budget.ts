import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!)

export default async function handler(req: Request) {
  const url = new URL(req.url)
  const userId = url.searchParams.get('user') || ''
  if (!userId) return new Response('Missing user', { status: 400 })

  if (req.method === 'GET') {
    const [incomes, expenses, debt, invest] = await Promise.all([
      supabase.from('incomes').select('*').eq('user_id', userId),
      supabase.from('expenses').select('*').eq('user_id', userId),
      supabase.from('debts').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('investments').select('*').eq('user_id', userId).maybeSingle()
    ])
    return Response.json({ incomes: incomes.data || [], expenses: expenses.data || [], debt: debt.data || null, invest: invest.data || null })
  }

  if (req.method === 'POST') {
    const body = await req.json()
    const { incomes = [], expenses = [], debt, invest } = body
    // transactional-ish: upsert primitives then delete missing
    await Promise.all([
      ...incomes.map((i: any) => supabase.from('incomes').upsert({ id: i.id, user_id: userId, name: i.name, amount: i.amount })),
      ...expenses.map((e: any) => supabase.from('expenses').upsert({ id: e.id, user_id: userId, category: e.category, amount: e.amount })),
      debt ? supabase.from('debts').upsert({ user_id: userId, ...debt }) : Promise.resolve(),
      invest ? supabase.from('investments').upsert({ user_id: userId, ...invest }) : Promise.resolve()
    ])
    return new Response('OK', { status: 200 })
  }

  return new Response('Method not allowed', { status: 405 })
}
