import {
  addDays,
  addMonths,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { getLocalDateString } from '@/lib/date'
import { isHabitDueOnDate } from '@/lib/habits'
import type {
  Habit,
  HabitCompletion,
  RoutineStepCompletion,
} from '@/types/database'

export interface CalendarDay {
  date: string
  inCurrentMonth: boolean
  isToday: boolean
}

/** Grade de 42 dias (6 semanas, domingo a sábado) cobrindo o mês, com dias de preenchimento do mês anterior/seguinte. */
export function buildCalendarGrid(
  monthDate: Date,
  todayStr: string = getLocalDateString(),
): CalendarDay[] {
  const start = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 0 })
  const days: CalendarDay[] = []
  for (let i = 0; i < 42; i++) {
    const day = addDays(start, i)
    const dateStr = getLocalDateString(day)
    days.push({
      date: dateStr,
      inCurrentMonth: day.getMonth() === monthDate.getMonth(),
      isToday: dateStr === todayStr,
    })
  }
  return days
}

export function shiftMonth(monthDate: Date, deltaMonths: number): Date {
  return deltaMonths >= 0
    ? addMonths(monthDate, deltaMonths)
    : subMonths(monthDate, -deltaMonths)
}

/**
 * % de conclusão do dia = (etapas de rotina + hábitos devidos concluídos) / (etapas + hábitos devidos).
 * Mesma soma combinada usada no dashboard "Meu dia". `null` = nada programado nesse dia.
 */
export function computeDayCompletionPercent(
  date: string,
  totalSteps: number,
  routineCompletions: RoutineStepCompletion[],
  habits: Habit[],
  habitWeekdaysByHabit: Map<string, number[]>,
  habitCompletions: HabitCompletion[],
): number | null {
  const dateObj = new Date(`${date}T00:00:00`)

  const completedStepIds = new Set(
    routineCompletions
      .filter((c) => c.completion_date === date)
      .map((c) => c.routine_step_id),
  )

  const dueHabits = habits.filter((h) =>
    isHabitDueOnDate(h, habitWeekdaysByHabit.get(h.id) ?? [], dateObj),
  )
  const completedHabitIds = new Set(
    habitCompletions
      .filter((c) => c.completion_date === date)
      .map((c) => c.habit_id),
  )
  const completedHabitsCount = dueHabits.filter((h) =>
    completedHabitIds.has(h.id),
  ).length

  const totalDue = totalSteps + dueHabits.length
  if (totalDue === 0) return null

  const totalCompleted =
    Math.min(completedStepIds.size, totalSteps) + completedHabitsCount
  return Math.round((totalCompleted / totalDue) * 100)
}

/** % de conclusão por dia num intervalo, pra alimentar o mapa de consistência. */
export function buildConsistencyMap(
  startDate: string,
  endDate: string,
  totalSteps: number,
  routineCompletions: RoutineStepCompletion[],
  habits: Habit[],
  habitWeekdaysByHabit: Map<string, number[]>,
  habitCompletions: HabitCompletion[],
): Map<string, number | null> {
  const map = new Map<string, number | null>()
  let cursor = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${endDate}T00:00:00`)
  while (cursor <= end) {
    const dateStr = getLocalDateString(cursor)
    map.set(
      dateStr,
      computeDayCompletionPercent(
        dateStr,
        totalSteps,
        routineCompletions,
        habits,
        habitWeekdaysByHabit,
        habitCompletions,
      ),
    )
    cursor = addDays(cursor, 1)
  }
  return map
}
