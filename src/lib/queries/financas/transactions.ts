import { getLocalDateString } from '@/lib/date'
import { requireSupabase } from '@/lib/supabase'
import type {
  FinancePaymentMethod,
  FinanceTransaction,
  FinanceTransactionStatus,
  FinanceTransactionType,
} from '@/types/database'

export interface TransactionInput {
  type: FinanceTransactionType
  description: string
  amount_cents: number
  category_id: string | null
  account_id: string
  related_account_id: string | null
  payment_method: FinancePaymentMethod | null
  status: FinanceTransactionStatus
  due_date: string
  paid_at: string | null
  notes: string | null
}

export async function fetchTransactions(
  userId: string,
): Promise<FinanceTransaction[]> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('finance_transactions')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('due_date', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createTransaction(
  userId: string,
  input: TransactionInput,
): Promise<FinanceTransaction> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('finance_transactions')
    .insert({ ...input, user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateTransaction(
  id: string,
  input: Partial<TransactionInput>,
): Promise<FinanceTransaction> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('finance_transactions')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function setTransactionStatus(
  id: string,
  status: FinanceTransactionStatus,
): Promise<FinanceTransaction> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('finance_transactions')
    .update({
      status,
      paid_at: status === 'confirmed' ? getLocalDateString() : null,
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function softDeleteTransaction(id: string): Promise<void> {
  const client = requireSupabase()
  const { error } = await client
    .from('finance_transactions')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function duplicateTransaction(
  id: string,
): Promise<FinanceTransaction> {
  const client = requireSupabase()
  const { data: original, error: fetchError } = await client
    .from('finance_transactions')
    .select('*')
    .eq('id', id)
    .single()
  if (fetchError) throw fetchError

  const { data, error } = await client
    .from('finance_transactions')
    .insert({
      user_id: original.user_id,
      type: original.type,
      description: original.description,
      amount_cents: original.amount_cents,
      category_id: original.category_id,
      account_id: original.account_id,
      related_account_id: original.related_account_id,
      payment_method: original.payment_method,
      status: 'planned',
      due_date: original.due_date,
      paid_at: null,
      notes: original.notes,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

/** Estorna uma transação confirmada criando uma nova de tipo oposto, sem apagar/editar a original. */
export async function createReversalTransaction(
  original: FinanceTransaction,
): Promise<FinanceTransaction> {
  const client = requireSupabase()
  const reversedType: FinanceTransactionType =
    original.type === 'income' ? 'expense' : 'income'
  const today = getLocalDateString()

  const { data, error } = await client
    .from('finance_transactions')
    .insert({
      user_id: original.user_id,
      type: reversedType,
      description: `Estorno: ${original.description}`,
      amount_cents: original.amount_cents,
      category_id: original.category_id,
      account_id: original.account_id,
      related_account_id: null,
      payment_method: original.payment_method,
      status: 'confirmed',
      due_date: today,
      paid_at: today,
      notes: null,
      reversal_of_transaction_id: original.id,
    })
    .select()
    .single()
  if (error) throw error
  return data
}
