export type ThemePreference = 'light' | 'dark' | 'system'
export type PlanTier = 'free' | 'premium'

export interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  timezone: string
  wake_time_target: string | null
  theme_preference: ThemePreference
  onboarding_completed_at: string | null
  plan: PlanTier
  plan_updated_at: string | null
  created_at: string
  updated_at: string
}

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

export type HabitFrequencyType = 'daily' | 'specific_days'

export interface Habit {
  id: string
  user_id: string
  name: string
  notes: string | null
  category_id: string | null
  estimated_duration_minutes: number | null
  frequency_type: HabitFrequencyType
  archived_at: string | null
  created_at: string
  updated_at: string
}

export interface HabitFrequencyDay {
  id: string
  habit_id: string
  weekday: number
}

export interface HabitCompletion {
  id: string
  habit_id: string
  user_id: string
  completion_date: string
  completed_at: string
}

export type FinanceTransactionType = 'income' | 'expense' | 'transfer'
export type FinanceTransactionStatus = 'planned' | 'confirmed'
export type FinancePaymentMethod =
  | 'pix'
  | 'boleto'
  | 'debit_card'
  | 'credit_card'
  | 'cash'
  | 'bank_transfer'
  | 'other'
export type FinanceCategoryKind = 'income' | 'expense'
export type FinanceAccountType =
  'checking' | 'savings' | 'wallet' | 'cash' | 'investment' | 'other'
export type FinanceRecurringFrequency = 'monthly' | 'weekly'

export interface FinanceSettings {
  user_id: string
  currency: string
  monthly_income_cents: number | null
  created_at: string
  updated_at: string
}

export interface FinanceCategory {
  id: string
  user_id: string | null
  name: string
  kind: FinanceCategoryKind
  parent_category_id: string | null
  icon: string
  color: string
  is_system: boolean
  archived_at: string | null
  created_at: string
  updated_at: string
}

export interface FinanceAccount {
  id: string
  user_id: string
  name: string
  type: FinanceAccountType
  initial_balance_cents: number
  include_in_total: boolean
  icon: string
  color: string
  archived_at: string | null
  created_at: string
  updated_at: string
}

export interface FinanceTransaction {
  id: string
  user_id: string
  type: FinanceTransactionType
  description: string
  amount_cents: number
  category_id: string | null
  account_id: string
  related_account_id: string | null
  payment_method: FinancePaymentMethod | null
  status: FinanceTransactionStatus
  due_date: string
  paid_at: string | null
  notes: string | null
  recurring_transaction_id: string | null
  reversal_of_transaction_id: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export type JournalMood = 'otimo' | 'bom' | 'neutro' | 'dificil' | 'pesado'

export interface JournalEntry {
  id: string
  user_id: string
  entry_date: string
  mood: JournalMood
  notes: string | null
  created_at: string
  updated_at: string
}

export type GoalStatus = 'active' | 'completed' | 'archived'

export interface Goal {
  id: string
  user_id: string
  name: string
  target_value: number | null
  unit: string | null
  deadline_date: string | null
  status: GoalStatus
  created_at: string
  updated_at: string
}

export interface GoalProgressEntry {
  id: string
  goal_id: string
  user_id: string
  amount: number
  entry_date: string
  notes: string | null
  created_at: string
}

export interface IcsExportToken {
  id: string
  user_id: string
  token: string
  created_at: string
}

export interface SharedRoutineLink {
  id: string
  routine_id: string
  user_id: string
  token: string
  created_at: string
  revoked_at: string | null
}

export interface FocusSession {
  id: string
  user_id: string
  task_id: string | null
  label: string | null
  duration_minutes: number
  started_at: string
  completed_at: string | null
}

export interface Reminder {
  id: string
  user_id: string
  task_id: string | null
  habit_id: string | null
  routine_step_id: string | null
  finance_transaction_id: string | null
  custom_label: string | null
  remind_at: string
  message: string | null
  is_dismissed: boolean
  dismissed_at: string | null
  created_at: string
  updated_at: string
}

export interface FinanceBudget {
  id: string
  user_id: string
  category_id: string
  limit_cents: number
  archived_at: string | null
  created_at: string
  updated_at: string
}

export interface FinanceRecurringTransaction {
  id: string
  user_id: string
  type: Exclude<FinanceTransactionType, 'transfer'>
  description: string
  amount_cents: number
  is_variable_amount: boolean
  category_id: string | null
  account_id: string
  frequency: FinanceRecurringFrequency
  day_of_month: number | null
  weekday: number | null
  start_date: string
  end_date: string | null
  last_generated_date: string | null
  is_active: boolean
  archived_at: string | null
  created_at: string
  updated_at: string
}
