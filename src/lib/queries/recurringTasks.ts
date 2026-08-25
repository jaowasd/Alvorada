import { computeMissingOccurrences } from '@/lib/recurrence'
import { getLocalDateString } from '@/lib/date'
import { requireSupabase } from '@/lib/supabase'
import type { RecurringTask, RecurringTaskFrequency } from '@/types/database'

export interface RecurringTaskInput {
  title: string
  notes: string | null
  category_id: string | null
  estimated_duration_minutes: number | null
  frequency: RecurringTaskFrequency
  day_of_month: number | null
  weekday: number | null
  start_date: string
  end_date: string | null
}

export async function fetchRecurringTasks(
  userId: string,
): Promise<RecurringTask[]> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('recurring_tasks')
    .select('*')
    .eq('user_id', userId)
    .is('archived_at', null)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createRecurringTask(
  userId: string,
  input: RecurringTaskInput,
): Promise<RecurringTask> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('recurring_tasks')
    .insert({ ...input, user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateRecurringTask(
  id: string,
  input: Partial<RecurringTaskInput>,
): Promise<RecurringTask> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('recurring_tasks')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function setRecurringTaskActive(
  id: string,
  isActive: boolean,
): Promise<RecurringTask> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('recurring_tasks')
    .update({ is_active: isActive })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function archiveRecurringTask(id: string): Promise<void> {
  const client = requireSupabase()
  const { error } = await client
    .from('recurring_tasks')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

/**
 * Gera as tarefas faltantes de todos os templates ativos do usuário, mesmo
 * espírito de generateMissingRecurringInstances (financas/recurring.ts).
 */
export async function generateMissingRecurringTasks(
  userId: string,
): Promise<void> {
  const client = requireSupabase()
  const today = getLocalDateString()

  const { data: templates, error } = await client
    .from('recurring_tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .is('archived_at', null)
  if (error) throw error

  for (const template of templates ?? []) {
    const dueDates = computeMissingOccurrences(
      {
        frequency: template.frequency,
        dayOfMonth: template.day_of_month,
        weekday: template.weekday,
        startDate: template.start_date,
        endDate: template.end_date,
        lastGeneratedDate: template.last_generated_date,
      },
      today,
    )
    if (dueDates.length === 0) continue

    const rows = dueDates.map((dueDate) => ({
      user_id: userId,
      title: template.title,
      notes: template.notes,
      category_id: template.category_id,
      estimated_duration_minutes: template.estimated_duration_minutes,
      due_date: dueDate,
      recurring_task_id: template.id,
    }))
    const { error: insertError } = await client.from('tasks').insert(rows)
    if (insertError) throw insertError

    const { error: updateError } = await client
      .from('recurring_tasks')
      .update({ last_generated_date: dueDates[dueDates.length - 1] })
      .eq('id', template.id)
    if (updateError) throw updateError
  }
}
