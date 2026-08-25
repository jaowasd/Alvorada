import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  startOfMonth,
  startOfWeek,
  subMonths,
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

export interface HabitBreakdownPoint {
  habitId: string
  name: string
  percent: number
}

/** % de consistência por hábito individual (não agregado), últimas `weeksCount` semanas. */
export function computeHabitBreakdown(
  habits: Habit[],
  habitWeekdaysByHabit: Map<string, number[]>,
  habitCompletions: HabitCompletion[],
  weeksCount = 8,
  today: Date = new Date(),
): HabitBreakdownPoint[] {
  const completedSet = new Set(
    habitCompletions.map((c) => `${c.habit_id}|${c.completion_date}`),
  )
  const start = startOfWeek(subWeeks(today, weeksCount - 1), {
    weekStartsOn: 0,
  })
  const days = eachDayOfInterval({ start, end: today })
  return habits.map((habit) => {
    let due = 0
    let completed = 0
    for (const day of days) {
      if (
        !isHabitDueOnDate(habit, habitWeekdaysByHabit.get(habit.id) ?? [], day)
      ) {
        continue
      }
      due++
      if (completedSet.has(`${habit.id}|${getLocalDateString(day)}`)) {
        completed++
      }
    }
    return {
      habitId: habit.id,
      name: habit.name,
      percent: due === 0 ? 0 : Math.round((completed / due) * 100),
    }
  })
}

export interface MonthComparison {
  currentValue: number
  previousValue: number
}

/** Tarefas concluídas: mês atual (até hoje) vs mês anterior completo. */
export function computeTasksCompletedMonthComparison(
  tasks: Task[],
  today: Date = new Date(),
): MonthComparison {
  const currentStart = startOfMonth(today)
  const previousStart = startOfMonth(subMonths(today, 1))
  const previousEnd = endOfMonth(previousStart)

  const count = (start: Date, end: Date) =>
    tasks.filter((task) => {
      if (!task.completed_at) return false
      const completedDate = new Date(task.completed_at)
      return completedDate >= start && completedDate <= end
    }).length

  return {
    currentValue: count(currentStart, today),
    previousValue: count(previousStart, previousEnd),
  }
}

/** Média diária de % de rotina concluída: mês atual (até hoje) vs mês anterior completo. */
export function computeRoutineCompletionMonthComparison(
  totalSteps: number,
  routineCompletions: RoutineStepCompletion[],
  today: Date = new Date(),
): MonthComparison {
  if (totalSteps === 0) return { currentValue: 0, previousValue: 0 }

  const completedStepsByDate = new Map<string, Set<string>>()
  for (const completion of routineCompletions) {
    const set =
      completedStepsByDate.get(completion.completion_date) ?? new Set<string>()
    set.add(completion.routine_step_id)
    completedStepsByDate.set(completion.completion_date, set)
  }

  const averagePercent = (start: Date, end: Date): number => {
    const cappedEnd = isAfter(end, today) ? today : end
    if (isAfter(start, cappedEnd)) return 0
    const days = eachDayOfInterval({ start, end: cappedEnd })
    const dailyPercents = days.map((day) => {
      const dateStr = getLocalDateString(day)
      const completedCount = Math.min(
        completedStepsByDate.get(dateStr)?.size ?? 0,
        totalSteps,
      )
      return (completedCount / totalSteps) * 100
    })
    return (
      dailyPercents.reduce((sum, percent) => sum + percent, 0) /
      dailyPercents.length
    )
  }

  const currentStart = startOfMonth(today)
  const previousStart = startOfMonth(subMonths(today, 1))
  const previousEnd = endOfMonth(previousStart)

  return {
    currentValue: Math.round(averagePercent(currentStart, today)),
    previousValue: Math.round(averagePercent(previousStart, previousEnd)),
  }
}

/** % de hábitos devidos concluídos: mês atual (até hoje) vs mês anterior completo. */
export function computeHabitConsistencyMonthComparison(
  habits: Habit[],
  habitWeekdaysByHabit: Map<string, number[]>,
  habitCompletions: HabitCompletion[],
  today: Date = new Date(),
): MonthComparison {
  const completedByHabitAndDate = new Set(
    habitCompletions.map((c) => `${c.habit_id}|${c.completion_date}`),
  )

  const percentForRange = (start: Date, end: Date): number => {
    const cappedEnd = isAfter(end, today) ? today : end
    if (isAfter(start, cappedEnd)) return 0
    const days = eachDayOfInterval({ start, end: cappedEnd })
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
    return due === 0 ? 0 : (completed / due) * 100
  }

  const currentStart = startOfMonth(today)
  const previousStart = startOfMonth(subMonths(today, 1))
  const previousEnd = endOfMonth(previousStart)

  return {
    currentValue: Math.round(percentForRange(currentStart, today)),
    previousValue: Math.round(percentForRange(previousStart, previousEnd)),
  }
}

export interface RoutineTaskCorrelation {
  fullRoutineAvgTasks: number
  otherAvgTasks: number
}

/**
 * Compara tarefas concluídas em dias com rotina 100% completa vs demais dias.
 * `null` se a amostra for pequena demais (&lt;5 dias de cada lado) pra evitar
 * um insight enganoso logo numa conta nova.
 */
export function computeRoutineTaskCorrelationInsight(
  totalSteps: number,
  routineCompletions: RoutineStepCompletion[],
  tasks: Task[],
  weeksCount = 8,
  today: Date = new Date(),
): RoutineTaskCorrelation | null {
  if (totalSteps === 0) return null

  const stepsByDate = new Map<string, Set<string>>()
  for (const c of routineCompletions) {
    const set = stepsByDate.get(c.completion_date) ?? new Set<string>()
    set.add(c.routine_step_id)
    stepsByDate.set(c.completion_date, set)
  }

  const tasksByDate = new Map<string, number>()
  for (const t of tasks) {
    if (!t.completed_at) continue
    const key = getLocalDateString(new Date(t.completed_at))
    tasksByDate.set(key, (tasksByDate.get(key) ?? 0) + 1)
  }

  const days = eachDayOfInterval({
    start: startOfWeek(subWeeks(today, weeksCount - 1), { weekStartsOn: 0 }),
    end: today,
  })
  const fullDays: number[] = []
  const otherDays: number[] = []
  for (const day of days) {
    const key = getLocalDateString(day)
    const isFull = (stepsByDate.get(key)?.size ?? 0) >= totalSteps
    const taskCount = tasksByDate.get(key) ?? 0
    ;(isFull ? fullDays : otherDays).push(taskCount)
  }

  if (fullDays.length < 5 || otherDays.length < 5) return null

  const average = (values: number[]) =>
    values.reduce((sum, value) => sum + value, 0) / values.length
  return {
    fullRoutineAvgTasks: average(fullDays),
    otherAvgTasks: average(otherDays),
  }
}
