import { z } from 'zod'
import type { RecurringTaskInput } from '@/lib/queries/recurringTasks'

export const recurringTaskFormSchema = z
  .object({
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
    frequency: z.enum(['monthly', 'weekly']),
    dayOfMonth: z.string().optional(),
    weekday: z.string().optional(),
    startDate: z.string().min(1, 'Informe a data de início'),
    endDate: z.string().optional(),
  })
  .refine(
    (data) =>
      data.frequency !== 'monthly' ||
      (!!data.dayOfMonth &&
        /^\d+$/.test(data.dayOfMonth) &&
        Number(data.dayOfMonth) >= 1 &&
        Number(data.dayOfMonth) <= 31),
    { message: 'Informe o dia do mês (1 a 31)', path: ['dayOfMonth'] },
  )
  .refine(
    (data) =>
      data.frequency !== 'weekly' ||
      (data.weekday !== undefined && data.weekday !== ''),
    { message: 'Selecione o dia da semana', path: ['weekday'] },
  )
  .refine((data) => !data.endDate || data.endDate >= data.startDate, {
    message: 'A data final deve ser depois da data de início',
    path: ['endDate'],
  })

export type RecurringTaskFormValues = z.infer<typeof recurringTaskFormSchema>

export function toRecurringTaskInput(
  values: RecurringTaskFormValues,
): RecurringTaskInput {
  return {
    title: values.title,
    notes: values.notes?.trim() ? values.notes.trim() : null,
    category_id: values.categoryId || null,
    estimated_duration_minutes: values.estimatedDurationMinutes
      ? Number(values.estimatedDurationMinutes)
      : null,
    frequency: values.frequency,
    day_of_month:
      values.frequency === 'monthly' ? Number(values.dayOfMonth) : null,
    weekday: values.frequency === 'weekly' ? Number(values.weekday) : null,
    start_date: values.startDate,
    end_date: values.endDate || null,
  }
}
