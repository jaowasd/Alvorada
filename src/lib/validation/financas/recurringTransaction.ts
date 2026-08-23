import { z } from 'zod'
import { isValidMoneyInput, parseMoneyInputToCents } from '@/lib/money'
import type { RecurringTransactionInput } from '@/lib/queries/financas/recurring'

export const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export const recurringTransactionFormSchema = z
  .object({
    type: z.enum(['income', 'expense']),
    description: z
      .string()
      .trim()
      .min(1, 'Informe uma descrição')
      .max(120, 'Descrição muito longa'),
    amount: z
      .string()
      .trim()
      .min(1, 'Informe um valor')
      .refine((value) => isValidMoneyInput(value), 'Valor inválido')
      .refine(
        (value) => parseMoneyInputToCents(value) > 0,
        'O valor deve ser maior que zero',
      ),
    isVariableAmount: z.boolean(),
    categoryId: z.string().optional(),
    accountId: z.string().min(1, 'Selecione uma conta'),
    frequency: z.enum(['monthly', 'weekly']),
    dayOfMonth: z.string().optional(),
    weekday: z.string().optional(),
    startDate: z.string().min(1, 'Informe a data de início'),
    endDate: z.string().optional(),
  })
  .refine(
    (data) =>
      data.frequency !== 'monthly' ||
      (!!data.dayOfMonth &&
        /^\d+$/.test(data.dayOfMonth) &&
        Number(data.dayOfMonth) >= 1 &&
        Number(data.dayOfMonth) <= 31),
    { message: 'Informe o dia do mês (1 a 31)', path: ['dayOfMonth'] },
  )
  .refine(
    (data) =>
      data.frequency !== 'weekly' ||
      (data.weekday !== undefined && data.weekday !== ''),
    { message: 'Selecione o dia da semana', path: ['weekday'] },
  )
  .refine((data) => !data.endDate || data.endDate >= data.startDate, {
    message: 'A data final deve ser depois da data de início',
    path: ['endDate'],
  })

export type RecurringTransactionFormValues = z.infer<
  typeof recurringTransactionFormSchema
>

export function toRecurringTransactionInput(
  values: RecurringTransactionFormValues,
): RecurringTransactionInput {
  return {
    type: values.type,
    description: values.description,
    amount_cents: parseMoneyInputToCents(values.amount),
    is_variable_amount: values.isVariableAmount,
    category_id: values.categoryId || null,
    account_id: values.accountId,
    frequency: values.frequency,
    day_of_month:
      values.frequency === 'monthly' ? Number(values.dayOfMonth) : null,
    weekday: values.frequency === 'weekly' ? Number(values.weekday) : null,
    start_date: values.startDate,
    end_date: values.endDate || null,
  }
}
