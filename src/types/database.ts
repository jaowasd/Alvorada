export interface Category {
  id: string
  user_id: string | null
  name: string
  icon: string
  color: string
  is_system: boolean
  created_at: string
}

export interface Task {
  id: string
  user_id: string
  title: string
  notes: string | null
  category_id: string | null
  estimated_duration_minutes: number | null
  due_date: string | null
  is_completed: boolean
  completed_at: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}
