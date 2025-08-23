import { useForm } from 'react-hook-form'
import { z } from 'zod'
import useOnboardingStore from './useOnboardingStore'

const schema = z.object({
  baselineIncome: z.coerce.number().positive('Income must be positive'),
})

type FormData = z.infer<typeof schema>

export default function BaselineIncomeStep() {
  const { baselineIncome, setBaselineIncome, nextStep } = useOnboardingStore()
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>({
    defaultValues: { baselineIncome },
  })

  const onSubmit = (values: FormData) => {
    const result = schema.safeParse(values)
    if (!result.success) {
      const message = result.error.formErrors.fieldErrors.baselineIncome?.[0]
      if (message) setError('baselineIncome', { message })
      return
    }
    setBaselineIncome(result.data.baselineIncome)
    nextStep()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="baselineIncome" className="block text-sm font-medium">
          Baseline Income
        </label>
        <input
          id="baselineIncome"
          type="number"
          className="border p-2 w-full"
          {...register('baselineIncome', { valueAsNumber: true })}
        />
        {errors.baselineIncome && (
          <p className="text-red-500 text-sm">{errors.baselineIncome.message}</p>
        )}
      </div>
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
        Next
      </button>
    </form>
  )
}
