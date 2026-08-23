import { z } from 'zod'
import type { RoutineStepInput } from '@/lib/queries/routines'

export const routineStepFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Informe um título')
    .max(120, 'Título muito longo'),
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
})

export type RoutineStepFormValues = z.infer<typeof routineStepFormSchema>

export function toRoutineStepInput(
  values: RoutineStepFormValues,
): RoutineStepInput {
  return {
    title: values.title,
    notes: values.notes?.trim() ? values.notes.trim() : null,
    category_id: values.categoryId || null,
    estimated_duration_minutes: values.estimatedDurationMinutes
      ? Number(values.estimatedDurationMinutes)
      : null,
  }
}
