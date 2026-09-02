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
import { fetchGoals, fetchAllProgressEntries } from '@/lib/queries/goals'
import { fetchAllJournalEntries } from '@/lib/queries/journal'
import { fetchFocusSessions } from '@/lib/queries/focusSessions'
import { fetchAllStudySubjects } from '@/lib/queries/studySubjects'
import { fetchStudyExamRecords } from '@/lib/queries/studyExamRecords'
import { fetchFinanceAccounts } from '@/lib/queries/financas/accounts'
import { fetchFinanceCategories } from '@/lib/queries/financas/categories'
import { fetchRecurringTransactions } from '@/lib/queries/financas/recurring'
import { fetchTransactions } from '@/lib/queries/financas/transactions'

/**
 * Junta todos os dados do usuário num único objeto exportável. A lista cobre
 * cada tabela que guarda conteúdo criado por ele — uma exportação parcial não
 * cumpre o propósito (portabilidade), então tabela nova entra aqui também.
 */
export async function buildUserDataExport(userId: string) {
  const [
    profile,
    tasks,
    habits,
    habitCompletions,
    routine,
    goals,
    goalProgressEntries,
    journalEntries,
    focusSessions,
    studySubjects,
    studyExamRecords,
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
    fetchGoals(userId),
    fetchAllProgressEntries(userId),
    fetchAllJournalEntries(userId),
    fetchFocusSessions(userId),
    fetchAllStudySubjects(userId),
    fetchStudyExamRecords(userId),
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
    goals,
    goal_progress_entries: goalProgressEntries,
    journal_entries: journalEntries,
    focus_sessions: focusSessions,
    study_subjects: studySubjects,
    study_exam_records: studyExamRecords,
    finance_accounts: financeAccounts,
    finance_categories: financeCategories.filter(
      (category) => !category.is_system,
    ),
    finance_transactions: financeTransactions,
    finance_recurring_transactions: financeRecurring,
  }
}

/** Dispara o download de um conteúdo de texto como arquivo no navegador. */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/** Dispara o download de um objeto como arquivo .json no navegador. */
export function downloadJson(data: unknown, filename: string): void {
  downloadFile(JSON.stringify(data, null, 2), filename, 'application/json')
}
