import {
  computeMissingOccurrences,
  resolveInstanceAmountCents,
} from '@/lib/financeRecurring'
import { getLocalDateString } from '@/lib/date'
import { requireSupabase } from '@/lib/supabase'
import type {
  FinanceRecurringFrequency,
  FinanceRecurringTransaction,
  FinanceTransactionType,
} from '@/types/database'

export interface RecurringTransactionInput {
  type: Exclude<FinanceTransactionType, 'transfer'>
  description: string
  amount_cents: number
  is_variable_amount: boolean
  category_id: string | null
  account_id: string
  frequency: FinanceRecurringFrequency
  day_of_month: number | null
  weekday: number | null
  start_date: string
  end_date: string | null
}

export async function fetchRecurringTransactions(
  userId: string,
): Promise<FinanceRecurringTransaction[]> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('finance_recurring_transactions')
    .select('*')
    .eq('user_id', userId)
    .is('archived_at', null)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createRecurringTransaction(
  userId: string,
  input: RecurringTransactionInput,
): Promise<FinanceRecurringTransaction> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('finance_recurring_transactions')
    .insert({ ...input, user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateRecurringTransaction(
  id: string,
  input: Partial<RecurringTransactionInput>,
): Promise<FinanceRecurringTransaction> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('finance_recurring_transactions')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function setRecurringTransactionActive(
  id: string,
  isActive: boolean,
): Promise<FinanceRecurringTransaction> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('finance_recurring_transactions')
    .update({ is_active: isActive })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function archiveRecurringTransaction(id: string): Promise<void> {
  const client = requireSupabase()
  const { error } = await client
    .from('finance_recurring_transactions')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

/**
 * Gera as transações faltantes de todas as recorrências ativas do usuário,
 * do cursor (last_generated_date ou start_date) até hoje + 1 mês. Chamada
 * sob demanda ao abrir a página financeira — não há cron/backend persistente.
 */
export async function generateMissingRecurringInstances(
  userId: string,
): Promise<void> {
  const client = requireSupabase()
  const today = getLocalDateString()

  const { data: recurrences, error } = await client
    .from('finance_recurring_transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .is('archived_at', null)
  if (error) throw error

  for (const recurrence of recurrences ?? []) {
    const dueDates = computeMissingOccurrences(
      {
        frequency: recurrence.frequency,
        dayOfMonth: recurrence.day_of_month,
        weekday: recurrence.weekday,
        startDate: recurrence.start_date,
        endDate: recurrence.end_date,
        lastGeneratedDate: recurrence.last_generated_date,
      },
      today,
    )
    if (dueDates.length === 0) continue

    let amountCents = recurrence.amount_cents
    if (recurrence.is_variable_amount) {
      const { data: lastTransaction } = await client
        .from('finance_transactions')
        .select('amount_cents')
        .eq('recurring_transaction_id', recurrence.id)
        .order('due_date', { ascending: false })
        .limit(1)
        .maybeSingle()
      amountCents = resolveInstanceAmountCents(
        {
          amountCents: recurrence.amount_cents,
          isVariableAmount: recurrence.is_variable_amount,
        },
        lastTransaction?.amount_cents ?? null,
      )
    }

    const rows = dueDates.map((dueDate) => ({
      user_id: userId,
      type: recurrence.type,
      description: recurrence.description,
      amount_cents: amountCents,
      category_id: recurrence.category_id,
      account_id: recurrence.account_id,
      status: 'planned' as const,
      due_date: dueDate,
      recurring_transaction_id: recurrence.id,
    }))

    const { error: insertError } = await client
      .from('finance_transactions')
      .insert(rows)
    if (insertError) throw insertError

    const { error: updateError } = await client
      .from('finance_recurring_transactions')
      .update({ last_generated_date: dueDates[dueDates.length - 1] })
      .eq('id', recurrence.id)
    if (updateError) throw updateError
  }
}
