import { describe, expect, it } from 'vitest'
import { computeAchievements } from './achievements'

const ZERO_INPUT = {
  routineBestStreak: 0,
  completedTasksCount: 0,
  habitCompletionsCount: 0,
  journalEntriesCount: 0,
}

describe('computeAchievements', () => {
  it('nada conquistado quando tudo zerado', () => {
    const result = computeAchievements(ZERO_INPUT)
    expect(result.every((a) => !a.achieved)).toBe(true)
    expect(result.every((a) => a.current === 0)).toBe(true)
  })

  it('marca como conquistado exatamente no valor alvo', () => {
    const result = computeAchievements({
      ...ZERO_INPUT,
      routineBestStreak: 7,
    })
    const achievement = result.find((a) => a.key === 'routine_streak_7')
    expect(achievement?.achieved).toBe(true)
    expect(achievement?.current).toBe(7)
  })

  it('não conquista o alvo maior mesmo que o menor seja batido', () => {
    const result = computeAchievements({
      ...ZERO_INPUT,
      routineBestStreak: 7,
    })
    const achievement = result.find((a) => a.key === 'routine_streak_30')
    expect(achievement?.achieved).toBe(false)
    expect(achievement?.current).toBe(7)
  })

  it('current nunca ultrapassa o target, mesmo com valor real maior', () => {
    const result = computeAchievements({
      ...ZERO_INPUT,
      completedTasksCount: 500,
    })
    const achievement = result.find((a) => a.key === 'tasks_100')
    expect(achievement?.achieved).toBe(true)
    expect(achievement?.current).toBe(100)
  })

  it('conquista tudo quando todos os valores excedem os alvos', () => {
    const result = computeAchievements({
      routineBestStreak: 999,
      completedTasksCount: 999,
      habitCompletionsCount: 999,
      journalEntriesCount: 999,
    })
    expect(result.every((a) => a.achieved)).toBe(true)
  })
})
