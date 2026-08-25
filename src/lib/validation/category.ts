import { z } from 'zod'
import type { CategoryInput } from '@/lib/queries/categories'

export const categoryFormSchema = z.object({
  name: z.string().trim().min(1, 'Informe um nome').max(60, 'Nome muito longo'),
  icon: z.string().min(1, 'Escolha um ícone'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Escolha uma cor válida'),
})

export type CategoryFormValues = z.infer<typeof categoryFormSchema>

export function toCategoryInput(values: CategoryFormValues): CategoryInput {
  return {
    name: values.name,
    icon: values.icon,
    color: values.color,
  }
}
