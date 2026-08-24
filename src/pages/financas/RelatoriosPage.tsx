import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, TrendingDown, TrendingUp } from 'lucide-react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts'
import { PremiumGate } from '@/components/premium/PremiumGate'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageFade } from '@/components/ui/PageFade'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/cn'
import { getLocalDateString } from '@/lib/date'
import { downloadFile } from '@/lib/exportUserData'
import {
  buildTransactionsCsv,
  computeMonthlyTrend,
  diffCategoryBreakdown,
  getLastNMonthKeys,
  getMonthKey,
  groupExpensesByCategory,
} from '@/lib/financeStats'
import { centsToBRL } from '@/lib/money'
import { fetchFinanceAccounts } from '@/lib/queries/financas/accounts'
import { fetchFinanceCategories } from '@/lib/queries/financas/categories'
import { fetchTransactions } from '@/lib/queries/financas/transactions'
import type {
  FinanceAccount,
  FinanceCategory,
  FinanceTransaction,
} from '@/types/database'

const EMPTY_ACCOUNTS: FinanceAccount[] = []
const EMPTY_CATEGORIES: FinanceCategory[] = []
const EMPTY_TRANSACTIONS: FinanceTransaction[] = []
const MONTHS_COUNT = 6

function monthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(
    new Date(year, month - 1, 1),
  )
}

function TrendTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="shadow-popover rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs">
      <p className="font-medium text-[var(--color-text)]">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} style={{ color: entry.color }}>
          {entry.name}: {centsToBRL(Number(entry.value) * 100)}
        </p>
      ))}
    </div>
  )
}

function RelatoriosContent() {
  const { user } = useAuth()

  const transactionsQuery = useQuery({
    queryKey: ['financeTransactions', user?.id],
    queryFn: () => fetchTransactions(user!.id),
    enabled: !!user,
  })
  const categoriesQuery = useQuery({
    queryKey: ['financeCategories'],
    queryFn: fetchFinanceCategories,
    enabled: !!user,
  })
  const accountsQuery = useQuery({
    queryKey: ['financeAccounts', user?.id],
    queryFn: () => fetchFinanceAccounts(user!.id),
    enabled: !!user,
  })

  const transactions = transactionsQuery.data ?? EMPTY_TRANSACTIONS
  const categories = categoriesQuery.data ?? EMPTY_CATEGORIES
  const accounts = accountsQuery.data ?? EMPTY_ACCOUNTS

  const categoriesById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  )
  const categoryNameById = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  )
  const accountNameById = useMemo(
    () => new Map(accounts.map((account) => [account.id, account.name])),
    [accounts],
  )

  const today = getLocalDateString()
  const monthKey = getMonthKey(today)
  const monthKeys = useMemo(
    () => getLastNMonthKeys(monthKey, MONTHS_COUNT),
    [monthKey],
  )
  const previousMonthKey = monthKeys[monthKeys.length - 2] ?? monthKey

  const trend = useMemo(
    () =>
      computeMonthlyTrend(transactions, monthKeys).map((point) => ({
        label: monthLabel(point.monthKey),
        Receitas: point.incomeCents / 100,
        Despesas: point.expenseCents / 100,
      })),
    [transactions, monthKeys],
  )

  const categoryDiff = useMemo(
    () =>
      diffCategoryBreakdown(
        groupExpensesByCategory(transactions, monthKey),
        groupExpensesByCategory(transactions, previousMonthKey),
      ),
    [transactions, monthKey, previousMonthKey],
  )

  const isLoading =
    transactionsQuery.isLoading ||
    categoriesQuery.isLoading ||
    accountsQuery.isLoading

  const handleExportCsv = () => {
    const monthTransactions = transactions.filter(
      (transaction) => getMonthKey(transaction.due_date) === monthKey,
    )
    const csv = buildTransactionsCsv(
      monthTransactions,
      categoryNameById,
      accountNameById,
    )
    downloadFile(
      csv,
      `alvorada-transacoes-${monthKey}.csv`,
      'text/csv;charset=utf-8',
    )
  }

  if (isLoading) {
    return (
      <p
        role="status"
        aria-live="polite"
        className="text-sm text-[var(--color-text-muted)]"
      >
        Carregando relatórios…
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-text)]">
              Tendência mensal
            </h2>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              Receitas e despesas confirmadas nos últimos {MONTHS_COUNT} meses.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={handleExportCsv}
            className="gap-1.5"
          >
            <Download size={16} />
            Exportar CSV do mês
          </Button>
        </div>
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart
              data={trend}
              margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="var(--color-border)"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="label"
                tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                axisLine={{ stroke: 'var(--color-border)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <Tooltip content={TrendTooltip} />
              <Legend
                wrapperStyle={{
                  fontSize: 12,
                  color: 'var(--color-text-muted)',
                }}
              />
              <Line
                type="monotone"
                dataKey="Receitas"
                stroke="var(--color-success-600)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="Despesas"
                stroke="var(--color-error-500)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-sm font-semibold text-[var(--color-text)]">
          Comparação por categoria
        </h2>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          Gasto deste mês comparado ao mês anterior.
        </p>
        {categoryDiff.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--color-text-muted)]">
            Nenhuma despesa confirmada nesses dois meses ainda.
          </p>
        ) : (
          <div className="mt-4 flex flex-col divide-y divide-[var(--color-border)]">
            {categoryDiff.map((entry) => {
              const category = entry.categoryId
                ? categoriesById.get(entry.categoryId)
                : undefined
              const isUp = entry.deltaCents > 0
              return (
                <div
                  key={entry.categoryId ?? 'sem-categoria'}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <span className="text-sm font-medium text-[var(--color-text)]">
                    {category?.name ?? 'Sem categoria'}
                  </span>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-[var(--color-text)] tabular-nums">
                      {centsToBRL(entry.currentCents)}
                    </span>
                    {entry.deltaCents !== 0 && (
                      <span
                        className={cn(
                          'flex items-center gap-0.5 text-xs font-medium',
                          isUp ? 'text-error-500' : 'text-success-600',
                        )}
                      >
                        {isUp ? (
                          <TrendingUp size={12} />
                        ) : (
                          <TrendingDown size={12} />
                        )}
                        {centsToBRL(Math.abs(entry.deltaCents))}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}

export function RelatoriosPage() {
  return (
    <PageFade className="mx-auto max-w-3xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-[var(--color-text)]">
          Relatórios
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Tendência de receitas e despesas, comparação entre categorias e
          exportação em CSV.
        </p>
      </div>

      <div className="mt-6">
        <PremiumGate
          title="Relatórios financeiros avançados"
          description="Veja tendência mensal, comparação entre categorias e exporte suas transações em CSV com o plano Premium."
        >
          <RelatoriosContent />
        </PremiumGate>
      </div>
    </PageFade>
  )
}
