export function formatCurrency(value: number, locale = 'en-US', currency = 'USD'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value)
}

export function parseCurrency(value: string): number {
  const normalized = value.replace(/[^0-9.-]+/g, '')
  return Number.parseFloat(normalized)
}
