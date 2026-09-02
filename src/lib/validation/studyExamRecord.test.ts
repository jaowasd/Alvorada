import { describe, expect, it } from 'vitest'
import {
  STUDY_EXAM_MAX_QUESTIONS,
  STUDY_EXAM_NOTES_MAX_LENGTH,
  STUDY_EXAM_TITLE_MAX_LENGTH,
  studyExamRecordFormSchema,
  toStudyExamRecordInput,
  type StudyExamRecordFormValues,
} from './studyExamRecord'

function makeValues(
  overrides: Partial<StudyExamRecordFormValues> = {},
): StudyExamRecordFormValues {
  return {
    title: 'Simulado TJ-SP 01',
    kind: 'simulado',
    subjectId: '',
    examDate: '2026-08-24',
    correctCount: '42',
    totalQuestions: '60',
    notes: '',
    ...overrides,
  }
}

describe('studyExamRecordFormSchema', () => {
  it('aceita um registro válido', () => {
    expect(studyExamRecordFormSchema.safeParse(makeValues()).success).toBe(true)
  })

  it('rejeita acertos acima do total', () => {
    const result = studyExamRecordFormSchema.safeParse(
      makeValues({ correctCount: '61', totalQuestions: '60' }),
    )
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.path).toEqual(['correctCount'])
  })

  it('aceita acertar todas as questões', () => {
    const result = studyExamRecordFormSchema.safeParse(
      makeValues({ correctCount: '60', totalQuestions: '60' }),
    )
    expect(result.success).toBe(true)
  })

  it('rejeita total zerado', () => {
    const result = studyExamRecordFormSchema.safeParse(
      makeValues({ correctCount: '0', totalQuestions: '0' }),
    )
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.path).toEqual(['totalQuestions'])
  })

  it('rejeita total acima do limite do banco', () => {
    const result = studyExamRecordFormSchema.safeParse(
      makeValues({
        correctCount: '1',
        totalQuestions: String(STUDY_EXAM_MAX_QUESTIONS + 1),
      }),
    )
    expect(result.success).toBe(false)
  })

  it('rejeita título e anotação acima do limite do banco', () => {
    expect(
      studyExamRecordFormSchema.safeParse(
        makeValues({ title: 'a'.repeat(STUDY_EXAM_TITLE_MAX_LENGTH + 1) }),
      ).success,
    ).toBe(false)
    expect(
      studyExamRecordFormSchema.safeParse(
        makeValues({ notes: 'a'.repeat(STUDY_EXAM_NOTES_MAX_LENGTH + 1) }),
      ).success,
    ).toBe(false)
  })

  it('rejeita contagem não inteira', () => {
    expect(
      studyExamRecordFormSchema.safeParse(makeValues({ correctCount: '4.5' }))
        .success,
    ).toBe(false)
  })
})

describe('toStudyExamRecordInput', () => {
  it('converte campos vazios em null e strings em número', () => {
    expect(toStudyExamRecordInput(makeValues())).toEqual({
      title: 'Simulado TJ-SP 01',
      kind: 'simulado',
      subject_id: null,
      exam_date: '2026-08-24',
      correct_count: 42,
      total_questions: 60,
      notes: null,
    })
  })

  it('mantém a matéria e a anotação quando preenchidas', () => {
    const input = toStudyExamRecordInput(
      makeValues({ subjectId: 'mat-1', notes: '  errei as de RLM  ' }),
    )
    expect(input.subject_id).toBe('mat-1')
    expect(input.notes).toBe('errei as de RLM')
  })
})
