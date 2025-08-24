export async function startSquareCheckout({ amount, name, email }: { amount: number; name: string; email?: string }){
  const res = await fetch('/api/square/checkout', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ amount, name, email })
  })
  if (!res.ok) throw new Error('Square checkout failed')
  const data = await res.json()
  if (data.url) window.location.href = data.url
}
