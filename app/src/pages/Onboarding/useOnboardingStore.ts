import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface OnboardingState {
  step: number
  baselineIncome?: number
  debts?: number
  target?: number
  setBaselineIncome: (income: number) => void
  setDebts: (debts: number) => void
  setTarget: (target: number) => void
  nextStep: () => void
  reset: () => void
}

const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      step: 0,
      baselineIncome: undefined,
      debts: undefined,
      target: undefined,
      setBaselineIncome: (baselineIncome) => set({ baselineIncome }),
      setDebts: (debts) => set({ debts }),
      setTarget: (target) => set({ target }),
      nextStep: () => set((s) => ({ step: s.step + 1 })),
      reset: () =>
        set({ step: 0, baselineIncome: undefined, debts: undefined, target: undefined }),
    }),
    {
      name: 'onboarding',
    }
  )
)

export default useOnboardingStore
