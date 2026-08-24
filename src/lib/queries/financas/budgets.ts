import { requireSupabase } from '@/lib/supabase'
import type { FinanceBudget } from '@/types/database'

export interface BudgetInput {
  category_id: string
  limit_cents: number
}

export async function fetchFinanceBudgets(
  userId: string,
): Promise<FinanceBudget[]> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('finance_budgets')
    .select('*')
    .eq('user_id', userId)
    .is('archived_at', null)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function createFinanceBudget(
  userId: string,
  input: BudgetInput,
): Promise<FinanceBudget> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('finance_budgets')
    .insert({ ...input, user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateFinanceBudget(
  id: string,
  input: Partial<BudgetInput>,
): Promise<FinanceBudget> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('finance_budgets')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function archiveFinanceBudget(id: string): Promise<void> {
  const client = requireSupabase()
  const { error } = await client
    .from('finance_budgets')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}
