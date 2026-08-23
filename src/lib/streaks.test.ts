import { describe, expect, it } from 'vitest'
import { addDays, format, subDays } from 'date-fns'
import {
  calculateHabitStreak,
  calculateRoutineStreak,
  getFullyCompletedRoutineDates,
} from './streaks'

const TODAY = '2026-08-23'

function offset(days: number): string {
  const base = new Date(`${TODAY}T00:00:00`)
  return format(
    days >= 0 ? addDays(base, days) : subDays(base, -days),
    'yyyy-MM-dd',
  )
}

function weekdayOf(dateStr: string): number {
  return new Date(`${dateStr}T00:00:00`).getDay()
}

describe('calculateHabitStreak - diário', () => {
  it('sem conclusões retorna zero', () => {
    expect(calculateHabitStreak([], 'daily', [], TODAY)).toEqual({
      currentStreak: 0,
      bestStreak: 0,
    })
  })

  it('conta apenas hoje', () => {
    expect(calculateHabitStreak([TODAY], 'daily', [], TODAY)).toEqual({
      currentStreak: 1,
      bestStreak: 1,
    })
  })

  it('sequência de dois dias terminando hoje', () => {
    const dates = [offset(-1), TODAY]
    expect(calculateHabitStreak(dates, 'daily', [], TODAY)).toEqual({
      currentStreak: 2,
      bestStreak: 2,
    })
  })

  it('ontem concluído e hoje ainda não — sequência continua viva', () => {
    const dates = [offset(-2), offset(-1)]
    expect(calculateHabitStreak(dates, 'daily', [], TODAY)).toEqual({
      currentStreak: 2,
      bestStreak: 2,
    })
  })

  it('dia devido no passado sem conclusão quebra a sequência atual', () => {
    const dates = [offset(-3), offset(-2), TODAY]
    expect(calculateHabitStreak(dates, 'daily', [], TODAY)).toEqual({
      currentStreak: 1,
      bestStreak: 2,
    })
  })

  it('recorde é preservado mesmo após a sequência atual quebrar', () => {
    const dates = [offset(-10), offset(-9), offset(-8)]
    expect(calculateHabitStreak(dates, 'daily', [], TODAY)).toEqual({
      currentStreak: 0,
      bestStreak: 3,
    })
  })

  it('não permite conclusões duplicadas no mesmo dia inflarem a sequência', () => {
    const dates = [TODAY, TODAY]
    expect(calculateHabitStreak(dates, 'daily', [], TODAY)).toEqual({
      currentStreak: 1,
      bestStreak: 1,
    })
  })
})

describe('calculateHabitStreak - dias específicos', () => {
  it('não conta nem quebra em dias não programados', () => {
    const weekday = weekdayOf(TODAY)
    const dates = [offset(-7), TODAY]
    expect(
      calculateHabitStreak(dates, 'specific_days', [weekday], TODAY),
    ).toEqual({ currentStreak: 2, bestStreak: 2 })
  })

  it('falta em um dia devido dentro do intervalo quebra a sequência', () => {
    const weekday = weekdayOf(TODAY)
    // devido em -14, -7 e hoje (mesmo dia da semana); faltou em -7
    const dates = [offset(-14), TODAY]
    expect(
      calculateHabitStreak(dates, 'specific_days', [weekday], TODAY),
    ).toEqual({ currentStreak: 1, bestStreak: 1 })
  })
})

describe('getFullyCompletedRoutineDates / calculateRoutineStreak', () => {
  it('dia só conta como completo quando todas as etapas atuais foram feitas', () => {
    const completions = [
      { routine_step_id: 'a', completion_date: offset(-1) },
      { routine_step_id: 'b', completion_date: offset(-1) },
      { routine_step_id: 'a', completion_date: TODAY },
    ]
    const fullyCompleted = getFullyCompletedRoutineDates(completions, 2)
    expect(fullyCompleted.sort()).toEqual([offset(-1)])
  })

  it('sequência da rotina considera só os dias 100% completos', () => {
    const completions = [
      { routine_step_id: 'a', completion_date: offset(-2) },
      { routine_step_id: 'b', completion_date: offset(-2) },
      { routine_step_id: 'a', completion_date: offset(-1) },
      { routine_step_id: 'b', completion_date: offset(-1) },
    ]
    const fullyCompleted = getFullyCompletedRoutineDates(completions, 2)
    expect(calculateRoutineStreak(fullyCompleted, TODAY)).toEqual({
      currentStreak: 2,
      bestStreak: 2,
    })
  })

  it('rotina sem etapas não gera dias completos', () => {
    expect(getFullyCompletedRoutineDates([], 0)).toEqual([])
  })
})
