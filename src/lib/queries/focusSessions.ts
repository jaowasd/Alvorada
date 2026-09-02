import { requireSupabase } from '@/lib/supabase'
import { focusSessionInputSchema } from '@/lib/validation/focusSession'
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

/**
 * Sessão cronometrada que ficou pendente (completed_at nulo), usada para
 * retomar o cronômetro depois de navegar entre as páginas de Estudos.
 */
export async function fetchActiveFocusSession(
  userId: string,
): Promise<FocusSession | null> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('focus_sessions')
    .select('*')
    .eq('user_id', userId)
    .is('completed_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
}

export interface FocusSessionInput {
  task_id: string | null
  subject_id: string | null
  label: string | null
  duration_minutes: number
}

export async function startFocusSession(
  userId: string,
  input: FocusSessionInput,
): Promise<FocusSession> {
  const validated = focusSessionInputSchema.parse(input)
  const client = requireSupabase()
  const { data, error } = await client
    .from('focus_sessions')
    .insert({ ...validated, user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Registro manual de uma sessão que já aconteceu: entra no banco já
 * concluída, com started_at/completed_at explícitos em vez do default now().
 */
export async function logFocusSession(
  userId: string,
  input: FocusSessionInput,
  startedAt: string,
  completedAt: string,
): Promise<FocusSession> {
  const validated = focusSessionInputSchema.parse(input)
  const client = requireSupabase()
  const { data, error } = await client
    .from('focus_sessions')
    .insert({
      ...validated,
      user_id: userId,
      started_at: startedAt,
      completed_at: completedAt,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateFocusSession(
  id: string,
  input: FocusSessionInput,
  startedAt: string,
  completedAt: string,
): Promise<FocusSession> {
  const validated = focusSessionInputSchema.parse(input)
  const client = requireSupabase()
  const { data, error } = await client
    .from('focus_sessions')
    .update({
      ...validated,
      started_at: startedAt,
      completed_at: completedAt,
    })
    .eq('id', id)
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

/**
 * Parada antecipada creditando o tempo já cumprido. Sem isso, quem estuda 40
 * dos 45 minutos e para fica com uma sessão interrompida valendo 0 minuto.
 */
export async function stopFocusSession(
  id: string,
  actualMinutes: number,
): Promise<FocusSession> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('focus_sessions')
    .update({
      duration_minutes: actualMinutes,
      completed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteFocusSession(id: string): Promise<void> {
  const client = requireSupabase()
  const { error } = await client.from('focus_sessions').delete().eq('id', id)
  if (error) throw error
}
