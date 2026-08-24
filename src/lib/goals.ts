import type { Goal, GoalProgressEntry } from '@/types/database'

export interface GoalProgress {
  current: number
  /** null para metas booleanas (sem target_value) — não há % de progresso. */
  percent: number | null
}

/** Progresso = soma dos lançamentos da meta. Nunca guardado, sempre recalculado. */
export function computeGoalProgress(
  goal: Goal,
  entries: GoalProgressEntry[],
): GoalProgress {
  const current = entries
    .filter((entry) => entry.goal_id === goal.id)
    .reduce((sum, entry) => sum + entry.amount, 0)

  const percent =
    goal.target_value && goal.target_value > 0
      ? Math.min(100, Math.round((current / goal.target_value) * 100))
      : null

  return { current, percent }
}
