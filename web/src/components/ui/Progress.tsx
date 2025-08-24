export function Progress({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
      <div className="h-full bg-gradient-to-r from-brand-500 to-amber-300" style={{ width: clamped + '%' }} />
    </div>
  )
}
