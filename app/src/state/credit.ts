import { create } from 'zustand'

interface CreditState {
  score: number
  setScore: (score: number) => void
}

export const useCreditStore = create<CreditState>((set) => ({
  score: 0,
  setScore: (score) => set({ score })
}))
