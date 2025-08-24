export async function saveBudget(userId: string, payload: any){
  const res = await fetch(`/api/budget?user=${encodeURIComponent(userId)}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error('Failed to save budget')
}
export async function loadBudget(userId: string){
  const res = await fetch(`/api/budget?user=${encodeURIComponent(userId)}`)
  if (!res.ok) throw new Error('Failed to load budget')
  return res.json()
}
export async function startCheckout(email?: string){
  const res = await fetch('/api/checkout', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ customerEmail: email }) })
  const data = await res.json()
  if (data.url) window.location.href = data.url
}
export async function sendMonthlyReport(to: string, title: string, summary: string){
  const res = await fetch('/api/email/monthly-report', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ to, title, summary }) })
  if (!res.ok) throw new Error('email failed')
}
