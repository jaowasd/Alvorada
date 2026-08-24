import {
  fetchHabitFrequencyDays,
  fetchAllHabitCompletions,
  fetchHabits,
} from '@/lib/queries/habits'
import { fetchProfile } from '@/lib/queries/profile'
import {
  fetchAllCompletions,
  fetchOrCreateActiveRoutine,
  fetchRoutineSteps,
} from '@/lib/queries/routines'
import { fetchTasks } from '@/lib/queries/tasks'
import { fetchFinanceAccounts } from '@/lib/queries/financas/accounts'
import { fetchFinanceCategories } from '@/lib/queries/financas/categories'
import { fetchRecurringTransactions } from '@/lib/queries/financas/recurring'
import { fetchTransactions } from '@/lib/queries/financas/transactions'

/** Junta todos os dados do usuário (perfil, rotina, hábitos, tarefas, finanças) num único objeto exportável. */
export async function buildUserDataExport(userId: string) {
  const [
    profile,
    tasks,
    habits,
    habitCompletions,
    routine,
    financeAccounts,
    financeCategories,
    financeTransactions,
    financeRecurring,
  ] = await Promise.all([
    fetchProfile(userId),
    fetchTasks(userId),
    fetchHabits(userId),
    fetchAllHabitCompletions(userId),
    fetchOrCreateActiveRoutine(userId),
    fetchFinanceAccounts(userId),
    fetchFinanceCategories(),
    fetchTransactions(userId),
    fetchRecurringTransactions(userId),
  ])

  const [habitFrequencyDays, routineSteps, routineCompletions] =
    await Promise.all([
      fetchHabitFrequencyDays(habits.map((habit) => habit.id)),
      fetchRoutineSteps(routine.id),
      fetchAllCompletions(userId),
    ])

  return {
    exported_at: new Date().toISOString(),
    profile,
    tasks,
    habits,
    habit_frequency_days: habitFrequencyDays,
    habit_completions: habitCompletions,
    routine,
    routine_steps: routineSteps,
    routine_completions: routineCompletions,
    finance_accounts: financeAccounts,
    finance_categories: financeCategories.filter(
      (category) => !category.is_system,
    ),
    finance_transactions: financeTransactions,
    finance_recurring_transactions: financeRecurring,
  }
}

/** Dispara o download de um objeto como arquivo .json no navegador. */
export function downloadJson(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
