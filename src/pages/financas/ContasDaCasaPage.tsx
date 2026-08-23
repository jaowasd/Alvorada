import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { MotionCard } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { PageFade } from '@/components/ui/PageFade'
import { RecurringTransactionForm } from '@/components/financas/RecurringTransactionForm'
import { RecurringTransactionItem } from '@/components/financas/RecurringTransactionItem'
import { useAuth } from '@/hooks/useAuth'
import { staggerContainer } from '@/lib/motion'
import { fetchFinanceAccounts } from '@/lib/queries/financas/accounts'
import { fetchFinanceCategories } from '@/lib/queries/financas/categories'
import {
  fetchTransactions,
  setTransactionStatus,
} from '@/lib/queries/financas/transactions'
import {
  archiveRecurringTransaction,
  createRecurringTransaction,
  fetchRecurringTransactions,
  generateMissingRecurringInstances,
  setRecurringTransactionActive,
  updateRecurringTransaction,
} from '@/lib/queries/financas/recurring'
import {
  toRecurringTransactionInput,
  type RecurringTransactionFormValues,
} from '@/lib/validation/financas/recurringTransaction'
import type {
  FinanceAccount,
  FinanceCategory,
  FinanceRecurringTransaction,
  FinanceTransaction,
} from '@/types/database'

const EMPTY_ACCOUNTS: FinanceAccount[] = []
const EMPTY_CATEGORIES: FinanceCategory[] = []
const EMPTY_TRANSACTIONS: FinanceTransaction[] = []
const EMPTY_RECURRING: FinanceRecurringTransaction[] = []

