import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { interactiveStates } from '@/lib/interactive-states'
import {
  WEEKDAY_LABELS,
  habitFormSchema,
  type HabitFormValues,
} from '@/lib/validation/habit'
import type { Category, Habit } from '@/types/database'

interface HabitFormProps {
  categories: Category[]
  initialHabit?: Habit
  initialWeekdays?: number[]
  onSubmit: (values: HabitFormValues) => Promise<void>
  onCancel: () => void
}

export function HabitForm({
  categories,
  initialHabit,
  initialWeekdays,
  onSubmit,
  onCancel,
}: HabitFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<HabitFormValues>({
    resolver: zodResolver(habitFormSchema),
    defaultValues: {
      name: initialHabit?.name ?? '',
      notes: initialHabit?.notes ?? '',
      categoryId: initialHabit?.category_id ?? '',
      estimatedDurationMinutes: initialHabit?.estimated_duration_minutes
        ? String(initialHabit.estimated_duration_minutes)
        : '',
      frequencyType: initialHabit?.frequency_type ?? 'daily',
      weekdays: initialWeekdays ?? [],
    },
  })

  const frequencyType = watch('frequencyType')
  const weekdays = watch('weekdays') ?? []

  const toggleWeekday = (day: number) => {
    const next = weekdays.includes(day)
      ? weekdays.filter((d) => d !== day)
      : [...weekdays, day].sort((a, b) => a - b)
    setValue('weekdays', next, { shouldValidate: true })
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      <Input label="Nome" error={errors.name?.message} {...register('name')} />
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

      <div className="flex flex-col gap-1.5 text-left">
        <span className="text-sm font-medium text-[var(--color-text)]">
          Frequência
        </span>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
            <input type="radio" value="daily" {...register('frequencyType')} />
            Todo dia
          </label>
          <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
            <input
              type="radio"
              value="specific_days"
              {...register('frequencyType')}
            />
            Dias específicos
          </label>
        </div>
      </div>

      {frequencyType === 'specific_days' && (
        <div className="flex flex-col gap-1.5 text-left">
          <div className="flex flex-wrap gap-2">
            {WEEKDAY_LABELS.map((label, day) => (
              <button
                key={label}
                type="button"
                onClick={() => toggleWeekday(day)}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-xs font-medium',
                  interactiveStates,
                  weekdays.includes(day)
                    ? 'border-primary-500 bg-primary-500/10 text-primary-600'
                    : 'border-[var(--color-border)] text-[var(--color-text-muted)]',
                )}
              >
                {label}
              </button>
            ))}
          </div>
          {errors.weekdays && (
            <p className="text-error-500 text-xs">{errors.weekdays.message}</p>
          )}
        </div>
      )}

      <Input
        label="Duração (min)"
        inputMode="numeric"
        placeholder="ex: 10"
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
            : initialHabit
              ? 'Salvar alterações'
              : 'Criar hábito'}
        </Button>
      </div>
    </form>
  )
}
