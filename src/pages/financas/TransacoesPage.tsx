import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence } from 'framer-motion'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { MotionCard } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { PageFade } from '@/components/ui/PageFade'
import { TransactionForm } from '@/components/financas/TransactionForm'
import { TransactionItem } from '@/components/financas/TransactionItem'
import { useAuth } from '@/hooks/useAuth'
import { fadeIn, staggerContainer } from '@/lib/motion'
import { fetchFinanceAccounts } from '@/lib/queries/financas/accounts'
import { fetchFinanceCategories } from '@/lib/queries/financas/categories'
import {
  createReversalTransaction,
  createTransaction,
  duplicateTransaction,
  fetchTransactions,
  setTransactionStatus,
  softDeleteTransaction,
  updateTransaction,
} from '@/lib/queries/financas/transactions'
import {
  toTransactionInput,
  type TransactionFormValues,
} from '@/lib/validation/financas/transaction'
import type {
  FinanceAccount,
  FinanceCategory,
  FinanceTransaction,
} from '@/types/database'

const EMPTY_ACCOUNTS: FinanceAccount[] = []
const EMPTY_CATEGORIES: FinanceCategory[] = []

export function TransacoesPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] =
    useState<FinanceTransaction | null>(null)
  const [search, setSearch] = useState('')

  const transactionsQuery = useQuery({
    queryKey: ['financeTransactions', user?.id],
    queryFn: () => fetchTransactions(user!.id),
    enabled: !!user,
  })
  const accountsQuery = useQuery({
    queryKey: ['financeAccounts', user?.id],
    queryFn: () => fetchFinanceAccounts(user!.id),
    enabled: !!user,
  })
  const categoriesQuery = useQuery({
    queryKey: ['financeCategories'],
    queryFn: fetchFinanceCategories,
    enabled: !!user,
  })

  const accounts = accountsQuery.data ?? EMPTY_ACCOUNTS
  const categories = categoriesQuery.data ?? EMPTY_CATEGORIES
  const accountsById = useMemo(
    () => new Map(accounts.map((account) => [account.id, account])),
    [accounts],
  )
  const categoriesById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  )

  const filteredTransactions = useMemo(
    () =>
      (transactionsQuery.data ?? []).filter((transaction) =>
        transaction.description
          .toLowerCase()
          .includes(search.trim().toLowerCase()),
      ),
    [transactionsQuery.data, search],
  )

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: ['financeTransactions', user?.id],
    })

  const createMutation = useMutation({
    mutationFn: (values: TransactionFormValues) =>
      createTransaction(user!.id, toTransactionInput(values)),
    onSuccess: () => {
      invalidate()
      closeModal()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string
      values: TransactionFormValues
    }) => updateTransaction(id, toTransactionInput(values)),
    onSuccess: () => {
      invalidate()
      closeModal()
    },
  })

  const toggleStatusMutation = useMutation({
    mutationFn: (transaction: FinanceTransaction) =>
      setTransactionStatus(
        transaction.id,
        transaction.status === 'confirmed' ? 'planned' : 'confirmed',
      ),
    onSuccess: invalidate,
  })

  const duplicateMutation = useMutation({
    mutationFn: (transaction: FinanceTransaction) =>
      duplicateTransaction(transaction.id),
    onSuccess: invalidate,
  })

  const reverseMutation = useMutation({
    mutationFn: (transaction: FinanceTransaction) =>
      createReversalTransaction(transaction),
    onSuccess: invalidate,
  })

  const deleteMutation = useMutation({
    mutationFn: (transaction: FinanceTransaction) =>
      softDeleteTransaction(transaction.id),
    onSuccess: invalidate,
  })

  const closeModal = () => {
    setModalOpen(false)
    setEditingTransaction(null)
  }

  const openCreateModal = () => {
    setEditingTransaction(null)
    setModalOpen(true)
  }

  const openEditModal = (transaction: FinanceTransaction) => {
    setEditingTransaction(transaction)
    setModalOpen(true)
  }

  const handleDelete = (transaction: FinanceTransaction) => {
    if (window.confirm(`Excluir a transação "${transaction.description}"?`)) {
      deleteMutation.mutate(transaction)
    }
  }

  const handleFormSubmit = async (values: TransactionFormValues) => {
    if (editingTransaction) {
      await updateMutation.mutateAsync({ id: editingTransaction.id, values })
    } else {
      await createMutation.mutateAsync(values)
    }
  }

  const isLoading = transactionsQuery.isLoading || accountsQuery.isLoading
  const isError = transactionsQuery.isError || accountsQuery.isError

  return (
    <PageFade className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--color-text)]">
            Transações
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Suas receitas, despesas e transferências.
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          className="gap-1.5"
          disabled={accounts.length === 0}
        >
          <Plus size={16} /> Nova
        </Button>
      </div>

      {accounts.length === 0 && !accountsQuery.isLoading && (
        <p className="mt-4 text-sm text-[var(--color-text-muted)]">
          Crie uma conta em "Contas" antes de lançar transações.
        </p>
      )}

      <div className="relative mt-6 max-w-xs">
        <Search
          size={16}
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[var(--color-text-muted)]"
        />
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar transação…"
          className="focus:border-primary-500 focus:ring-primary-500/30 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pr-3 pl-9 text-sm text-[var(--color-text)] transition outline-none focus:ring-2"
        />
      </div>

      <div className="mt-6">
        {isLoading && (
          <p
            role="status"
            aria-live="polite"
            className="text-sm text-[var(--color-text-muted)]"
          >
            Carregando transações…
          </p>
        )}
        {isError && (
          <p className="text-error-500 text-sm">
            Não foi possível carregar suas transações. Tente novamente.
          </p>
        )}
        {transactionsQuery.data?.length === 0 && (
          <MotionCard
            variants={fadeIn}
            initial="hidden"
            animate="show"
            className="p-8 text-center text-sm text-[var(--color-text-muted)]"
          >
            Nenhuma transação ainda. Crie a primeira para começar.
          </MotionCard>
        )}
        {transactionsQuery.data &&
          transactionsQuery.data.length > 0 &&
          filteredTransactions.length === 0 && (
            <MotionCard
              variants={fadeIn}
              initial="hidden"
              animate="show"
              className="p-8 text-center text-sm text-[var(--color-text-muted)]"
            >
              Nenhuma transação encontrada para "{search}".
            </MotionCard>
          )}
        {filteredTransactions.length > 0 && (
          <MotionCard
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="divide-y divide-[var(--color-border)] overflow-hidden py-0"
          >
            <AnimatePresence>
              {filteredTransactions.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  category={
                    transaction.category_id
                      ? categoriesById.get(transaction.category_id)
                      : undefined
                  }
                  account={accountsById.get(transaction.account_id)}
                  relatedAccount={
                    transaction.related_account_id
                      ? accountsById.get(transaction.related_account_id)
                      : undefined
                  }
                  onToggleStatus={(t) => toggleStatusMutation.mutate(t)}
                  onEdit={openEditModal}
                  onDuplicate={(t) => duplicateMutation.mutate(t)}
                  onReverse={(t) => reverseMutation.mutate(t)}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </MotionCard>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <Modal
            title={editingTransaction ? 'Editar transação' : 'Nova transação'}
            onClose={closeModal}
          >
            <TransactionForm
              accounts={accounts}
              categories={categories}
              initialTransaction={editingTransaction ?? undefined}
              onSubmit={handleFormSubmit}
              onCancel={closeModal}
            />
          </Modal>
        )}
      </AnimatePresence>
    </PageFade>
  )
}
