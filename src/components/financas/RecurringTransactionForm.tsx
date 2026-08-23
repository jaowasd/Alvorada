import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { centsToInputValue } from '@/lib/money'
import {
  WEEKDAY_LABELS,
  recurringTransactionFormSchema,
  type RecurringTransactionFormValues,
} from '@/lib/validation/financas/recurringTransaction'
import type {
  FinanceAccount,
  FinanceCategory,
  FinanceRecurringTransaction,
} from '@/types/database'

interface RecurringTransactionFormProps {
  accounts: FinanceAccount[]
  categories: FinanceCategory[]
  initialRecurring?: FinanceRecurringTransaction
  onSubmit: (values: RecurringTransactionFormValues) => Promise<void>
  onCancel: () => void
}

export function RecurringTransactionForm({
  accounts,
  categories,
  initialRecurring,
  onSubmit,
  onCancel,
}: RecurringTransactionFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RecurringTransactionFormValues>({
    resolver: zodResolver(recurringTransactionFormSchema),
    defaultValues: {
      type: 'expense',
      description: initialRecurring?.description ?? '',
      amount: initialRecurring
        ? centsToInputValue(initialRecurring.amount_cents)
        : '',
      isVariableAmount: initialRecurring?.is_variable_amount ?? false,
      categoryId: initialRecurring?.category_id ?? '',
      accountId: initialRecurring?.account_id ?? '',
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
  const expenseCategories = categories.filter(
    (category) => category.kind === 'expense',
  )

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      <input type="hidden" {...register('type')} />

      <Input
        label="Descrição"
        placeholder="ex: Aluguel, Energia, Internet"
        error={errors.description?.message}
        {...register('description')}
      />
      <Input
        label="Valor (R$)"
        inputMode="decimal"
        placeholder="0,00"
        error={errors.amount?.message}
        {...register('amount')}
      />
      <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
        <input type="checkbox" {...register('isVariableAmount')} />
        Valor varia todo mês (ex: energia, água)
      </label>

      <Select
        label="Categoria"
        error={errors.categoryId?.message}
        {...register('categoryId')}
      >
        <option value="">Sem categoria</option>
        {expenseCategories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Select>

      <Select
        label="Conta de pagamento"
        error={errors.accountId?.message}
        {...register('accountId')}
      >
        <option value="">Selecione</option>
        {accounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.name}
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

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Salvando…'
            : initialRecurring
              ? 'Salvar alterações'
              : 'Adicionar conta'}
        </Button>
      </div>
    </form>
  )
}
