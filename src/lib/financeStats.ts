import type {
  FinanceTransaction,
  FinanceTransactionType,
} from '@/types/database'

type StatsTransaction = Pick<
  FinanceTransaction,
  'type' | 'amount_cents' | 'status' | 'due_date' | 'category_id'
>

/** "2026-08-15" -> "2026-08" */
export function getMonthKey(dateStr: string): string {
  return dateStr.slice(0, 7)
}

/** "2026-08" -> "2026-07" (trata virada de ano). */
export function getPreviousMonthKey(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number)
  const date = new Date(year, month - 2, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

/** Soma receitas ou despesas confirmadas de um mês específico. */
export function sumConfirmedByTypeAndMonth(
  transactions: StatsTransaction[],
  type: Extract<FinanceTransactionType, 'income' | 'expense'>,
  monthKey: string,
): number {
  return transactions
    .filter(
      (transaction) =>
        transaction.type === type &&
        transaction.status === 'confirmed' &&
        getMonthKey(transaction.due_date) === monthKey,
    )
    .reduce((sum, transaction) => sum + transaction.amount_cents, 0)
}

export interface CategoryBreakdownEntry {
  categoryId: string | null
  amountCents: number
}

/** Despesas confirmadas de um mês, agrupadas por categoria e ordenadas do maior para o menor gasto. */
export function groupExpensesByCategory(
  transactions: StatsTransaction[],
  monthKey: string,
): CategoryBreakdownEntry[] {
  const totals = new Map<string | null, number>()
  for (const transaction of transactions) {
    if (
      transaction.type !== 'expense' ||
      transaction.status !== 'confirmed' ||
      getMonthKey(transaction.due_date) !== monthKey
    ) {
      continue
    }
    totals.set(
      transaction.category_id,
      (totals.get(transaction.category_id) ?? 0) + transaction.amount_cents,
    )
  }
  return [...totals.entries()]
    .map(([categoryId, amountCents]) => ({ categoryId, amountCents }))
    .sort((a, b) => b.amountCents - a.amountCents)
}
