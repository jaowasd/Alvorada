import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { centsToInputValue } from '@/lib/money'
import {
  ACCOUNT_TYPE_LABELS,
  accountFormSchema,
  type AccountFormValues,
} from '@/lib/validation/financas/account'
import type { FinanceAccount } from '@/types/database'

interface AccountFormProps {
  initialAccount?: FinanceAccount
  onSubmit: (values: AccountFormValues) => Promise<void>
  onCancel: () => void
}

export function AccountForm({
  initialAccount,
  onSubmit,
  onCancel,
}: AccountFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: initialAccount?.name ?? '',
      type: initialAccount?.type ?? 'checking',
      initialBalance: initialAccount
        ? centsToInputValue(initialAccount.initial_balance_cents)
        : '0,00',
      includeInTotal: initialAccount?.include_in_total ?? true,
    },
  })

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      <Input label="Nome" error={errors.name?.message} {...register('name')} />
      <Select label="Tipo" error={errors.type?.message} {...register('type')}>
        {Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>
      <Input
        label={
          initialAccount ? 'Saldo inicial' : 'Saldo inicial (ao criar a conta)'
        }
        inputMode="decimal"
        placeholder="0,00"
        error={errors.initialBalance?.message}
        {...register('initialBalance')}
      />
      <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
        <input type="checkbox" {...register('includeInTotal')} />
        Incluir no saldo total
      </label>
      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Salvando…'
            : initialAccount
              ? 'Salvar alterações'
              : 'Criar conta'}
        </Button>
      </div>
    </form>
  )
}
