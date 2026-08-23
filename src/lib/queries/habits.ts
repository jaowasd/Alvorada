import { requireSupabase } from '@/lib/supabase'
import type {
  Habit,
  HabitCompletion,
  HabitFrequencyDay,
  HabitFrequencyType,
} from '@/types/database'

export async function fetchHabits(userId: string): Promise<Habit[]> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .is('archived_at', null)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function fetchHabitFrequencyDays(
  habitIds: string[],
): Promise<HabitFrequencyDay[]> {
  if (habitIds.length === 0) return []
  const client = requireSupabase()
  const { data, error } = await client
    .from('habit_frequency_days')
    .select('*')
    .in('habit_id', habitIds)
  if (error) throw error
  return data
}

export interface HabitInput {
  name: string
  notes: string | null
  category_id: string | null
  estimated_duration_minutes: number | null
  frequency_type: HabitFrequencyType
}

async function setHabitFrequencyDays(
  habitId: string,
  weekdays: number[],
): Promise<void> {
  const client = requireSupabase()
  const { error: deleteError } = await client
    .from('habit_frequency_days')
    .delete()
    .eq('habit_id', habitId)
  if (deleteError) throw deleteError

  if (weekdays.length === 0) return

  const { error: insertError } = await client
    .from('habit_frequency_days')
    .insert(weekdays.map((weekday) => ({ habit_id: habitId, weekday })))
  if (insertError) throw insertError
}

export async function createHabit(
  userId: string,
  input: HabitInput,
  weekdays: number[],
): Promise<Habit> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('habits')
    .insert({ ...input, user_id: userId })
    .select()
    .single()
  if (error) throw error
  if (input.frequency_type === 'specific_days') {
    await setHabitFrequencyDays(data.id, weekdays)
  }
  return data
}

export async function updateHabit(
  id: string,
  input: Partial<HabitInput>,
  weekdays: number[],
): Promise<Habit> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('habits')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  await setHabitFrequencyDays(
    id,
    input.frequency_type === 'specific_days' ? weekdays : [],
  )
  return data
}

export async function archiveHabit(id: string): Promise<void> {
  const client = requireSupabase()
  const { error } = await client
    .from('habits')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function fetchHabitCompletionsForDate(
  userId: string,
  date: string,
): Promise<HabitCompletion[]> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('habit_completions')
    .select('*')
    .eq('user_id', userId)
    .eq('completion_date', date)
  if (error) throw error
  return data
}

export async function completeHabit(
  userId: string,
  habitId: string,
  date: string,
): Promise<void> {
  const client = requireSupabase()
  const { error } = await client
    .from('habit_completions')
    .insert({ user_id: userId, habit_id: habitId, completion_date: date })
  if (error) throw error
}

export async function uncompleteHabit(
  habitId: string,
  date: string,
): Promise<void> {
  const client = requireSupabase()
  const { error } = await client
    .from('habit_completions')
    .delete()
    .eq('habit_id', habitId)
    .eq('completion_date', date)
  if (error) throw error
}
