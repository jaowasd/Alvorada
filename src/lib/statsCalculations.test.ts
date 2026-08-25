import { describe, expect, it } from 'vitest'
import {
  computeHabitConsistencyByWeek,
  computeRoutineCompletionByWeek,
  computeTasksCompletedByWeek,
} from './statsCalculations'
import type {
  Habit,
  HabitCompletion,
  RoutineStepCompletion,
  Task,
} from '@/types/database'

// 2026-08-24 é uma segunda-feira; a semana (domingo a sábado) atual começa
// em 2026-08-23. A semana anterior vai de 2026-08-16 a 2026-08-22.
const TODAY = new Date('2026-08-24T12:00:00')

function dailyHabit(id: string): Habit {
  return {
    id,
    user_id: 'u1',
    name: 'Hábito',
    notes: null,
    category_id: null,
    estimated_duration_minutes: null,
    frequency_type: 'daily',
    archived_at: null,
    created_at: '',
    updated_at: '',
  }
}

function specificDaysHabit(id: string): Habit {
  return { ...dailyHabit(id), frequency_type: 'specific_days' }
}

function habitCompletion(habitId: string, date: string): HabitCompletion {
  return {
    id: `${habitId}-${date}`,
    habit_id: habitId,
    user_id: 'u1',
    completion_date: date,
    completed_at: `${date}T08:00:00Z`,
  }
}

describe('computeHabitConsistencyByWeek', () => {
  it('sem hábitos retorna 0 em todas as semanas', () => {
    const result = computeHabitConsistencyByWeek([], new Map(), [], 2, TODAY)
    expect(result).toHaveLength(2)
    expect(result.every((point) => point.value === 0)).toBe(true)
  })

  it('hábito diário: calcula % por semana, cortando a semana atual em hoje', () => {
    const habit = dailyHabit('h1')
    const completions = [
      habitCompletion('h1', '2026-08-18'),
      habitCompletion('h1', '2026-08-19'),
      habitCompletion('h1', '2026-08-20'),
      habitCompletion('h1', '2026-08-24'),
    ]
    const result = computeHabitConsistencyByWeek(
      [habit],
      new Map(),
      completions,
      2,
      TODAY,
    )
    // semana anterior: 7 dias devidos, 3 concluídos -> 43%
    expect(result[0].value).toBe(43)
    // semana atual: só domingo+segunda contam (hoje é segunda), 1 de 2 -> 50%
    expect(result[1].value).toBe(50)
  })

  it('hábito de dias específicos só conta nos dias devidos', () => {
    const habit = specificDaysHabit('h1')
    const weekdaysByHabit = new Map([['h1', [1]]]) // só segunda-feira
    const completions = [habitCompletion('h1', '2026-08-24')]
    const result = computeHabitConsistencyByWeek(
      [habit],
      weekdaysByHabit,
      completions,
      1,
      TODAY,
    )
    // só a segunda (hoje) é devida nessa janela -> 1 de 1 -> 100%
    expect(result[0].value).toBe(100)
  })
})

describe('computeRoutineCompletionByWeek', () => {
  it('sem etapas na rotina retorna 0 em todas as semanas', () => {
    const result = computeRoutineCompletionByWeek(0, [], 2, TODAY)
    expect(result.every((point) => point.value === 0)).toBe(true)
  })

  it('calcula a média diária de % de etapas concluídas na semana', () => {
    const completions: RoutineStepCompletion[] = [
      {
        id: '1',
        routine_step_id: 's1',
        user_id: 'u1',
        completion_date: '2026-08-23',
        completed_at: '',
      },
      {
        id: '2',
        routine_step_id: 's1',
        user_id: 'u1',
        completion_date: '2026-08-24',
        completed_at: '',
      },
      {
        id: '3',
        routine_step_id: 's2',
        user_id: 'u1',
        completion_date: '2026-08-24',
        completed_at: '',
      },
    ]
    const result = computeRoutineCompletionByWeek(2, completions, 1, TODAY)
    // 08-23: 1/2 etapas (50%); 08-24: 2/2 etapas (100%) -> média 75%
    expect(result[0].value).toBe(75)
  })
})

describe('computeTasksCompletedByWeek', () => {
  it('sem tarefas retorna 0 em todas as semanas', () => {
    const result = computeTasksCompletedByWeek([], 2, TODAY)
    expect(result.every((point) => point.value === 0)).toBe(true)
  })

  it('conta tarefas concluídas na semana certa, ignorando as sem completed_at', () => {
    const tasks: Task[] = [
      taskCompletedAt('2026-08-18T10:00:00Z'), // semana anterior
      taskCompletedAt('2026-08-24T10:00:00Z'), // semana atual
      taskCompletedAt(null), // não concluída
    ]
    const result = computeTasksCompletedByWeek(tasks, 2, TODAY)
    expect(result[0].value).toBe(1)
    expect(result[1].value).toBe(1)
  })
})

function taskCompletedAt(completedAt: string | null): Task {
  return {
    id: Math.random().toString(),
    user_id: 'u1',
    title: 'Tarefa',
    notes: null,
    category_id: null,
    estimated_duration_minutes: null,
    due_date: null,
    is_completed: completedAt !== null,
    completed_at: completedAt,
    deleted_at: null,
    recurring_task_id: null,
    created_at: '',
    updated_at: '',
  }
}
