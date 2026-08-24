import { describe, expect, it } from 'vitest'
import { computeFocusMinutesForDate } from '@/lib/focusSessions'
import type { FocusSession } from '@/types/database'

function makeSession(overrides: Partial<FocusSession> = {}): FocusSession {
  return {
    id: 's1',
    user_id: 'user-1',
    task_id: null,
    label: null,
    duration_minutes: 25,
    started_at: '2026-08-24T10:00:00.000Z',
    completed_at: '2026-08-24T10:25:00.000Z',
    ...overrides,
  }
}

describe('computeFocusMinutesForDate', () => {
  it('soma sessões concluídas do dia', () => {
    const sessions = [
      makeSession({ id: 's1', duration_minutes: 25 }),
      makeSession({ id: 's2', duration_minutes: 15 }),
    ]
    expect(computeFocusMinutesForDate(sessions, '2026-08-24')).toBe(40)
  })

  it('ignora sessões interrompidas (completed_at nulo)', () => {
    const sessions = [
      makeSession({ id: 's1', duration_minutes: 25, completed_at: null }),
    ]
    expect(computeFocusMinutesForDate(sessions, '2026-08-24')).toBe(0)
  })

  it('ignora sessões de outros dias', () => {
    const sessions = [
      makeSession({
        id: 's1',
        started_at: '2026-08-23T10:00:00.000Z',
        completed_at: '2026-08-23T10:25:00.000Z',
      }),
    ]
    expect(computeFocusMinutesForDate(sessions, '2026-08-24')).toBe(0)
  })

  it('sem sessões, retorna zero', () => {
    expect(computeFocusMinutesForDate([], '2026-08-24')).toBe(0)
  })
})
