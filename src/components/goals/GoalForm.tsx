import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { goalFormSchema, type GoalFormValues } from '@/lib/validation/goal'
import type { Goal } from '@/types/database'

interface GoalFormProps {
  initialGoal?: Goal
  onSubmit: (values: GoalFormValues) => Promise<void>
  onCancel: () => void
}

export function GoalForm({ initialGoal, onSubmit, onCancel }: GoalFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      name: initialGoal?.name ?? '',
      targetValue: initialGoal?.target_value
        ? String(initialGoal.target_value)
        : '',
      unit: initialGoal?.unit ?? '',
      deadlineDate: initialGoal?.deadline_date ?? '',
    },
  })

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      <Input label="Nome" error={errors.name?.message} {...register('name')} />
      <div className="flex gap-3">
        <Input
          label="Alvo (opcional)"
          inputMode="decimal"
          placeholder="ex: 12"
          error={errors.targetValue?.message}
          {...register('targetValue')}
        />
        <Input
          label="Unidade"
          placeholder="ex: livros"
          error={errors.unit?.message}
          {...register('unit')}
        />
      </div>
      <p className="-mt-2 text-xs text-[var(--color-text-muted)]">
        Deixe o alvo em branco para uma meta simples de feito/não-feito.
      </p>
      <Input
        type="date"
        label="Prazo (opcional)"
        error={errors.deadlineDate?.message}
        {...register('deadlineDate')}
      />

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Salvando…'
            : initialGoal
              ? 'Salvar alterações'
              : 'Criar meta'}
        </Button>
      </div>
    </form>
  )
}
