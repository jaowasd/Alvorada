import { z } from 'zod'
import type { GoalInput } from '@/lib/queries/goals'

export const goalFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Informe um nome')
    .max(120, 'Nome muito longo'),
  targetValue: z
    .string()
    .optional()
    .refine(
      (value) =>
        !value || (Number(value) > 0 && Number.isFinite(Number(value))),
      'Informe um número maior que zero',
    ),
  unit: z.string().trim().max(30, 'Unidade muito longa').optional(),
  deadlineDate: z.string().optional(),
})

export type GoalFormValues = z.infer<typeof goalFormSchema>

export function toGoalInput(values: GoalFormValues): GoalInput {
  return {
    name: values.name,
    target_value: values.targetValue ? Number(values.targetValue) : null,
    unit: values.unit?.trim() ? values.unit.trim() : null,
    deadline_date: values.deadlineDate || null,
  }
}
