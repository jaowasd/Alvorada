import { z } from 'zod'
import type { StudySubjectInput } from '@/lib/queries/studySubjects'

export const STUDY_SUBJECT_NAME_MAX_LENGTH = 60

/** Teto em horas equivalente ao check do banco (3000 min = 50h/semana). */
export const STUDY_SUBJECT_WEEKLY_GOAL_MAX_HOURS = 50

export const studySubjectFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Informe um nome')
    .max(STUDY_SUBJECT_NAME_MAX_LENGTH, 'Nome muito longo'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Escolha uma cor válida'),
  weeklyGoalHours: z
    .string()
    .optional()
    .refine((value) => {
      if (!value) return true
      const hours = Number(value.replace(',', '.'))
      return (
        Number.isFinite(hours) &&
        hours > 0 &&
        hours <= STUDY_SUBJECT_WEEKLY_GOAL_MAX_HOURS
      )
    }, `Informe um número entre 1 e ${STUDY_SUBJECT_WEEKLY_GOAL_MAX_HOURS}`),
})

export type StudySubjectFormValues = z.infer<typeof studySubjectFormSchema>

export function toStudySubjectInput(
  values: StudySubjectFormValues,
): StudySubjectInput {
  const hours = values.weeklyGoalHours
    ? Number(values.weeklyGoalHours.replace(',', '.'))
    : null
  return {
    name: values.name,
    color: values.color,
    weekly_goal_minutes: hours ? Math.round(hours * 60) : null,
  }
}
