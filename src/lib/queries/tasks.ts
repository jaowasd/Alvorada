import { requireSupabase } from '@/lib/supabase'
import type { Task } from '@/types/database'

export interface TaskInput {
  title: string
  notes: string | null
  category_id: string | null
  estimated_duration_minutes: number | null
  due_date: string | null
}

export async function fetchTasks(userId: string): Promise<Task[]> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createTask(
  userId: string,
  input: TaskInput,
): Promise<Task> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('tasks')
    .insert({ ...input, user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateTask(
  id: string,
  input: Partial<TaskInput>,
): Promise<Task> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('tasks')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function setTaskCompleted(
  id: string,
  isCompleted: boolean,
): Promise<Task> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('tasks')
    .update({
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function softDeleteTask(id: string): Promise<void> {
  const client = requireSupabase()
  const { error } = await client
    .from('tasks')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}
