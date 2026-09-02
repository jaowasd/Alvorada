import { z } from 'zod'
import type { StudyExamRecordInput } from '@/lib/queries/studyExamRecords'

export const STUDY_EXAM_TITLE_MAX_LENGTH = 120
export const STUDY_EXAM_NOTES_MAX_LENGTH = 500
export const STUDY_EXAM_MAX_QUESTIONS = 1000

export const studyExamKindSchema = z.enum(['simulado', 'prova', 'exercicios'])

const questionCountSchema = (label: string) =>
  z.string().refine((value) => {
    const parsed = Number(value)
    return value !== '' && Number.isInteger(parsed) && parsed >= 0
  }, label)

export const studyExamRecordFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Informe um título')
      .max(STUDY_EXAM_TITLE_MAX_LENGTH, 'Título muito longo'),
    kind: studyExamKindSchema,
    subjectId: z.string().optional(),
    examDate: z.string().min(1, 'Informe a data'),
    correctCount: questionCountSchema('Informe um número inteiro'),
    totalQuestions: questionCountSchema('Informe um número inteiro'),
    notes: z
      .string()
      .trim()
      .max(STUDY_EXAM_NOTES_MAX_LENGTH, 'Anotação muito longa')
      .optional(),
  })
  .superRefine((data, ctx) => {
    const total = Number(data.totalQuestions)
    const correct = Number(data.correctCount)

    if (total <= 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'O total precisa ser maior que zero',
        path: ['totalQuestions'],
      })
      return
    }
    if (total > STUDY_EXAM_MAX_QUESTIONS) {
      ctx.addIssue({
        code: 'custom',
        message: `No máximo ${STUDY_EXAM_MAX_QUESTIONS} questões`,
        path: ['totalQuestions'],
      })
    }
    if (correct > total) {
      ctx.addIssue({
        code: 'custom',
        message: 'Acertos não podem passar do total',
        path: ['correctCount'],
      })
    }
  })

export type StudyExamRecordFormValues = z.infer<
  typeof studyExamRecordFormSchema
>

export function toStudyExamRecordInput(
  values: StudyExamRecordFormValues,
): StudyExamRecordInput {
  return {
    title: values.title,
    kind: values.kind,
    subject_id: values.subjectId || null,
    exam_date: values.examDate,
    correct_count: Number(values.correctCount),
    total_questions: Number(values.totalQuestions),
    notes: values.notes?.trim() ? values.notes.trim() : null,
  }
}
