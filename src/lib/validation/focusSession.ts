import { z } from 'zod'

export const FOCUS_SESSION_LABEL_MAX_LENGTH = 120

/** Teto do dado (migration 0024) — cobre registro manual de um dia inteiro. */
export const FOCUS_SESSION_DURATION_MAX_MINUTES = 600

/**
 * Teto do cronômetro, propositalmente menor que o do dado: 240 min era uma
 * política de pomodoro que virou limite de banco em 0012. Uma sessão
 * cronometrada longa demais não faz sentido; um registro manual longo faz.
 */
export const FOCUS_TIMER_MAX_MINUTES = 120

export const focusSessionInputSchema = z.object({
  task_id: z.string().uuid().nullable(),
  subject_id: z.string().uuid().nullable(),
  label: z.string().trim().max(FOCUS_SESSION_LABEL_MAX_LENGTH).nullable(),
  duration_minutes: z
    .number()
    .int()
    .positive()
    .max(FOCUS_SESSION_DURATION_MAX_MINUTES),
})
