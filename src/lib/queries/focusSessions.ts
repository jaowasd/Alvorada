import { requireSupabase } from '@/lib/supabase'
import type { FocusSession } from '@/types/database'

export async function fetchFocusSessions(
  userId: string,
): Promise<FocusSession[]> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('focus_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
  if (error) throw error
  return data
}

export interface FocusSessionInput {
  task_id: string | null
  label: string | null
  duration_minutes: number
}

export async function startFocusSession(
  userId: string,
  input: FocusSessionInput,
): Promise<FocusSession> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('focus_sessions')
    .insert({ ...input, user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function completeFocusSession(id: string): Promise<FocusSession> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('focus_sessions')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}
