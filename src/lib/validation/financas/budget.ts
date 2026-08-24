import { z } from 'zod'
import { isValidMoneyInput, parseMoneyInputToCents } from '@/lib/money'
import type { BudgetInput } from '@/lib/queries/financas/budgets'

export const budgetFormSchema = z.object({
  categoryId: z.string().min(1, 'Escolha uma categoria'),
  limit: z
    .string()
    .trim()
    .min(1, 'Informe o limite mensal')
    .refine((value) => isValidMoneyInput(value), 'Valor inválido'),
})

export type BudgetFormValues = z.infer<typeof budgetFormSchema>

export function toBudgetInput(values: BudgetFormValues): BudgetInput {
  return {
    category_id: values.categoryId,
    limit_cents: parseMoneyInputToCents(values.limit),
  }
}
