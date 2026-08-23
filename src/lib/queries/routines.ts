import { requireSupabase } from '@/lib/supabase'
import type {
  Routine,
  RoutineStep,
  RoutineStepCompletion,
} from '@/types/database'

export async function fetchOrCreateActiveRoutine(
  userId: string,
): Promise<Routine> {
  const client = requireSupabase()
  const { data: existing, error: selectError } = await client
    .from('routines')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (selectError) throw selectError
  if (existing) return existing

  const { data: created, error: insertError } = await client
    .from('routines')
    .insert({ user_id: userId, name: 'Minha rotina matinal' })
    .select()
    .single()
  if (insertError) throw insertError
  return created
}

export async function fetchRoutineSteps(
  routineId: string,
): Promise<RoutineStep[]> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('routine_steps')
    .select('*')
    .eq('routine_id', routineId)
    .is('deleted_at', null)
    .order('order_index', { ascending: true })
  if (error) throw error
  return data
}

export interface RoutineStepInput {
  title: string
  notes: string | null
  category_id: string | null
  estimated_duration_minutes: number | null
}

export async function createRoutineStep(
  routineId: string,
  input: RoutineStepInput,
  orderIndex: number,
): Promise<RoutineStep> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('routine_steps')
    .insert({ ...input, routine_id: routineId, order_index: orderIndex })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateRoutineStep(
  id: string,
  input: Partial<RoutineStepInput>,
): Promise<RoutineStep> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('routine_steps')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function softDeleteRoutineStep(id: string): Promise<void> {
  const client = requireSupabase()
  const { error } = await client
    .from('routine_steps')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function reorderRoutineSteps(
  steps: { id: string; order_index: number }[],
): Promise<void> {
  const client = requireSupabase()
  const results = await Promise.all(
    steps.map((step) =>
      client
        .from('routine_steps')
        .update({ order_index: step.order_index })
        .eq('id', step.id),
    ),
  )
  const firstError = results.find((result) => result.error)?.error
  if (firstError) throw firstError
}

export async function fetchCompletionsForDate(
  userId: string,
  date: string,
): Promise<RoutineStepCompletion[]> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('routine_step_completions')
    .select('*')
    .eq('user_id', userId)
    .eq('completion_date', date)
  if (error) throw error
  return data
}

export async function completeRoutineStep(
  userId: string,
  routineStepId: string,
  date: string,
): Promise<void> {
  const client = requireSupabase()
  const { error } = await client.from('routine_step_completions').insert({
    user_id: userId,
    routine_step_id: routineStepId,
    completion_date: date,
  })
  if (error) throw error
}

export async function uncompleteRoutineStep(
  routineStepId: string,
  date: string,
): Promise<void> {
  const client = requireSupabase()
  const { error } = await client
    .from('routine_step_completions')
    .delete()
    .eq('routine_step_id', routineStepId)
    .eq('completion_date', date)
  if (error) throw error
}
