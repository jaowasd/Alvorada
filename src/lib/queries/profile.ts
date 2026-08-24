import { requireSupabase } from '@/lib/supabase'
import type { Profile, ThemePreference } from '@/types/database'

export interface ProfileInput {
  display_name: string | null
  theme_preference: ThemePreference
  timezone: string
}

export async function fetchProfile(userId: string): Promise<Profile> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

export async function updateProfile(
  userId: string,
  input: Partial<ProfileInput>,
): Promise<Profile> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('profiles')
    .update(input)
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

/** Exclui a própria conta (RPC security definer — ver migration 0008). Cascateia para todos os dados do usuário. */
export async function deleteOwnAccount(): Promise<void> {
  const client = requireSupabase()
  const { error } = await client.rpc('delete_own_account')
  if (error) throw error
}
