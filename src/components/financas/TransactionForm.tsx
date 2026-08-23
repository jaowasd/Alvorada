import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { centsToInputValue } from '@/lib/money'
import {
  PAYMENT_METHOD_LABELS,
  transactionFormSchema,
  type TransactionFormValues,
} from '@/lib/validation/financas/transaction'
import type {
  FinanceAccount,
  FinanceCategory,
  FinanceTransaction,
  FinanceTransactionType,
} from '@/types/database'

interface TransactionFormProps {
  accounts: FinanceAccount[]
  categories: FinanceCategory[]
  initialTransaction?: FinanceTransaction
  defaultType?: FinanceTransactionType
  /** Esconde o seletor de tipo (usado quando o formulário só serve para transferências). */
  lockType?: boolean
  onSubmit: (values: TransactionFormValues) => Promise<void>
  onCancel: () => void
}

export function TransactionForm({
  accounts,
  categories,
  initialTransaction,
  defaultType,
  lockType = false,
  onSubmit,
  onCancel,
}: TransactionFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type: initialTransaction?.type ?? defaultType ?? 'expense',
      description: initialTransaction?.description ?? '',
      amount: initialTransaction
        ? centsToInputValue(initialTransaction.amount_cents)
        : '',
      categoryId: initialTransaction?.category_id ?? '',
      accountId: initialTransaction?.account_id ?? '',
      relatedAccountId: initialTransaction?.related_account_id ?? '',
      paymentMethod: initialTransaction?.payment_method ?? '',
      status: initialTransaction?.status ?? 'planned',
      dueDate: initialTransaction?.due_date ?? '',
      paidAt: initialTransaction?.paid_at ?? '',
      notes: initialTransaction?.notes ?? '',
    },
  })

  const type = watch('type')
  const isTransfer = type === 'transfer'
  const filteredCategories = categories.filter(
    (category) => category.kind === (type === 'income' ? 'income' : 'expense'),
  )

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      <input type="hidden" {...register('status')} />
      <input type="hidden" {...register('paidAt')} />

      {lockType ? (
        <input type="hidden" {...register('type')} />
      ) : (
        <div className="flex flex-col gap-1.5 text-left">
          <span className="text-sm font-medium text-[var(--color-text)]">
            Tipo
          </span>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
              <input type="radio" value="expense" {...register('type')} />
              Despesa
            </label>
            <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
              <input type="radio" value="income" {...register('type')} />
              Receita
            </label>
            <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
              <input type="radio" value="transfer" {...register('type')} />
              Transferência
            </label>
          </div>
        </div>
      )}

      <Input
        label="Descrição"
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

      <Select
        label={isTransfer ? 'Conta de origem' : 'Conta'}
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

      {isTransfer ? (
        <Select
          label="Conta de destino"
          error={errors.relatedAccountId?.message}
          {...register('relatedAccountId')}
        >
          <option value="">Selecione</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </Select>
      ) : (
        <Select
          label="Categoria"
          error={errors.categoryId?.message}
          {...register('categoryId')}
        >
          <option value="">Sem categoria</option>
          {filteredCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      )}

      {!isTransfer && (
        <Select
          label="Forma de pagamento"
          error={errors.paymentMethod?.message}
          {...register('paymentMethod')}
        >
          <option value="">Não informado</option>
          {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      )}

      <Input
        label="Data"
        type="date"
        error={errors.dueDate?.message}
        {...register('dueDate')}
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
            : initialTransaction
              ? 'Salvar alterações'
              : 'Adicionar'}
        </Button>
      </div>
    </form>
  )
}
