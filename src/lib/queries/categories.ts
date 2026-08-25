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

export interface CategoryInput {
  name: string
  icon: string
  color: string
}

export async function createCategory(
  userId: string,
  input: CategoryInput,
): Promise<Category> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('categories')
    .insert({ ...input, user_id: userId, is_system: false })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateCategory(
  id: string,
  input: Partial<CategoryInput>,
): Promise<Category> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('categories')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteCategory(id: string): Promise<void> {
  const client = requireSupabase()
  const { error } = await client.from('categories').delete().eq('id', id)
  if (error) throw error
}
