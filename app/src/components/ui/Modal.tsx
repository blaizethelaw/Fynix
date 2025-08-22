import type { ReactNode } from 'react'

export function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow max-w-sm w-full">
        {children}
        <button className="mt-4 text-sm underline" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}
