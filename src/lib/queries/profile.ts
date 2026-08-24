import { requireSupabase } from '@/lib/supabase'
import type { Profile } from '@/types/database'

export interface ProfileInput {
  display_name: string | null
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
