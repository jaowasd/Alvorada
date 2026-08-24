import { z } from 'zod'
import type { ProfileInput } from '@/lib/queries/profile'

export const profileFormSchema = z.object({
  displayName: z.string().trim().max(30, 'Máximo de 30 caracteres').optional(),
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>

export function toProfileInput(values: ProfileFormValues): ProfileInput {
  return {
    display_name: values.displayName ? values.displayName : null,
  }
}
