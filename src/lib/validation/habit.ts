import { z } from 'zod'
import type { HabitInput } from '@/lib/queries/habits'

export const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export const habitFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Informe um nome')
      .max(120, 'Nome muito longo'),
    notes: z.string().trim().max(500, 'Nota muito longa').optional(),
    categoryId: z.string().optional(),
    estimatedDurationMinutes: z
      .string()
      .optional()
      .refine(
        (value) =>
          !value ||
          (/^\d+$/.test(value) && Number(value) > 0 && Number(value) <= 600),
        'Duração deve ser um número entre 1 e 600 minutos',
      ),
    frequencyType: z.enum(['daily', 'specific_days']),
    weekdays: z.array(z.number().min(0).max(6)).optional(),
  })
  .refine(
    (data) =>
      data.frequencyType === 'daily' ||
      (data.weekdays && data.weekdays.length > 0),
    { message: 'Selecione pelo menos um dia', path: ['weekdays'] },
  )

export type HabitFormValues = z.infer<typeof habitFormSchema>

export function toHabitInput(values: HabitFormValues): HabitInput {
  return {
    name: values.name,
    notes: values.notes?.trim() ? values.notes.trim() : null,
    category_id: values.categoryId || null,
    estimated_duration_minutes: values.estimatedDurationMinutes
      ? Number(values.estimatedDurationMinutes)
      : null,
    frequency_type: values.frequencyType,
  }
}
