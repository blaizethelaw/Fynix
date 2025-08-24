import { forwardRef, InputHTMLAttributes } from 'react'
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="text-slate-300">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  )
}
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className = '', ...props }, ref) {
  return (
    <input ref={ref} {...props} className={'w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring focus:ring-amber-400/20 ' + className} />
  )
})
