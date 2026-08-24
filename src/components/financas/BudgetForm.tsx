import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { centsToInputValue } from '@/lib/money'
import {
  budgetFormSchema,
  type BudgetFormValues,
} from '@/lib/validation/financas/budget'
import type { FinanceBudget, FinanceCategory } from '@/types/database'

interface BudgetFormProps {
  categories: FinanceCategory[]
  initialBudget?: FinanceBudget
  onSubmit: (values: BudgetFormValues) => Promise<void>
  onCancel: () => void
}

export function BudgetForm({
  categories,
  initialBudget,
  onSubmit,
  onCancel,
}: BudgetFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      categoryId: initialBudget?.category_id ?? categories[0]?.id ?? '',
      limit: initialBudget ? centsToInputValue(initialBudget.limit_cents) : '',
    },
  })

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      <Select
        label="Categoria"
        error={errors.categoryId?.message}
        disabled={!!initialBudget}
        {...register('categoryId')}
      >
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Select>
      <Input
        label="Limite mensal"
        inputMode="decimal"
        placeholder="0,00"
        error={errors.limit?.message}
        {...register('limit')}
      />
      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Salvando…'
            : initialBudget
              ? 'Salvar alterações'
              : 'Criar orçamento'}
        </Button>
      </div>
    </form>
  )
}
