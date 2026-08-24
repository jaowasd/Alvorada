import {
  eachDayOfInterval,
  endOfWeek,
  format,
  isAfter,
  startOfWeek,
  subWeeks,
} from 'date-fns'
import { getLocalDateString } from '@/lib/date'
import { isHabitDueOnDate } from '@/lib/habits'
import type {
  Habit,
  HabitCompletion,
  RoutineStepCompletion,
  Task,
} from '@/types/database'

export interface WeeklyPoint {
  weekStart: string
  label: string
  value: number
}

interface WeekRange {
  start: Date
  end: Date
  weekStart: string
  label: string
}

function buildWeekRanges(weeksCount: number, today: Date): WeekRange[] {
  const ranges: WeekRange[] = []
  for (let i = weeksCount - 1; i >= 0; i--) {
    const start = startOfWeek(subWeeks(today, i), { weekStartsOn: 0 })
    const end = endOfWeek(start, { weekStartsOn: 0 })
    ranges.push({
      start,
      end,
      weekStart: getLocalDateString(start),
      label: format(start, 'dd/MM'),
    })
  }
  return ranges
}

/** Dias da semana já "encerrados" (até hoje) — semanas futuras não existem, a atual é cortada em hoje. */
function daysInRangeUpToToday(range: WeekRange, today: Date): Date[] {
  const cappedEnd = isAfter(range.end, today) ? today : range.end
  if (isAfter(range.start, cappedEnd)) return []
  return eachDayOfInterval({ start: range.start, end: cappedEnd })
}

/** % de hábitos devidos concluídos, por semana (últimas `weeksCount` semanas, incluindo a atual). */
export function computeHabitConsistencyByWeek(
  habits: Habit[],
  habitWeekdaysByHabit: Map<string, number[]>,
  habitCompletions: HabitCompletion[],
  weeksCount = 8,
  today: Date = new Date(),
): WeeklyPoint[] {
  const completedByHabitAndDate = new Set(
    habitCompletions.map((c) => `${c.habit_id}|${c.completion_date}`),
  )
  const ranges = buildWeekRanges(weeksCount, today)

  return ranges.map((range) => {
    const days = daysInRangeUpToToday(range, today)
    let due = 0
    let completed = 0
    for (const day of days) {
      const dateStr = getLocalDateString(day)
      for (const habit of habits) {
        if (
          !isHabitDueOnDate(
            habit,
            habitWeekdaysByHabit.get(habit.id) ?? [],
            day,
          )
        ) {
          continue
        }
        due++
        if (completedByHabitAndDate.has(`${habit.id}|${dateStr}`)) completed++
      }
    }
    return {
      weekStart: range.weekStart,
      label: range.label,
      value: due === 0 ? 0 : Math.round((completed / due) * 100),
    }
  })
}

/** Média diária de % de etapas da rotina concluídas, por semana. */
export function computeRoutineCompletionByWeek(
  totalSteps: number,
  routineCompletions: RoutineStepCompletion[],
  weeksCount = 8,
  today: Date = new Date(),
): WeeklyPoint[] {
  const ranges = buildWeekRanges(weeksCount, today)
  if (totalSteps === 0) {
    return ranges.map((range) => ({
      weekStart: range.weekStart,
      label: range.label,
      value: 0,
    }))
  }

  const completedStepsByDate = new Map<string, Set<string>>()
  for (const completion of routineCompletions) {
    const set =
      completedStepsByDate.get(completion.completion_date) ?? new Set<string>()
    set.add(completion.routine_step_id)
    completedStepsByDate.set(completion.completion_date, set)
  }

  return ranges.map((range) => {
    const days = daysInRangeUpToToday(range, today)
    if (days.length === 0) {
      return { weekStart: range.weekStart, label: range.label, value: 0 }
    }
    const dailyPercents = days.map((day) => {
      const dateStr = getLocalDateString(day)
      const completedCount = Math.min(
        completedStepsByDate.get(dateStr)?.size ?? 0,
        totalSteps,
      )
      return (completedCount / totalSteps) * 100
    })
    const average =
      dailyPercents.reduce((sum, percent) => sum + percent, 0) /
      dailyPercents.length
    return {
      weekStart: range.weekStart,
      label: range.label,
      value: Math.round(average),
    }
  })
}

/** Tarefas concluídas por semana (com base em `completed_at`, não na data de vencimento). */
export function computeTasksCompletedByWeek(
  tasks: Task[],
  weeksCount = 8,
  today: Date = new Date(),
): WeeklyPoint[] {
  const ranges = buildWeekRanges(weeksCount, today)
  return ranges.map((range) => {
    const count = tasks.filter((task) => {
      if (!task.completed_at) return false
      const completedDate = new Date(task.completed_at)
      return completedDate >= range.start && completedDate <= range.end
    }).length
    return { weekStart: range.weekStart, label: range.label, value: count }
  })
}
