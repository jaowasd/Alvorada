import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import {
  routineStepFormSchema,
  type RoutineStepFormValues,
} from '@/lib/validation/routineStep'
import type { Category, RoutineStep } from '@/types/database'

interface RoutineStepFormProps {
  categories: Category[]
  initialStep?: RoutineStep
  onSubmit: (values: RoutineStepFormValues) => Promise<void>
  onCancel: () => void
}

export function RoutineStepForm({
  categories,
  initialStep,
  onSubmit,
  onCancel,
}: RoutineStepFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RoutineStepFormValues>({
    resolver: zodResolver(routineStepFormSchema),
    defaultValues: {
      title: initialStep?.title ?? '',
      notes: initialStep?.notes ?? '',
      categoryId: initialStep?.category_id ?? '',
      estimatedDurationMinutes: initialStep?.estimated_duration_minutes
        ? String(initialStep.estimated_duration_minutes)
        : '',
    },
  })

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      <Input
        label="Título"
        error={errors.title?.message}
        {...register('title')}
      />
      <Select
        label="Categoria"
        error={errors.categoryId?.message}
        {...register('categoryId')}
      >
        <option value="">Sem categoria</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Select>
      <Input
        label="Duração (min)"
        inputMode="numeric"
        placeholder="ex: 15"
        error={errors.estimatedDurationMinutes?.message}
        {...register('estimatedDurationMinutes')}
      />
      <Input
        label="Nota (opcional)"
        error={errors.notes?.message}
        {...register('notes')}
      />
      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Salvando…'
            : initialStep
              ? 'Salvar alterações'
              : 'Adicionar etapa'}
        </Button>
      </div>
    </form>
  )
}
