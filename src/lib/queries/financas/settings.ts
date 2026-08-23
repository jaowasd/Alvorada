import { requireSupabase } from '@/lib/supabase'
import type { FinanceSettings } from '@/types/database'

export interface FinanceSettingsInput {
  monthly_income_cents: number | null
}

export async function fetchFinanceSettings(
  userId: string,
): Promise<FinanceSettings> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('finance_settings')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error) throw error
  return data
}

export async function updateFinanceSettings(
  userId: string,
  input: Partial<FinanceSettingsInput>,
): Promise<FinanceSettings> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('finance_settings')
    .update(input)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}
