import { requireSupabase } from '@/lib/supabase'
import type { Category } from '@/types/database'

export async function fetchCategories(): Promise<Category[]> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('categories')
    .select('*')
    .order('name')
  if (error) throw error
  return data
}
