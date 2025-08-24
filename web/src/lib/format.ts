export const fmt = (n: number) => n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
export const pct = (n: number) => (isFinite(n) ? n.toFixed(0) + '%' : '—')
