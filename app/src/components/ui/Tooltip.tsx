import type { ReactNode } from 'react'

export function Tooltip({ content, children }: { content: string; children: ReactNode }) {
  return (
    <span className="relative group">
      {children}
      <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100">
        {content}
      </span>
    </span>
  )
}
