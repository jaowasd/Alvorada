import { describe, expect, it } from 'vitest'
import {
  studySessionFormSchema,
  toStudySessionTimestamps,
  type StudySessionFormValues,
} from './studySession'

function makeValues(
  overrides: Partial<StudySessionFormValues> = {},
): StudySessionFormValues {
  return {
    subjectId: '',
    taskId: '',
    label: '',
    date: '2026-08-24',
    startTime: '08:30',
    durationMinutes: '90',
    ...overrides,
  }
}

describe('toStudySessionTimestamps', () => {
  it('interpreta data e hora no fuso local, não em UTC', () => {
    const { startedAt } = toStudySessionTimestamps(makeValues())
    const parsed = new Date(startedAt)
    expect(parsed.getFullYear()).toBe(2026)
    expect(parsed.getMonth()).toBe(7)
    expect(parsed.getDate()).toBe(24)
    expect(parsed.getHours()).toBe(8)
    expect(parsed.getMinutes()).toBe(30)
  })

  it('conclui a sessão exatamente após a duração informada', () => {
    const { startedAt, completedAt } = toStudySessionTimestamps(makeValues())
    const elapsedMinutes =
      (new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 60_000
    expect(elapsedMinutes).toBe(90)
  })

  it('converte campos vazios em null e apara o assunto', () => {
    const { input } = toStudySessionTimestamps(
      makeValues({ label: '  Recursos Administrativos  ' }),
    )
    expect(input).toEqual({
      subject_id: null,
      task_id: null,
      label: 'Recursos Administrativos',
      duration_minutes: 90,
    })
  })

  it('atravessa a virada do dia sem perder minutos', () => {
    const { startedAt, completedAt } = toStudySessionTimestamps(
      makeValues({ startTime: '23:30', durationMinutes: '60' }),
    )
    expect(new Date(startedAt).getDate()).toBe(24)
    expect(new Date(completedAt).getDate()).toBe(25)
  })
})

describe('studySessionFormSchema', () => {
  it('rejeita sessão em data futura', () => {
    const result = studySessionFormSchema.safeParse(
      makeValues({ date: '2999-01-01' }),
    )
    expect(result.success).toBe(false)
  })

  it('rejeita duração acima do teto de 600 minutos', () => {
    const result = studySessionFormSchema.safeParse(
      makeValues({ durationMinutes: '601' }),
    )
    expect(result.success).toBe(false)
  })

  it('aceita uma sessão longa de registro manual (300 min)', () => {
    const result = studySessionFormSchema.safeParse(
      makeValues({ durationMinutes: '300' }),
    )
    expect(result.success).toBe(true)
  })

  it('rejeita duração zero ou fracionada', () => {
    expect(
      studySessionFormSchema.safeParse(makeValues({ durationMinutes: '0' }))
        .success,
    ).toBe(false)
    expect(
      studySessionFormSchema.safeParse(makeValues({ durationMinutes: '12.5' }))
        .success,
    ).toBe(false)
  })
})
