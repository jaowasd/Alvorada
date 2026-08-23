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

export interface Routine {
  id: string
  user_id: string
  name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface RoutineStep {
  id: string
  routine_id: string
  title: string
  notes: string | null
  category_id: string | null
  estimated_duration_minutes: number | null
  order_index: number
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface RoutineStepCompletion {
  id: string
  routine_step_id: string
  user_id: string
  completion_date: string
  completed_at: string
}
