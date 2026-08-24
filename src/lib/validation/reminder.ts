import { z } from 'zod'

export const REMINDER_LABEL_MAX_LENGTH = 120
export const REMINDER_MESSAGE_MAX_LENGTH = 500

export const customReminderFormSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, 'Informe um rótulo')
    .max(REMINDER_LABEL_MAX_LENGTH, 'Rótulo muito longo'),
  remindAt: z.string().min(1, 'Informe uma data'),
  message: z
    .string()
    .trim()
    .max(REMINDER_MESSAGE_MAX_LENGTH, 'Mensagem muito longa')
    .optional(),
})

export type CustomReminderFormValues = z.infer<typeof customReminderFormSchema>
