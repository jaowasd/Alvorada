import type {
  FinanceTransaction,
  FinanceTransactionStatus,
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

/** Gera os últimos `count` monthKeys terminando em `monthKey` (mais antigo primeiro). */
export function getLastNMonthKeys(monthKey: string, count: number): string[] {
  const keys: string[] = [monthKey]
  for (let i = 1; i < count; i++) {
    keys.unshift(getPreviousMonthKey(keys[0]))
  }
  return keys
}

export interface MonthlyTrendPoint {
  monthKey: string
  incomeCents: number
  expenseCents: number
}

/** Receitas/despesas confirmadas por mês, para os monthKeys informados (ordem preservada). */
export function computeMonthlyTrend(
  transactions: StatsTransaction[],
  monthKeys: string[],
): MonthlyTrendPoint[] {
  return monthKeys.map((monthKey) => ({
    monthKey,
    incomeCents: sumConfirmedByTypeAndMonth(transactions, 'income', monthKey),
    expenseCents: sumConfirmedByTypeAndMonth(transactions, 'expense', monthKey),
  }))
}

export interface CategoryDiffEntry {
  categoryId: string | null
  currentCents: number
  previousCents: number
  deltaCents: number
}

/** Compara o gasto por categoria entre dois meses (união das categorias de qualquer um dos dois). */
export function diffCategoryBreakdown(
  current: CategoryBreakdownEntry[],
  previous: CategoryBreakdownEntry[],
): CategoryDiffEntry[] {
  const currentMap = new Map(
    current.map((entry) => [entry.categoryId, entry.amountCents]),
  )
  const previousMap = new Map(
    previous.map((entry) => [entry.categoryId, entry.amountCents]),
  )
  const categoryIds = new Set([...currentMap.keys(), ...previousMap.keys()])

  return [...categoryIds]
    .map((categoryId) => {
      const currentCents = currentMap.get(categoryId) ?? 0
      const previousCents = previousMap.get(categoryId) ?? 0
      return {
        categoryId,
        currentCents,
        previousCents,
        deltaCents: currentCents - previousCents,
      }
    })
    .sort((a, b) => b.currentCents - a.currentCents)
}

type CsvTransaction = Pick<
  FinanceTransaction,
  | 'description'
  | 'amount_cents'
  | 'type'
  | 'status'
  | 'due_date'
  | 'category_id'
  | 'account_id'
>

const CSV_TYPE_LABELS: Record<FinanceTransactionType, string> = {
  income: 'Receita',
  expense: 'Despesa',
  transfer: 'Transferência',
}

const CSV_STATUS_LABELS: Record<FinanceTransactionStatus, string> = {
  planned: 'Planejada',
  confirmed: 'Confirmada',
}

function escapeCsvField(value: string): string {
  if (/[";\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/**
 * Monta um CSV das transações do período. Separador ";" (não ",") porque o
 * valor usa vírgula como separador decimal (padrão pt-BR) — é a convenção
 * que o Excel em português espera para não confundir decimal com coluna.
 */
export function buildTransactionsCsv(
  transactions: CsvTransaction[],
  categoryNameById: Map<string, string>,
  accountNameById: Map<string, string>,
): string {
  const header = [
    'Data',
    'Descrição',
    'Categoria',
    'Conta',
    'Tipo',
    'Status',
    'Valor (R$)',
  ]
  const rows = transactions.map((transaction) => [
    transaction.due_date,
    transaction.description,
    transaction.category_id
      ? (categoryNameById.get(transaction.category_id) ?? '')
      : '',
    accountNameById.get(transaction.account_id) ?? '',
    CSV_TYPE_LABELS[transaction.type],
    CSV_STATUS_LABELS[transaction.status],
    (transaction.amount_cents / 100).toFixed(2).replace('.', ','),
  ])
  return [header, ...rows]
    .map((row) => row.map(escapeCsvField).join(';'))
    .join('\n')
}
