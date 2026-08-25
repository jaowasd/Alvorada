import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import {
  recurringTaskFormSchema,
  type RecurringTaskFormValues,
} from '@/lib/validation/recurringTask'
import type { Category, RecurringTask } from '@/types/database'

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

interface RecurringTaskFormProps {
  categories: Category[]
  initialRecurring?: RecurringTask
  onSubmit: (values: RecurringTaskFormValues) => Promise<void>
  onCancel: () => void
}

export function RecurringTaskForm({
  categories,
  initialRecurring,
  onSubmit,
  onCancel,
}: RecurringTaskFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RecurringTaskFormValues>({
    resolver: zodResolver(recurringTaskFormSchema),
    defaultValues: {
      title: initialRecurring?.title ?? '',
      notes: initialRecurring?.notes ?? '',
      categoryId: initialRecurring?.category_id ?? '',
      estimatedDurationMinutes: initialRecurring?.estimated_duration_minutes
        ? String(initialRecurring.estimated_duration_minutes)
        : '',
      frequency: initialRecurring?.frequency ?? 'monthly',
      dayOfMonth: initialRecurring?.day_of_month
        ? String(initialRecurring.day_of_month)
        : '',
      weekday:
        initialRecurring?.weekday != null
          ? String(initialRecurring.weekday)
          : '',
      startDate: initialRecurring?.start_date ?? '',
      endDate: initialRecurring?.end_date ?? '',
    },
  })

  const frequency = watch('frequency')

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      <Input
        label="Título"
        placeholder="ex: Revisar orçamento"
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

      <div className="flex flex-col gap-1.5 text-left">
        <span className="text-sm font-medium text-[var(--color-text)]">
          Frequência
        </span>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
            <input type="radio" value="monthly" {...register('frequency')} />
            Mensal
          </label>
          <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
            <input type="radio" value="weekly" {...register('frequency')} />
            Semanal
          </label>
        </div>
      </div>

      {frequency === 'monthly' ? (
        <Input
          label="Dia do mês"
          inputMode="numeric"
          placeholder="ex: 10"
          error={errors.dayOfMonth?.message}
          {...register('dayOfMonth')}
        />
      ) : (
        <Select
          label="Dia da semana"
          error={errors.weekday?.message}
          {...register('weekday')}
        >
          <option value="">Selecione</option>
          {WEEKDAY_LABELS.map((label, day) => (
            <option key={label} value={day}>
              {label}
            </option>
          ))}
        </Select>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Início"
          type="date"
          error={errors.startDate?.message}
          {...register('startDate')}
        />
        <Input
          label="Fim (opcional)"
          type="date"
          error={errors.endDate?.message}
          {...register('endDate')}
        />
      </div>

      <Input
        label="Duração (min, opcional)"
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
            : initialRecurring
              ? 'Salvar alterações'
              : 'Criar recorrência'}
        </Button>
      </div>
    </form>
  )
}
