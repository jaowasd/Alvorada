import { computeExpiresAt } from '@/lib/date'
import { requireSupabase } from '@/lib/supabase'
import type { IcsExportToken } from '@/types/database'

export async function fetchIcsExportToken(
  userId: string,
): Promise<IcsExportToken | null> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('ics_export_tokens')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

/** Gera (ou substitui, se já existir) o token de exportação do usuário. */
export async function generateIcsExportToken(
  userId: string,
  expiresInDays: number | null = null,
): Promise<IcsExportToken> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('ics_export_tokens')
    .upsert(
      {
        user_id: userId,
        token: crypto.randomUUID(),
        expires_at: computeExpiresAt(expiresInDays),
      },
      { onConflict: 'user_id' },
    )
    .select()
    .single()
  if (error) throw error
  return data
}

export async function revokeIcsExportToken(userId: string): Promise<void> {
  const client = requireSupabase()
  const { error } = await client
    .from('ics_export_tokens')
    .delete()
    .eq('user_id', userId)
  if (error) throw error
}
