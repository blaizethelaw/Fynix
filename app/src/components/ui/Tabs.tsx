import type { ReactNode } from 'react'
import { useState } from 'react'

export function Tabs({
  tabs,
}: {
  tabs: { id: string; label: string; content: ReactNode }[]
}) {
  const [active, setActive] = useState(tabs[0]?.id)
  return (
    <div>
      <div className="flex gap-2 border-b">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`px-3 py-2 ${t.id === active ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-2">{tabs.find((t) => t.id === active)?.content}</div>
    </div>
  )
}
