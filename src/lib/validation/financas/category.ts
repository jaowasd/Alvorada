import { z } from 'zod'
import type { FinanceCategoryInput } from '@/lib/queries/financas/categories'

export const financeCategoryFormSchema = z.object({
  name: z.string().trim().min(1, 'Informe um nome').max(60, 'Nome muito longo'),
  kind: z.enum(['income', 'expense']),
  icon: z.string().min(1, 'Escolha um ícone'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Escolha uma cor válida'),
})

export type FinanceCategoryFormValues = z.infer<
  typeof financeCategoryFormSchema
>

export function toFinanceCategoryInput(
  values: FinanceCategoryFormValues,
): FinanceCategoryInput {
  return {
    name: values.name,
    kind: values.kind,
    icon: values.icon,
    color: values.color,
  }
}
