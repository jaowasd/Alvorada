import { z } from 'zod'
import { isValidMoneyInput, parseMoneyInputToCents } from '@/lib/money'
import type { FinanceSettingsInput } from '@/lib/queries/financas/settings'

export const financeSettingsFormSchema = z.object({
  monthlyIncome: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || isValidMoneyInput(value), 'Valor inválido'),
})

export type FinanceSettingsFormValues = z.infer<
  typeof financeSettingsFormSchema
>

export function toFinanceSettingsInput(
  values: FinanceSettingsFormValues,
): FinanceSettingsInput {
  return {
    monthly_income_cents: values.monthlyIncome
      ? parseMoneyInputToCents(values.monthlyIncome)
      : null,
  }
}
