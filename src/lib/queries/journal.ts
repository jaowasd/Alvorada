import { requireSupabase } from '@/lib/supabase'
import type { JournalEntry, JournalMood } from '@/types/database'

export async function fetchAllJournalEntries(
  userId: string,
): Promise<JournalEntry[]> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
  if (error) throw error
  return data
}

export async function fetchJournalEntryForDate(
  userId: string,
  date: string,
): Promise<JournalEntry | null> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('entry_date', date)
    .maybeSingle()
  if (error) throw error
  return data
}

export interface JournalEntryInput {
  mood: JournalMood
  notes: string | null
}

export async function upsertJournalEntry(
  userId: string,
  date: string,
  input: JournalEntryInput,
): Promise<JournalEntry> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('journal_entries')
    .upsert(
      { user_id: userId, entry_date: date, ...input },
      { onConflict: 'user_id,entry_date' },
    )
    .select()
    .single()
  if (error) throw error
  return data
}
