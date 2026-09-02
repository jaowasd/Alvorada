import { requireSupabase } from '@/lib/supabase'
import type { StudySettings } from '@/types/database'

export interface StudySettingsInput {
  weekly_goal_minutes: number | null
  exam_date: string | null
}

/**
 * A linha nasce sob demanda (mesmo padrão de fetchOrCreateActiveRoutine), e
 * não num trigger de cadastro: 0024 deliberadamente não mexe em
 * handle_new_user, então isso também cobre contas criadas antes da migration.
 */
export async function fetchOrCreateStudySettings(
  userId: string,
): Promise<StudySettings> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('study_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  if (data) return data

  const { data: created, error: insertError } = await client
    .from('study_settings')
    .insert({ user_id: userId })
    .select()
    .single()
  if (insertError) throw insertError
  return created
}

export async function updateStudySettings(
  userId: string,
  input: StudySettingsInput,
): Promise<StudySettings> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('study_settings')
    .update(input)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}
