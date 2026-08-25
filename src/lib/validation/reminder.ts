import { z } from 'zod'

export const REMINDER_LABEL_MAX_LENGTH = 120
export const REMINDER_MESSAGE_MAX_LENGTH = 500

export const reminderLinkTypeSchema = z.enum([
  'none',
  'task',
  'habit',
  'routine_step',
])
export type ReminderLinkType = z.infer<typeof reminderLinkTypeSchema>

export const customReminderFormSchema = z
  .object({
    linkType: reminderLinkTypeSchema,
    linkedId: z.string().optional(),
    label: z
      .string()
      .trim()
      .max(REMINDER_LABEL_MAX_LENGTH, 'Rótulo muito longo')
      .optional(),
    remindAt: z.string().min(1, 'Informe uma data'),
    message: z
      .string()
      .trim()
      .max(REMINDER_MESSAGE_MAX_LENGTH, 'Mensagem muito longa')
      .optional(),
  })
  .refine((data) => data.linkType === 'none' || !!data.linkedId, {
    message: 'Selecione um item',
    path: ['linkedId'],
  })
  .refine((data) => data.linkType !== 'none' || !!data.label?.trim(), {
    message: 'Informe um rótulo',
    path: ['label'],
  })

export type CustomReminderFormValues = z.infer<typeof customReminderFormSchema>
