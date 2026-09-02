import { requireSupabase } from '@/lib/supabase'
import type { StudyExamKind, StudyExamRecord } from '@/types/database'

export interface StudyExamRecordInput {
  subject_id: string | null
  title: string
  kind: StudyExamKind
  exam_date: string
  correct_count: number
  total_questions: number
  notes: string | null
}

export async function fetchStudyExamRecords(
  userId: string,
): Promise<StudyExamRecord[]> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('study_exam_records')
    .select('*')
    .eq('user_id', userId)
    .order('exam_date', { ascending: false })
  if (error) throw error
  return data
}

export async function createStudyExamRecord(
  userId: string,
  input: StudyExamRecordInput,
): Promise<StudyExamRecord> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('study_exam_records')
    .insert({ ...input, user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateStudyExamRecord(
  id: string,
  input: StudyExamRecordInput,
): Promise<StudyExamRecord> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('study_exam_records')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteStudyExamRecord(id: string): Promise<void> {
  const client = requireSupabase()
  const { error } = await client
    .from('study_exam_records')
    .delete()
    .eq('id', id)
  if (error) throw error
}
