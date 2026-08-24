import { requireSupabase } from '@/lib/supabase'
import type { SharedRoutineLink } from '@/types/database'

export async function fetchSharedRoutineLink(
  routineId: string,
): Promise<SharedRoutineLink | null> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('shared_routine_links')
    .select('*')
    .eq('routine_id', routineId)
    .is('revoked_at', null)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function createSharedRoutineLink(
  userId: string,
  routineId: string,
): Promise<SharedRoutineLink> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('shared_routine_links')
    .insert({
      user_id: userId,
      routine_id: routineId,
      token: crypto.randomUUID(),
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function revokeSharedRoutineLink(id: string): Promise<void> {
  const client = requireSupabase()
  const { error } = await client
    .from('shared_routine_links')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export interface SharedRoutine {
  routineName: string
  steps: { title: string; orderIndex: number }[]
}

/** Chamada pública (sem login) — usa a função `get_shared_routine`, que só
 * devolve nome da rotina + títulos/ordem das etapas. */
export async function fetchSharedRoutine(
  token: string,
): Promise<SharedRoutine | null> {
  const client = requireSupabase()
  const { data, error } = await client.rpc('get_shared_routine', {
    p_token: token,
  })
  if (error) throw error
  if (!data || data.length === 0) return null
  return {
    routineName: data[0].routine_name,
    steps: data.map(
      (row: { step_title: string; step_order_index: number }) => ({
        title: row.step_title,
        orderIndex: row.step_order_index,
      }),
    ),
  }
}
