import { describe, expect, it } from 'vitest'
import {
  computeDailyAverageMinutes,
  computeExamAccuracy,
  computeMinutesBySubject,
  computeWeeklyProgress,
  daysUntilExam,
  formatStudyMinutes,
  getStudiedDates,
  getWeekRange,
  sumStudyMinutes,
  type StudySessionLike,
} from '@/lib/studies'

/**
 * `started_at` é montado no fuso local de propósito: o ponto das funções é
 * agrupar pelo dia que o usuário viveu, não pelo dia UTC.
 */
function makeSession(
  overrides: Partial<StudySessionLike> = {},
): StudySessionLike {
  return {
    subject_id: null,
    duration_minutes: 60,
    started_at: new Date(2026, 7, 24, 10, 0).toISOString(),
    completed_at: new Date(2026, 7, 24, 11, 0).toISOString(),
    ...overrides,
  }
}

function localStart(
  year: number,
  month: number,
  day: number,
  hour = 10,
  minute = 0,
): string {
  return new Date(year, month - 1, day, hour, minute).toISOString()
}

describe('sumStudyMinutes', () => {
  it('soma apenas sessões concluídas', () => {
    const sessions = [
      makeSession({ duration_minutes: 45 }),
      makeSession({ duration_minutes: 30, completed_at: null }),
    ]
    expect(sumStudyMinutes(sessions)).toBe(45)
  })

  it('respeita as bordas do intervalo (inclusivas)', () => {
    const sessions = [
      makeSession({
        duration_minutes: 10,
        started_at: localStart(2026, 8, 23),
      }),
      makeSession({
        duration_minutes: 20,
        started_at: localStart(2026, 8, 24),
      }),
      makeSession({
        duration_minutes: 40,
        started_at: localStart(2026, 8, 25),
      }),
      makeSession({
        duration_minutes: 80,
        started_at: localStart(2026, 8, 26),
      }),
    ]
    expect(sumStudyMinutes(sessions, '2026-08-24', '2026-08-25')).toBe(60)
  })

  it('usa a data local do início, não a data UTC', () => {
    // 23:30 local de 24/08: em qualquer fuso negativo o ISO cai em 25/08 UTC.
    const session = makeSession({
      duration_minutes: 30,
      started_at: localStart(2026, 8, 24, 23, 30),
    })
    expect(sumStudyMinutes([session], '2026-08-24', '2026-08-24')).toBe(30)
    expect(sumStudyMinutes([session], '2026-08-25', '2026-08-25')).toBe(0)
  })
})

describe('getStudiedDates', () => {
  it('devolve datas distintas e ordenadas, ignorando interrompidas', () => {
    const sessions = [
      makeSession({ started_at: localStart(2026, 8, 25) }),
      makeSession({ started_at: localStart(2026, 8, 24) }),
      makeSession({ started_at: localStart(2026, 8, 24, 15) }),
      makeSession({ started_at: localStart(2026, 8, 23), completed_at: null }),
    ]
    expect(getStudiedDates(sessions)).toEqual(['2026-08-24', '2026-08-25'])
  })
})

describe('computeMinutesBySubject', () => {
  it('agrupa sessões sem matéria sob a chave null', () => {
    const totals = computeMinutesBySubject([
      makeSession({ subject_id: 'mat-1', duration_minutes: 60 }),
      makeSession({ subject_id: null, duration_minutes: 25 }),
      makeSession({ subject_id: 'mat-1', duration_minutes: 30 }),
    ])
    expect(totals.get('mat-1')).toBe(90)
    expect(totals.get(null)).toBe(25)
  })

  it('conta uma vez só uma sessão que também está ligada a uma tarefa', () => {
    // task_id nem entra no tipo usado aqui — é a garantia de não haver
    // dupla contagem por dimensão.
    const totals = computeMinutesBySubject([
      makeSession({ subject_id: 'mat-1', duration_minutes: 50 }),
    ])
    expect([...totals.values()]).toEqual([50])
  })
})

