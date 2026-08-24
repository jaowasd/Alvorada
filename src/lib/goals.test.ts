import { describe, expect, it } from 'vitest'
import { computeGoalProgress } from '@/lib/goals'
import type { Goal, GoalProgressEntry } from '@/types/database'

function makeGoal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: 'goal-1',
    user_id: 'user-1',
    name: 'Ler livros',
    target_value: 12,
    unit: 'livros',
    deadline_date: null,
    status: 'active',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

function makeEntry(
  overrides: Partial<GoalProgressEntry> = {},
): GoalProgressEntry {
  return {
    id: 'entry-1',
    goal_id: 'goal-1',
    user_id: 'user-1',
    amount: 1,
    entry_date: '2026-01-05',
    notes: null,
    created_at: '2026-01-05T00:00:00Z',
    ...overrides,
  }
}

describe('computeGoalProgress', () => {
  it('soma os lançamentos da meta', () => {
    const goal = makeGoal({ target_value: 12 })
    const entries = [
      makeEntry({ id: 'e1', amount: 3 }),
      makeEntry({ id: 'e2', amount: 2 }),
    ]
    expect(computeGoalProgress(goal, entries)).toEqual({
      current: 5,
      percent: 42,
    })
  })

  it('ignora lançamentos de outras metas', () => {
    const goal = makeGoal({ id: 'goal-1', target_value: 10 })
    const entries = [
      makeEntry({ goal_id: 'goal-1', amount: 4 }),
      makeEntry({ goal_id: 'goal-2', amount: 100 }),
    ]
    expect(computeGoalProgress(goal, entries).current).toBe(4)
  })

  it('nunca ultrapassa 100%', () => {
    const goal = makeGoal({ target_value: 10 })
    const entries = [makeEntry({ amount: 25 })]
    expect(computeGoalProgress(goal, entries)).toEqual({
      current: 25,
      percent: 100,
    })
  })

  it('meta booleana (sem target_value) não tem percentual', () => {
    const goal = makeGoal({ target_value: null })
    const entries = [makeEntry({ amount: 1 })]
    expect(computeGoalProgress(goal, entries)).toEqual({
      current: 1,
      percent: null,
    })
  })

  it('sem lançamentos, progresso é zero', () => {
    const goal = makeGoal({ target_value: 5 })
    expect(computeGoalProgress(goal, [])).toEqual({ current: 0, percent: 0 })
  })
})
