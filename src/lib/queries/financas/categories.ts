import { requireSupabase } from '@/lib/supabase'
import type { FinanceCategory, FinanceCategoryKind } from '@/types/database'

export interface FinanceCategoryInput {
  name: string
  kind: FinanceCategoryKind
  icon: string
  color: string
}

export async function fetchFinanceCategories(): Promise<FinanceCategory[]> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('finance_categories')
    .select('*')
    .is('archived_at', null)
    .order('is_system', { ascending: false })
    .order('name', { ascending: true })
  if (error) throw error
  return data
}

export async function createFinanceCategory(
  userId: string,
  input: FinanceCategoryInput,
): Promise<FinanceCategory> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('finance_categories')
    .insert({ ...input, user_id: userId, is_system: false })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateFinanceCategory(
  id: string,
  input: Partial<FinanceCategoryInput>,
): Promise<FinanceCategory> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('finance_categories')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function archiveFinanceCategory(id: string): Promise<void> {
  const client = requireSupabase()
  const { error } = await client
    .from('finance_categories')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}
