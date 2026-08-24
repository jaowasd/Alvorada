import { requireSupabase } from '@/lib/supabase'
import type { Reminder } from '@/types/database'

export async function fetchActiveReminders(
  userId: string,
): Promise<Reminder[]> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('reminders')
    .select('*')
    .eq('user_id', userId)
    .eq('is_dismissed', false)
    .order('remind_at', { ascending: true })
  if (error) throw error
  return data
}

export interface CustomReminderInput {
  custom_label: string
  remind_at: string
  message: string | null
}

export async function createCustomReminder(
  userId: string,
  input: CustomReminderInput,
): Promise<Reminder> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('reminders')
    .insert({ user_id: userId, ...input })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function dismissReminder(id: string): Promise<Reminder> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('reminders')
    .update({ is_dismissed: true, dismissed_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}
