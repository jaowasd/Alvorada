import { requireSupabase } from '@/lib/supabase'
import type { FinanceAccount, FinanceAccountType } from '@/types/database'

export interface AccountInput {
  name: string
  type: FinanceAccountType
  initial_balance_cents: number
  include_in_total: boolean
}

export async function fetchFinanceAccounts(
  userId: string,
): Promise<FinanceAccount[]> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('finance_accounts')
    .select('*')
    .eq('user_id', userId)
    .is('archived_at', null)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function createFinanceAccount(
  userId: string,
  input: AccountInput,
): Promise<FinanceAccount> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('finance_accounts')
    .insert({ ...input, user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateFinanceAccount(
  id: string,
  input: Partial<AccountInput>,
): Promise<FinanceAccount> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('finance_accounts')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function archiveFinanceAccount(id: string): Promise<void> {
  const client = requireSupabase()
  const { error } = await client
    .from('finance_accounts')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}
