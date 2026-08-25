import { z } from 'zod'
import { isValidMoneyInput, parseMoneyInputToCents } from '@/lib/money'
import type { TransactionInput } from '@/lib/queries/financas/transactions'
import type { FinancePaymentMethod } from '@/types/database'

export const PAYMENT_METHOD_LABELS: Record<FinancePaymentMethod, string> = {
  pix: 'Pix',
  boleto: 'Boleto',
  debit_card: 'Cartão de débito',
  credit_card: 'Cartão de crédito',
  cash: 'Dinheiro',
  bank_transfer: 'Transferência bancária',
  other: 'Outro',
}

export const transactionFormSchema = z
  .object({
    type: z.enum(['income', 'expense', 'transfer']),
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
    categoryId: z.string().optional(),
    accountId: z.string().min(1, 'Selecione uma conta'),
    relatedAccountId: z.string().optional(),
    paymentMethod: z
      .union([
        z.literal(''),
        z.enum(['pix', 'boleto', 'debit_card', 'credit_card', 'cash', 'bank_transfer', 'other']),
      ])
      .optional(),
    status: z.enum(['planned', 'confirmed']),
    dueDate: z.string().min(1, 'Informe a data'),
    paidAt: z.string().optional(),
    notes: z.string().trim().max(500, 'Nota muito longa').optional(),
  })
  .refine((data) => data.type !== 'transfer' || !!data.relatedAccountId, {
    message: 'Selecione a conta de destino',
    path: ['relatedAccountId'],
  })
  .refine(
    (data) =>
      data.type !== 'transfer' || data.relatedAccountId !== data.accountId,
    {
      message: 'A conta de destino deve ser diferente da conta de origem',
      path: ['relatedAccountId'],
    },
  )

export type TransactionFormValues = z.infer<typeof transactionFormSchema>

export function toTransactionInput(
  values: TransactionFormValues,
): TransactionInput {
  const isTransfer = values.type === 'transfer'
  return {
    type: values.type,
    description: values.description,
    amount_cents: parseMoneyInputToCents(values.amount),
    category_id: isTransfer ? null : values.categoryId || null,
    account_id: values.accountId,
    related_account_id: isTransfer ? values.relatedAccountId || null : null,
    payment_method: (values.paymentMethod as FinancePaymentMethod) || null,
    status: values.status,
    due_date: values.dueDate,
    paid_at: values.paidAt || null,
    notes: values.notes?.trim() ? values.notes.trim() : null,
  }
}
