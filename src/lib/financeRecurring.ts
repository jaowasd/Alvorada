export {
  computeMissingOccurrences,
  type RecurringTemplateSchedule,
} from '@/lib/recurrence'

/**
 * Valor de cada instância gerada: usa o valor da última transação real
 * gerada por essa recorrência quando ela é de valor variável (ex.: conta
 * de energia), senão o valor do template.
 */
export function resolveInstanceAmountCents(
  template: { amountCents: number; isVariableAmount: boolean },
  lastKnownAmountCents: number | null,
): number {
  if (template.isVariableAmount && lastKnownAmountCents != null) {
    return lastKnownAmountCents
  }
  return template.amountCents
}