describe('getWeekRange', () => {
  it('usa semana de segunda a domingo', () => {
    // 2026-08-24 é uma segunda-feira.
    expect(getWeekRange('2026-08-24')).toEqual({
      start: '2026-08-24',
      end: '2026-08-30',
    })
  })

  it('domingo pertence à semana que começou na segunda anterior', () => {
    // 2026-08-30 é domingo — com weekStartsOn 0 cairia na semana seguinte.
    expect(getWeekRange('2026-08-30')).toEqual({
      start: '2026-08-24',
      end: '2026-08-30',
    })
  })
})

describe('computeWeeklyProgress', () => {
  it('matéria sem meta não tem percentual', () => {
    const [progress] = computeWeeklyProgress(
      [{ id: 'mat-1', weekly_goal_minutes: null }],
      [makeSession({ subject_id: 'mat-1', duration_minutes: 120 })],
      '2026-08-24',
      '2026-08-30',
    )
    expect(progress).toEqual({
      subjectId: 'mat-1',
      minutes: 120,
      goalMinutes: null,
      percent: null,
    })
  })

  it('não limita o percentual em 100 quando a meta é superada', () => {
    const [progress] = computeWeeklyProgress(
      [{ id: 'mat-1', weekly_goal_minutes: 60 }],
      [makeSession({ subject_id: 'mat-1', duration_minutes: 90 })],
      '2026-08-24',
      '2026-08-30',
    )
    expect(progress.percent).toBe(150)
  })

  it('ordena da matéria com mais minutos para a com menos', () => {
    const progress = computeWeeklyProgress(
      [
        { id: 'mat-1', weekly_goal_minutes: null },
        { id: 'mat-2', weekly_goal_minutes: null },
      ],
      [
        makeSession({ subject_id: 'mat-1', duration_minutes: 30 }),
        makeSession({ subject_id: 'mat-2', duration_minutes: 90 }),
      ],
      '2026-08-24',
      '2026-08-30',
    )
    expect(progress.map((item) => item.subjectId)).toEqual(['mat-2', 'mat-1'])
  })
})

describe('computeDailyAverageMinutes', () => {
  it('divide pelos dias corridos, incluindo dias sem estudo', () => {
    const sessions = [
      makeSession({
        duration_minutes: 60,
        started_at: localStart(2026, 8, 24),
      }),
      makeSession({
        duration_minutes: 40,
        started_at: localStart(2026, 8, 26),
      }),
    ]
    // 100 minutos em 4 dias (24 a 27) = 25.
    expect(
      computeDailyAverageMinutes(sessions, '2026-08-24', '2026-08-27'),
    ).toBe(25)
  })
})

describe('formatStudyMinutes', () => {
  it('formata as fronteiras', () => {
    expect(formatStudyMinutes(0)).toBe('0min')
    expect(formatStudyMinutes(45)).toBe('45min')
    expect(formatStudyMinutes(60)).toBe('1h')
    expect(formatStudyMinutes(125)).toBe('2h05')
    expect(formatStudyMinutes(600)).toBe('10h')
  })
})

describe('computeExamAccuracy', () => {
  it('sem registros o percentual é null, nunca NaN', () => {
    expect(computeExamAccuracy([])).toEqual({
      correct: 0,
      total: 0,
      percent: null,
    })
  })

  it('soma acertos e total antes de calcular a porcentagem', () => {
    expect(
      computeExamAccuracy([
        { correct_count: 42, total_questions: 60 },
        { correct_count: 8, total_questions: 40 },
      ]),
    ).toEqual({ correct: 50, total: 100, percent: 50 })
  })
})

describe('daysUntilExam', () => {
  it('conta os dias que faltam, zera no dia e fica negativo depois', () => {
    expect(daysUntilExam('2026-09-10', '2026-09-02')).toBe(8)
    expect(daysUntilExam('2026-09-02', '2026-09-02')).toBe(0)
    expect(daysUntilExam('2026-08-30', '2026-09-02')).toBe(-3)
  })

  it('sem data de prova devolve null', () => {
    expect(daysUntilExam(null, '2026-09-02')).toBeNull()
  })
})
