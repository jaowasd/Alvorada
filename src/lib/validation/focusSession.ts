import { z } from 'zod'

export const FOCUS_SESSION_LABEL_MAX_LENGTH = 120

export const focusSessionInputSchema = z.object({
  task_id: z.string().uuid().nullable(),
  label: z.string().trim().max(FOCUS_SESSION_LABEL_MAX_LENGTH).nullable(),
  duration_minutes: z.number().int().positive().max(240),
})
