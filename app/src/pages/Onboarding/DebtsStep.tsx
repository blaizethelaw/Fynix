import { useForm } from 'react-hook-form'
import { z } from 'zod'
import useOnboardingStore from './useOnboardingStore'

const schema = z.object({
  debts: z.coerce.number().min(0, 'Debts cannot be negative'),
})

type FormData = z.infer<typeof schema>

export default function DebtsStep() {
  const { debts, setDebts, nextStep } = useOnboardingStore()
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>({
    defaultValues: { debts },
  })

  const onSubmit = (values: FormData) => {
    const result = schema.safeParse(values)
    if (!result.success) {
      const message = result.error.formErrors.fieldErrors.debts?.[0]
      if (message) setError('debts', { message })
      return
    }
    setDebts(result.data.debts)
    nextStep()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="debts" className="block text-sm font-medium">
          Debts
        </label>
        <input
          id="debts"
          type="number"
          className="border p-2 w-full"
          {...register('debts', { valueAsNumber: true })}
        />
        {errors.debts && (
          <p className="text-red-500 text-sm">{errors.debts.message}</p>
        )}
      </div>
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
        Next
      </button>
    </form>
  )
}
