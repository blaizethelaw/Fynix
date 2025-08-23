import BaselineIncomeStep from './BaselineIncomeStep'
import DebtsStep from './DebtsStep'
import TargetsStep from './TargetsStep'
import useOnboardingStore from './useOnboardingStore'

export default function Onboarding() {
  const step = useOnboardingStore((s) => s.step)

  return (
    <div className="p-4 max-w-md mx-auto">
      {step === 0 && <BaselineIncomeStep />}
      {step === 1 && <DebtsStep />}
      {step === 2 && <TargetsStep />}
    </div>
  )
}