export function ContasDaCasaPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecurring, setEditingRecurring] =
    useState<FinanceRecurringTransaction | null>(null)
  const [generated, setGenerated] = useState(false)

  // Gera as instâncias faltantes sob demanda, ao abrir a página — não há cron.
  useEffect(() => {
    if (!user) return
    let cancelled = false
    generateMissingRecurringInstances(user.id)
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setGenerated(true)
      })
    return () => {
      cancelled = true
    }
  }, [user])

  const recurringQuery = useQuery({
    queryKey: ['financeRecurring', user?.id],
    queryFn: () => fetchRecurringTransactions(user!.id),
    enabled: !!user && generated,
  })
  const transactionsQuery = useQuery({
    queryKey: ['financeTransactions', user?.id],
    queryFn: () => fetchTransactions(user!.id),
    enabled: !!user && generated,
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

  const recurringList = recurringQuery.data ?? EMPTY_RECURRING
  const transactions = transactionsQuery.data ?? EMPTY_TRANSACTIONS
  const accounts = accountsQuery.data ?? EMPTY_ACCOUNTS
  const categories = categoriesQuery.data ?? EMPTY_CATEGORIES
  const categoriesById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  )

  const instancesByRecurring = useMemo(() => {
    const map = new Map<string, FinanceTransaction[]>()
    for (const transaction of transactions) {
      if (!transaction.recurring_transaction_id) continue
      const list = map.get(transaction.recurring_transaction_id) ?? []
      list.push(transaction)
      map.set(transaction.recurring_transaction_id, list)
    }
    for (const list of map.values()) {
      list.sort((a, b) => (a.due_date < b.due_date ? 1 : -1))
    }
    return map
  }, [transactions])

  const invalidateRecurring = () =>
    queryClient.invalidateQueries({ queryKey: ['financeRecurring', user?.id] })
  const invalidateTransactions = () =>
    queryClient.invalidateQueries({
      queryKey: ['financeTransactions', user?.id],
    })

  const createMutation = useMutation({
    mutationFn: (values: RecurringTransactionFormValues) =>
      createRecurringTransaction(user!.id, toRecurringTransactionInput(values)),
    onSuccess: () => {
      invalidateRecurring()
      closeModal()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string
      values: RecurringTransactionFormValues
    }) => updateRecurringTransaction(id, toRecurringTransactionInput(values)),
    onSuccess: () => {
      invalidateRecurring()
      closeModal()
    },
  })

  const toggleActiveMutation = useMutation({
    mutationFn: (recurring: FinanceRecurringTransaction) =>
      setRecurringTransactionActive(recurring.id, !recurring.is_active),
    onSuccess: invalidateRecurring,
  })

  const archiveMutation = useMutation({
    mutationFn: (recurring: FinanceRecurringTransaction) =>
      archiveRecurringTransaction(recurring.id),
    onSuccess: invalidateRecurring,
  })

  const markPaidMutation = useMutation({
    mutationFn: (transaction: FinanceTransaction) =>
      setTransactionStatus(transaction.id, 'confirmed'),
    onSuccess: invalidateTransactions,
  })

  const closeModal = () => {
    setModalOpen(false)
    setEditingRecurring(null)
  }

  const openCreateModal = () => {
    setEditingRecurring(null)
    setModalOpen(true)
  }

  const openEditModal = (recurring: FinanceRecurringTransaction) => {
    setEditingRecurring(recurring)
    setModalOpen(true)
  }

  const handleArchive = (recurring: FinanceRecurringTransaction) => {
    if (
      window.confirm(
        `Arquivar a conta da casa "${recurring.description}"? O histórico já gerado não é apagado.`,
      )
    ) {
      archiveMutation.mutate(recurring)
    }
  }

  const handleFormSubmit = async (values: RecurringTransactionFormValues) => {
    if (editingRecurring) {
      await updateMutation.mutateAsync({ id: editingRecurring.id, values })
    } else {
      await createMutation.mutateAsync(values)
    }
  }

  const isLoading =
    !generated || recurringQuery.isLoading || transactionsQuery.isLoading
  const isError = recurringQuery.isError || transactionsQuery.isError

  return (
    <PageFade className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--color-text)]">
            Contas da Casa
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Aluguel, energia, água, internet e outras contas recorrentes.
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          className="gap-1.5"
          disabled={accounts.length === 0}
        >
          <Plus size={16} /> Nova conta
        </Button>
      </div>

      {accounts.length === 0 && !accountsQuery.isLoading && (
        <p className="mt-4 text-sm text-[var(--color-text-muted)]">
          Crie uma conta em "Contas" antes de cadastrar contas da casa.
        </p>
      )}

      <div className="mt-6">
        {isLoading && (
          <p className="text-sm text-[var(--color-text-muted)]">
            Carregando contas da casa…
          </p>
        )}
        {isError && (
          <p className="text-error-500 text-sm">
            Não foi possível carregar suas contas da casa. Tente novamente.
          </p>
        )}
        {!isLoading && !isError && recurringList.length === 0 && (
          <MotionCard
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 text-center text-sm text-[var(--color-text-muted)]"
          >
            Nenhuma conta da casa ainda. Cadastre o aluguel, energia ou outra
            conta recorrente para começar.
          </MotionCard>
        )}
        {recurringList.length > 0 && (
          <MotionCard
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="divide-y divide-[var(--color-border)] overflow-hidden py-0"
          >
            {recurringList.map((recurring) => {
              const instances = instancesByRecurring.get(recurring.id) ?? []
              return (
                <RecurringTransactionItem
                  key={recurring.id}
                  recurring={recurring}
                  category={
                    recurring.category_id
                      ? categoriesById.get(recurring.category_id)
                      : undefined
                  }
                  currentInstance={instances[0] ?? null}
                  previousInstance={instances[1] ?? null}
                  onMarkPaid={(t) => markPaidMutation.mutate(t)}
                  onEdit={openEditModal}
                  onToggleActive={(r) => toggleActiveMutation.mutate(r)}
                  onArchive={handleArchive}
                />
              )
            })}
          </MotionCard>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <Modal
            title={
              editingRecurring ? 'Editar conta da casa' : 'Nova conta da casa'
            }
            onClose={closeModal}
          >
            <RecurringTransactionForm
              accounts={accounts}
              categories={categories}
              initialRecurring={editingRecurring ?? undefined}
              onSubmit={handleFormSubmit}
              onCancel={closeModal}
            />
          </Modal>
        )}
      </AnimatePresence>
    </PageFade>
  )
}
