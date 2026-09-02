import { z } from 'zod'
import { getLocalDateString } from '@/lib/date'
import type { FocusSessionInput } from '@/lib/queries/focusSessions'
import {
  FOCUS_SESSION_DURATION_MAX_MINUTES,
  FOCUS_SESSION_LABEL_MAX_LENGTH,
} from '@/lib/validation/focusSession'

export const studySessionFormSchema = z
  .object({
    subjectId: z.string().optional(),
    taskId: z.string().optional(),
    label: z
      .string()
      .trim()
      .max(FOCUS_SESSION_LABEL_MAX_LENGTH, 'Assunto muito longo')
      .optional(),
    date: z.string().min(1, 'Informe a data'),
    startTime: z.string().min(1, 'Informe o horário'),
    durationMinutes: z.string().refine((value) => {
      const parsed = Number(value)
      return (
        value !== '' &&
        Number.isInteger(parsed) &&
        parsed > 0 &&
        parsed <= FOCUS_SESSION_DURATION_MAX_MINUTES
      )
    }, `Informe de 1 a ${FOCUS_SESSION_DURATION_MAX_MINUTES} minutos`),
  })
  .refine((data) => data.date <= getLocalDateString(), {
    message: 'Não dá para registrar uma sessão futura',
    path: ['date'],
  })

export type StudySessionFormValues = z.infer<typeof studySessionFormSchema>

export interface StudySessionTimestamps {
  input: FocusSessionInput
  startedAt: string
  completedAt: string
}

/**
 * Monta os timestamps a partir de data + hora locais.
 *
 * Importante: usa `new Date(ano, mês, dia, h, m)` (construtor local) e só
 * então `toISOString()`. Concatenar `${date}T${startTime}` seria interpretado
 * como UTC pelo parser de data-hora sem fuso do JS, jogando a sessão para o
 * dia errado em todo fuso negativo — inclusive o do Brasil.
 */
export function toStudySessionTimestamps(
  values: StudySessionFormValues,
): StudySessionTimestamps {
  const [year, month, day] = values.date.split('-').map(Number)
  const [hours, minutes] = values.startTime.split(':').map(Number)
  const durationMinutes = Number(values.durationMinutes)

  const startedAt = new Date(year, month - 1, day, hours, minutes, 0, 0)
  const completedAt = new Date(startedAt.getTime() + durationMinutes * 60_000)

  return {
    input: {
      subject_id: values.subjectId || null,
      task_id: values.taskId || null,
      label: values.label?.trim() ? values.label.trim() : null,
      duration_minutes: durationMinutes,
    },
    startedAt: startedAt.toISOString(),
    completedAt: completedAt.toISOString(),
  }
}
