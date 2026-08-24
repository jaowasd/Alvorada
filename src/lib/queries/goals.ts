import { requireSupabase } from '@/lib/supabase'
import type { Goal, GoalProgressEntry, GoalStatus } from '@/types/database'

export interface GoalInput {
  name: string
  target_value: number | null
  unit: string | null
  deadline_date: string | null
}

export async function fetchGoals(userId: string): Promise<Goal[]> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function fetchAllProgressEntries(
  userId: string,
): Promise<GoalProgressEntry[]> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('goal_progress_entries')
    .select('*')
    .eq('user_id', userId)
  if (error) throw error
  return data
}

export async function createGoal(
  userId: string,
  input: GoalInput,
): Promise<Goal> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('goals')
    .insert({ ...input, user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateGoal(id: string, input: GoalInput): Promise<Goal> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('goals')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function setGoalStatus(
  id: string,
  status: GoalStatus,
): Promise<Goal> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('goals')
    .update({ status })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteGoal(id: string): Promise<void> {
  const client = requireSupabase()
  const { error } = await client.from('goals').delete().eq('id', id)
  if (error) throw error
}

export interface ProgressEntryInput {
  amount: number
  entry_date: string
  notes: string | null
}

export async function addProgressEntry(
  userId: string,
  goalId: string,
  input: ProgressEntryInput,
): Promise<GoalProgressEntry> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('goal_progress_entries')
    .insert({ ...input, user_id: userId, goal_id: goalId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteProgressEntry(id: string): Promise<void> {
  const client = requireSupabase()
  const { error } = await client
    .from('goal_progress_entries')
    .delete()
    .eq('id', id)
  if (error) throw error
}
