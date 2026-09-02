import { z } from 'zod'
import type { StudySettingsInput } from '@/lib/queries/studySettings'

/** Teto em horas equivalente ao check do banco (4200 min = 70h/semana). */
export const STUDY_WEEKLY_GOAL_MAX_HOURS = 70

export const studySettingsFormSchema = z.object({
  weeklyGoalHours: z
    .string()
    .optional()
    .refine((value) => {
      if (!value) return true
      const hours = Number(value.replace(',', '.'))
      return (
        Number.isFinite(hours) &&
        hours > 0 &&
        hours <= STUDY_WEEKLY_GOAL_MAX_HOURS
      )
    }, `Informe um número entre 1 e ${STUDY_WEEKLY_GOAL_MAX_HOURS}`),
  examDate: z.string().optional(),
})

export type StudySettingsFormValues = z.infer<typeof studySettingsFormSchema>

export function toStudySettingsInput(
  values: StudySettingsFormValues,
): StudySettingsInput {
  const hours = values.weeklyGoalHours
    ? Number(values.weeklyGoalHours.replace(',', '.'))
    : null
  return {
    weekly_goal_minutes: hours ? Math.round(hours * 60) : null,
    exam_date: values.examDate || null,
  }
}
