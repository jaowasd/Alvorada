import { z } from 'zod'
import { isValidMoneyInput, parseMoneyInputToCents } from '@/lib/money'
import type { AccountInput } from '@/lib/queries/financas/accounts'
import type { FinanceAccountType } from '@/types/database'

export const ACCOUNT_TYPE_LABELS: Record<FinanceAccountType, string> = {
  checking: 'Conta corrente',
  savings: 'Poupança',
  wallet: 'Carteira digital',
  cash: 'Dinheiro físico',
  investment: 'Investimento',
  other: 'Outra',
}

export const accountFormSchema = z.object({
  name: z.string().trim().min(1, 'Informe um nome').max(60, 'Nome muito longo'),
  type: z.enum([
    'checking',
    'savings',
    'wallet',
    'cash',
    'investment',
    'other',
  ]),
  initialBalance: z
    .string()
    .trim()
    .min(1, 'Informe o saldo inicial')
    .refine((value) => isValidMoneyInput(value, true), 'Valor inválido'),
  includeInTotal: z.boolean(),
})

export type AccountFormValues = z.infer<typeof accountFormSchema>

export function toAccountInput(values: AccountFormValues): AccountInput {
  return {
    name: values.name,
    type: values.type,
    initial_balance_cents: parseMoneyInputToCents(values.initialBalance),
    include_in_total: values.includeInTotal,
  }
}
