import { describe, expect, it } from 'vitest'
import { getDaysInMonth } from 'date-fns'
import {
  buildCalendarGrid,
  computeDayCompletionPercent,
  shiftMonth,
} from './calendarGrid'
import type {
  Habit,
  HabitCompletion,
  RoutineStepCompletion,
} from '@/types/database'

function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'habit-1',
    user_id: 'u',
    name: 'Hábito',
    notes: null,
    category_id: null,
    estimated_duration_minutes: null,
    frequency_type: 'specific_days',
    archived_at: null,
    created_at: '',
    updated_at: '',
    ...overrides,
  }
}

function makeRoutineCompletion(
  stepId: string,
  date: string,
): RoutineStepCompletion {
  return {
    id: `${stepId}-${date}`,
    routine_step_id: stepId,
    user_id: 'u',
    completion_date: date,
    completed_at: '',
  }
}

function makeHabitCompletion(habitId: string, date: string): HabitCompletion {
  return {
    id: `${habitId}-${date}`,
    habit_id: habitId,
    user_id: 'u',
    completion_date: date,
    completed_at: '',
  }
}

describe('buildCalendarGrid', () => {
  it('sempre retorna 42 dias (6 semanas)', () => {
    const grid = buildCalendarGrid(new Date('2026-08-01T00:00:00'))
    expect(grid).toHaveLength(42)
  })

  it('a primeira célula é sempre um domingo', () => {
    const grid = buildCalendarGrid(new Date('2026-08-01T00:00:00'))
    const firstDate = new Date(`${grid[0].date}T00:00:00`)
    expect(firstDate.getDay()).toBe(0)
  })

  it('conta exatamente os dias reais do mês como inCurrentMonth', () => {
    const monthDate = new Date('2026-08-01T00:00:00')
    const grid = buildCalendarGrid(monthDate)
    const inMonthCount = grid.filter((d) => d.inCurrentMonth).length
    expect(inMonthCount).toBe(getDaysInMonth(monthDate))
  })

  it('dias fora do mês (preenchimento) vêm antes/depois dos dias do mês', () => {
    const grid = buildCalendarGrid(new Date('2026-08-01T00:00:00'))
    const firstInMonthIndex = grid.findIndex((d) => d.inCurrentMonth)
    const lastInMonthIndex = grid.map((d) => d.inCurrentMonth).lastIndexOf(true)
    for (let i = 0; i < firstInMonthIndex; i++) {
      expect(grid[i].inCurrentMonth).toBe(false)
    }
    for (let i = lastInMonthIndex + 1; i < grid.length; i++) {
      expect(grid[i].inCurrentMonth).toBe(false)
    }
  })

  it('marca isToday só na data de hoje quando ela está no mês exibido', () => {
    const grid = buildCalendarGrid(
      new Date('2026-08-01T00:00:00'),
      '2026-08-15',
    )
    const todayCells = grid.filter((d) => d.isToday)
    expect(todayCells).toHaveLength(1)
    expect(todayCells[0].date).toBe('2026-08-15')
  })

  it('nenhuma célula marcada isToday quando hoje está fora do mês exibido', () => {
    const grid = buildCalendarGrid(
      new Date('2026-08-01T00:00:00'),
      '2026-12-25',
    )
    expect(grid.some((d) => d.isToday)).toBe(false)
  })
})

describe('shiftMonth', () => {
  it('avança um mês dentro do mesmo ano', () => {
    const result = shiftMonth(new Date('2026-08-01T00:00:00'), 1)
    expect(result.getFullYear()).toBe(2026)
    expect(result.getMonth()).toBe(8)
  })

  it('avança de dezembro para janeiro do ano seguinte', () => {
    const result = shiftMonth(new Date('2026-12-01T00:00:00'), 1)
    expect(result.getFullYear()).toBe(2027)
    expect(result.getMonth()).toBe(0)
  })

  it('volta de janeiro para dezembro do ano anterior', () => {
    const result = shiftMonth(new Date('2026-01-01T00:00:00'), -1)
    expect(result.getFullYear()).toBe(2025)
    expect(result.getMonth()).toBe(11)
  })

  it('delta zero retorna o mesmo mês', () => {
    const result = shiftMonth(new Date('2026-08-01T00:00:00'), 0)
    expect(result.getFullYear()).toBe(2026)
    expect(result.getMonth()).toBe(7)
  })
})

describe('computeDayCompletionPercent', () => {
  const DATE = '2026-08-10'
  const WEEKDAY = new Date(`${DATE}T00:00:00`).getDay()

  it('retorna null quando não há nada programado nesse dia', () => {
    expect(
      computeDayCompletionPercent(DATE, 0, [], [], new Map(), []),
    ).toBeNull()
  })

  it('calcula só a partir das etapas de rotina quando não há hábitos', () => {
    const completions = [makeRoutineCompletion('s1', DATE)]
    const percent = computeDayCompletionPercent(
      DATE,
      2,
      completions,
      [],
      new Map(),
      [],
    )
    expect(percent).toBe(50)
  })

  it('só conta hábitos devidos no dia da semana certo', () => {
    const dueHabit = makeHabit({ id: 'h1' })
    const notDueHabit = makeHabit({ id: 'h2' })
    const weekdaysByHabit = new Map([
      ['h1', [WEEKDAY]],
      ['h2', [(WEEKDAY + 1) % 7]],
    ])
    const percent = computeDayCompletionPercent(
      DATE,
      0,
      [],
      [dueHabit, notDueHabit],
      weekdaysByHabit,
      [],
    )
    expect(percent).toBe(0)
  })

  it('hábito diário conta em qualquer dia da semana', () => {
    const dailyHabit = makeHabit({ id: 'h1', frequency_type: 'daily' })
    const percent = computeDayCompletionPercent(
      DATE,
      0,
      [],
      [dailyHabit],
      new Map(),
      [makeHabitCompletion('h1', DATE)],
    )
    expect(percent).toBe(100)
  })

  it('combina rotina e hábitos concluídos e não concluídos', () => {
    const habit = makeHabit({ id: 'h1', frequency_type: 'daily' })
    const percent = computeDayCompletionPercent(
      DATE,
      2,
      [makeRoutineCompletion('s1', DATE)],
      [habit],
      new Map(),
      [],
    )
    // 1 de 2 etapas + 0 de 1 hábito = 1/3
    expect(percent).toBe(33)
  })

  it('nunca ultrapassa 100% mesmo com conclusões de etapas que não existem mais', () => {
    const completions = [
      makeRoutineCompletion('deleted-1', DATE),
      makeRoutineCompletion('deleted-2', DATE),
    ]
    const percent = computeDayCompletionPercent(
      DATE,
      1,
      completions,
      [],
      new Map(),
      [],
    )
    expect(percent).toBe(100)
  })

  it('ignora conclusões de outros dias', () => {
    const completions = [makeRoutineCompletion('s1', '2026-08-09')]
    const percent = computeDayCompletionPercent(
      DATE,
      1,
      completions,
      [],
      new Map(),
      [],
    )
    expect(percent).toBe(0)
  })
})
