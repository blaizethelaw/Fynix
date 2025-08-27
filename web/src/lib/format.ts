export const fmt = (n: number) => n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
export const pct = (n: number) => (isFinite(n) ? n.toFixed(0) + '%' : '—')

export const asUSD = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

export const asPct0 = (n: number) => `${Math.round(n * 100)}%`
