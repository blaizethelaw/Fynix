import { useState } from 'react'

export function Toast({ message }: { message: string }) {
  const [open, setOpen] = useState(true)
  if (!open) return null
  return (
    <div className="fixed bottom-4 right-4 rounded bg-gray-800 text-white px-4 py-2">
      {message}
      <button className="ml-2 underline" onClick={() => setOpen(false)}>
        dismiss
      </button>
    </div>
  )
}
