import { requireSupabase } from '@/lib/supabase'
import type { StudySubject } from '@/types/database'

export interface StudySubjectInput {
  name: string
  color: string
  weekly_goal_minutes: number | null
}

/**
 * Traz ativas e arquivadas numa consulta só. As páginas filtram no cliente:
 * elas precisam das arquivadas de qualquer jeito (para rotular sessões e
 * provas antigas), e uma query só significa uma entrada de cache
 * compartilhada entre as quatro páginas de Estudos.
 */
export async function fetchAllStudySubjects(
  userId: string,
): Promise<StudySubject[]> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('study_subjects')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true })
  if (error) throw error
  return data
}

export async function createStudySubject(
  userId: string,
  input: StudySubjectInput,
): Promise<StudySubject> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('study_subjects')
    .insert({ ...input, user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateStudySubject(
  id: string,
  input: StudySubjectInput,
): Promise<StudySubject> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('study_subjects')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function archiveStudySubject(id: string): Promise<StudySubject> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('study_subjects')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function unarchiveStudySubject(id: string): Promise<StudySubject> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('study_subjects')
    .update({ archived_at: null })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * DELETE real. Seguro porque focus_sessions.subject_id e
 * study_exam_records.subject_id são `on delete set null` (0024) — o histórico
 * sobrevive como "Sem matéria". A UI só oferece isso quando a matéria não tem
 * nenhum registro; com histórico ela oferece arquivar.
 */
export async function deleteStudySubject(id: string): Promise<void> {
  const client = requireSupabase()
  const { error } = await client.from('study_subjects').delete().eq('id', id)
  if (error) throw error
}
