import { addDays, format, parseISO } from 'date-fns'
import type { HabitFrequencyType } from '@/types/database'

export interface StreakStats {
  currentStreak: number
  bestStreak: number
}

function addOneDay(dateStr: string): string {
  return format(addDays(parseISO(dateStr), 1), 'yyyy-MM-dd')
}

/**
 * Varre do primeiro dia concluído até hoje, pulando dias não devidos.
 * Um dia devido sem conclusão quebra a sequência — exceto hoje, que ainda
 * não "terminou" e por isso não zera o streak enquanto o dia não passar.
 */
function scanStreak(
  completedSet: Set<string>,
  isDue: (date: string) => boolean,
  today: string,
): StreakStats {
  if (completedSet.size === 0) return { currentStreak: 0, bestStreak: 0 }

  const sorted = [...completedSet].sort()
  let cursor = sorted[0]
  let running = 0
  let best = 0

  while (cursor <= today) {
    if (isDue(cursor)) {
      if (completedSet.has(cursor)) {
        running++
        best = Math.max(best, running)
      } else if (cursor !== today) {
        running = 0
      }
    }
    cursor = addOneDay(cursor)
  }

  return { currentStreak: running, bestStreak: best }
}

/** Streak de um hábito: dias não programados (frequência específica) não contam nem quebram. */
export function calculateHabitStreak(
  completionDates: string[],
  frequencyType: HabitFrequencyType,
  weekdays: number[],
  today: string,
): StreakStats {
  const completedSet = new Set(completionDates)
  const isDue = (dateStr: string) =>
    frequencyType === 'daily' || weekdays.includes(parseISO(dateStr).getDay())
  return scanStreak(completedSet, isDue, today)
}

/**
 * Streak de qualquer coisa devida todo dia: só as datas concluídas importam,
 * nenhum dia é "não programado".
 */
export function calculateDailyStreak(
  completedDates: string[],
  today: string,
): StreakStats {
  return scanStreak(new Set(completedDates), () => true, today)
}

/** Streak da rotina matinal: conta os dias em que TODAS as etapas atuais foram concluídas. */
export function calculateRoutineStreak(
  fullyCompletedDates: string[],
  today: string,
): StreakStats {
  return calculateDailyStreak(fullyCompletedDates, today)
}

/**
 * Datas em que o número de etapas concluídas bateu com o total de etapas
 * atuais da rotina (simplificação: usa a composição atual da rotina, não
 * a que existia historicamente em cada data).
 */
export function getFullyCompletedRoutineDates(
  completions: { routine_step_id: string; completion_date: string }[],
  totalSteps: number,
): string[] {
  if (totalSteps === 0) return []

  const stepIdsByDate = new Map<string, Set<string>>()
  for (const completion of completions) {
    const set =
      stepIdsByDate.get(completion.completion_date) ?? new Set<string>()
    set.add(completion.routine_step_id)
    stepIdsByDate.set(completion.completion_date, set)
  }

  const fullyCompleted: string[] = []
  for (const [date, stepIds] of stepIdsByDate) {
    if (stepIds.size >= totalSteps) fullyCompleted.push(date)
  }
  return fullyCompleted
}
