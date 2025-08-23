import { useForm } from 'react-hook-form'
import { z } from 'zod'
import useOnboardingStore from './useOnboardingStore'
import { useNavigate } from 'react-router-dom'

const schema = z.object({
  target: z.coerce.number().positive('Target must be positive'),
})

type FormData = z.infer<typeof schema>

export default function TargetsStep() {
  const { target, setTarget, reset } = useOnboardingStore()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>({
    defaultValues: { target },
  })

  const onSubmit = (values: FormData) => {
    const result = schema.safeParse(values)
    if (!result.success) {
      const message = result.error.formErrors.fieldErrors.target?.[0]
      if (message) setError('target', { message })
      return
    }
    setTarget(result.data.target)
    reset()
    navigate('/dashboard')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="target" className="block text-sm font-medium">
          Target
        </label>
        <input
          id="target"
          type="number"
          className="border p-2 w-full"
          {...register('target', { valueAsNumber: true })}
        />
        {errors.target && (
          <p className="text-red-500 text-sm">{errors.target.message}</p>
        )}
      </div>
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
        Finish
      </button>
    </form>
  )
}
