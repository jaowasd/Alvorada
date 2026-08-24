import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  Plus,
  Scale,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, MotionCard } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { PageFade } from '@/components/ui/PageFade'
import { AccountForm } from '@/components/financas/AccountForm'
import { FinanceStatTile } from '@/components/financas/FinanceStatTile'
import { TransactionForm } from '@/components/financas/TransactionForm'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/cn'
import { getLocalDateString } from '@/lib/date'
import { calculateTotalBalanceCents } from '@/lib/financeBalance'
import {
  getMonthKey,
  getPreviousMonthKey,
  groupExpensesByCategory,
  sumConfirmedByTypeAndMonth,
} from '@/lib/financeStats'
import { EASE_SMOOTH, staggerContainer } from '@/lib/motion'
import { centsToBRL } from '@/lib/money'
import {
  createFinanceAccount,
  fetchFinanceAccounts,
} from '@/lib/queries/financas/accounts'
import { fetchFinanceCategories } from '@/lib/queries/financas/categories'
import {
  createTransaction,
  fetchTransactions,
  setTransactionStatus,
} from '@/lib/queries/financas/transactions'
import {
  toAccountInput,
  type AccountFormValues,
} from '@/lib/validation/financas/account'
import {
  toTransactionInput,
  type TransactionFormValues,
} from '@/lib/validation/financas/transaction'
import type {
  FinanceAccount,
  FinanceCategory,
  FinanceTransaction,
  FinanceTransactionType,
} from '@/types/database'

const EMPTY_ACCOUNTS: FinanceAccount[] = []
const EMPTY_CATEGORIES: FinanceCategory[] = []
const EMPTY_TRANSACTIONS: FinanceTransaction[] = []

type QuickAction = 'income' | 'expense' | 'account' | null

export function FinancasDashboardPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [quickAction, setQuickAction] = useState<QuickAction>(null)

  const accountsQuery = useQuery({
    queryKey: ['financeAccounts', user?.id],
    queryFn: () => fetchFinanceAccounts(user!.id),
    enabled: !!user,
  })
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

  const accounts = accountsQuery.data ?? EMPTY_ACCOUNTS
  const transactions = transactionsQuery.data ?? EMPTY_TRANSACTIONS
  const categories = categoriesQuery.data ?? EMPTY_CATEGORIES
  const categoriesById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  )

  const today = getLocalDateString()
  const monthKey = getMonthKey(today)
  const previousMonthKey = getPreviousMonthKey(monthKey)

  const totalBalance = useMemo(
    () => calculateTotalBalanceCents(accounts, transactions),
    [accounts, transactions],
  )
  const incomeThisMonth = useMemo(
    () => sumConfirmedByTypeAndMonth(transactions, 'income', monthKey),
    [transactions, monthKey],
  )
  const expensesThisMonth = useMemo(
    () => sumConfirmedByTypeAndMonth(transactions, 'expense', monthKey),
    [transactions, monthKey],
  )
  const expensesPreviousMonth = useMemo(
    () => sumConfirmedByTypeAndMonth(transactions, 'expense', previousMonthKey),
    [transactions, previousMonthKey],
  )
  const result = incomeThisMonth - expensesThisMonth
  const expenseDelta = expensesThisMonth - expensesPreviousMonth

  const categoryBreakdown = useMemo(
    () => groupExpensesByCategory(transactions, monthKey),
    [transactions, monthKey],
  )
  const maxCategoryAmount = categoryBreakdown[0]?.amountCents ?? 0

  const upcoming = useMemo(
    () =>
      transactions
        .filter((transaction) => transaction.status === 'planned')
        .sort((a, b) => (a.due_date < b.due_date ? -1 : 1))
        .slice(0, 6),
    [transactions],
  )

  const invalidateTransactions = () =>
    queryClient.invalidateQueries({
      queryKey: ['financeTransactions', user?.id],
    })
  const invalidateAccounts = () =>
    queryClient.invalidateQueries({ queryKey: ['financeAccounts', user?.id] })

  const createTransactionMutation = useMutation({
    mutationFn: (values: TransactionFormValues) =>
      createTransaction(user!.id, toTransactionInput(values)),
    onSuccess: () => {
      invalidateTransactions()
      setQuickAction(null)
    },
  })

  const createAccountMutation = useMutation({
    mutationFn: (values: AccountFormValues) =>
      createFinanceAccount(user!.id, toAccountInput(values)),
    onSuccess: () => {
      invalidateAccounts()
      setQuickAction(null)
    },
  })

  const markPaidMutation = useMutation({
    mutationFn: (transaction: FinanceTransaction) =>
      setTransactionStatus(transaction.id, 'confirmed'),
    onSuccess: invalidateTransactions,
  })

  const isLoading =
    accountsQuery.isLoading ||
    transactionsQuery.isLoading ||
    categoriesQuery.isLoading
  const isError =
    accountsQuery.isError ||
    transactionsQuery.isError ||
    categoriesQuery.isError

  const quickActionType: FinanceTransactionType | undefined =
    quickAction === 'income' || quickAction === 'expense'
      ? quickAction
      : undefined

  return (
    <PageFade className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--color-text)]">
            Finanças
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Sua visão geral do mês.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => setQuickAction('income')}
            disabled={accounts.length === 0}
            className="gap-1.5"
          >
            <Plus size={16} /> Receita
          </Button>
          <Button
            variant="secondary"
            onClick={() => setQuickAction('expense')}
            disabled={accounts.length === 0}
            className="gap-1.5"
          >
            <Plus size={16} /> Despesa
          </Button>
          <Button onClick={() => setQuickAction('account')} className="gap-1.5">
            <Wallet size={16} /> Conta
          </Button>
        </div>
      </div>

      {isLoading && (
        <p
          role="status"
          aria-live="polite"
          className="mt-8 text-sm text-[var(--color-text-muted)]"
        >
          Carregando seu resumo financeiro…
        </p>
      )}
      {isError && (
        <p className="text-error-500 mt-8 text-sm">
          Não foi possível carregar suas finanças. Tente novamente.
        </p>
      )}

      {!isLoading && !isError && (
        <>
          <Card className="mt-6 flex flex-col divide-y divide-[var(--color-border)] overflow-hidden py-0 sm:flex-row sm:divide-x sm:divide-y-0">
            <FinanceStatTile
              label="Saldo atual"
              valueCents={totalBalance}
              icon={Wallet}
              tone={totalBalance < 0 ? 'error' : 'default'}
            />
            <FinanceStatTile
              label="Receitas do mês"
              valueCents={incomeThisMonth}
              icon={TrendingUp}
              tone="success"
            />
            <FinanceStatTile
              label="Despesas do mês"
              valueCents={expensesThisMonth}
              icon={TrendingDown}
              tone="error"
            />
            <FinanceStatTile
              label="Resultado do mês"
              valueCents={result}
              icon={Scale}
              tone={result < 0 ? 'error' : 'success'}
            />
          </Card>

          {expensesPreviousMonth > 0 && (
            <Card className="mt-6 p-4">
              <p className="text-sm text-[var(--color-text)]">
                Você{' '}
                <span
                  className={cn(
                    'font-semibold',
                    expenseDelta > 0 ? 'text-error-500' : 'text-success-600',
                  )}
                >
                  {expenseDelta === 0
                    ? 'gastou o mesmo valor'
                    : `gastou ${centsToBRL(Math.abs(expenseDelta))} ${expenseDelta > 0 ? 'a mais' : 'a menos'}`}
                </span>{' '}
                este mês em comparação ao mês anterior.
              </p>
            </Card>
          )}

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <section>
              <h2 className="mb-2 text-sm font-semibold text-[var(--color-text)]">
                Gastos por categoria
              </h2>
              {categoryBreakdown.length === 0 ? (
                <Card className="p-6 text-center text-sm text-[var(--color-text-muted)]">
                  Nenhuma despesa confirmada este mês ainda.
                </Card>
              ) : (
                <Card className="p-4">
                  <div className="flex flex-col gap-3">
                    {categoryBreakdown.map((entry) => {
                      const category = entry.categoryId
                        ? categoriesById.get(entry.categoryId)
                        : undefined
                      const percent =
                        maxCategoryAmount > 0
                          ? (entry.amountCents / maxCategoryAmount) * 100
                          : 0
                      return (
                        <div key={entry.categoryId ?? 'sem-categoria'}>
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-[var(--color-text)]">
                              {category?.name ?? 'Sem categoria'}
                            </span>
                            <span className="text-[var(--color-text-muted)]">
                              {centsToBRL(entry.amountCents)}
                            </span>
                          </div>
                          <div className="mt-1 h-2 overflow-hidden rounded-full bg-[var(--color-bg)]">
                            <motion.div
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: percent / 100 }}
                              transition={{
                                duration: 0.5,
                                ease: EASE_SMOOTH,
                              }}
                              className="h-full w-full origin-left rounded-full"
                              style={{
                                backgroundColor: category?.color ?? '#78716c',
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              )}
            </section>

            <section>
              <h2 className="mb-2 text-sm font-semibold text-[var(--color-text)]">
                Contas a vencer
              </h2>
              {upcoming.length === 0 ? (
                <Card className="p-6 text-center text-sm text-[var(--color-text-muted)]">
                  Nada previsto por enquanto.
                </Card>
              ) : (
                <MotionCard
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                  className="divide-y divide-[var(--color-border)] overflow-hidden py-0"
                >
                  {upcoming.map((transaction) => {
                    const late = transaction.due_date < today
                    return (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between gap-3 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[var(--color-text)]">
                            {transaction.description}
                          </p>
                          <p
                            className={cn(
                              'text-xs text-[var(--color-text-muted)]',
                              late && 'text-error-500 font-medium',
                            )}
                          >
                            {late ? 'Atrasada · ' : 'Vence '}
                            {new Date(
                              `${transaction.due_date}T00:00:00`,
                            ).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="text-sm font-semibold text-[var(--color-text)] tabular-nums">
                            {centsToBRL(transaction.amount_cents)}
                          </span>
                          <button
                            type="button"
                            onClick={() => markPaidMutation.mutate(transaction)}
                            className="text-primary-600 text-xs font-medium hover:underline"
                          >
                            Pagar
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </MotionCard>
              )}
              {upcoming.some((t) => t.due_date < today) && (
                <p className="text-error-500 mt-2 flex items-center gap-1.5 text-xs font-medium">
                  <AlertTriangle size={13} /> Você tem contas atrasadas.
                </p>
              )}
            </section>
          </div>
        </>
      )}

      <AnimatePresence>
        {(quickAction === 'income' || quickAction === 'expense') && (
          <Modal
            title={quickAction === 'income' ? 'Nova receita' : 'Nova despesa'}
            onClose={() => setQuickAction(null)}
          >
            <TransactionForm
              accounts={accounts}
              categories={categories}
              defaultType={quickActionType}
              lockType
              onSubmit={async (values) => {
                await createTransactionMutation.mutateAsync(values)
              }}
              onCancel={() => setQuickAction(null)}
            />
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {quickAction === 'account' && (
          <Modal title="Nova conta" onClose={() => setQuickAction(null)}>
            <AccountForm
              onSubmit={async (values) => {
                await createAccountMutation.mutateAsync(values)
              }}
              onCancel={() => setQuickAction(null)}
            />
          </Modal>
        )}
      </AnimatePresence>
    </PageFade>
  )
}
