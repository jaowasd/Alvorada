import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { BudgetForm } from '@/components/financas/BudgetForm'
import { BudgetItem } from '@/components/financas/BudgetItem'
import { PremiumGate } from '@/components/premium/PremiumGate'
import { Button } from '@/components/ui/Button'
import { MotionCard } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { PageFade } from '@/components/ui/PageFade'
import { useAuth } from '@/hooks/useAuth'
import { getLocalDateString } from '@/lib/date'
import { getMonthKey, groupExpensesByCategory } from '@/lib/financeStats'
import { fadeIn, staggerContainer } from '@/lib/motion'
import {
  archiveFinanceBudget,
  createFinanceBudget,
  fetchFinanceBudgets,
  updateFinanceBudget,
} from '@/lib/queries/financas/budgets'
import { fetchFinanceCategories } from '@/lib/queries/financas/categories'
import { fetchTransactions } from '@/lib/queries/financas/transactions'
import {
  toBudgetInput,
  type BudgetFormValues,
} from '@/lib/validation/financas/budget'
import type {
  FinanceBudget,
  FinanceCategory,
  FinanceTransaction,
} from '@/types/database'

const EMPTY_BUDGETS: FinanceBudget[] = []
const EMPTY_CATEGORIES: FinanceCategory[] = []
const EMPTY_TRANSACTIONS: FinanceTransaction[] = []

function OrcamentosContent() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<FinanceBudget | null>(null)

  const budgetsQuery = useQuery({
    queryKey: ['financeBudgets', user?.id],
    queryFn: () => fetchFinanceBudgets(user!.id),
    enabled: !!user,
  })
  const categoriesQuery = useQuery({
    queryKey: ['financeCategories'],
    queryFn: fetchFinanceCategories,
    enabled: !!user,
  })
  const transactionsQuery = useQuery({
    queryKey: ['financeTransactions', user?.id],
    queryFn: () => fetchTransactions(user!.id),
    enabled: !!user,
  })

  const budgets = budgetsQuery.data ?? EMPTY_BUDGETS
  const categories = categoriesQuery.data ?? EMPTY_CATEGORIES
  const transactions = transactionsQuery.data ?? EMPTY_TRANSACTIONS

  const expenseCategories = useMemo(
    () => categories.filter((category) => category.kind === 'expense'),
    [categories],
  )
  const categoriesById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  )
  const availableCategories = useMemo(
    () =>
      expenseCategories.filter(
        (category) =>
          !budgets.some((budget) => budget.category_id === category.id),
      ),
    [expenseCategories, budgets],
  )

  const monthKey = getMonthKey(getLocalDateString())
  const spentByCategory = useMemo(() => {
    const breakdown = groupExpensesByCategory(transactions, monthKey)
    return new Map(
      breakdown.map((entry) => [entry.categoryId, entry.amountCents]),
    )
  }, [transactions, monthKey])

  const invalidateBudgets = () =>
    queryClient.invalidateQueries({ queryKey: ['financeBudgets', user?.id] })

  const createMutation = useMutation({
    mutationFn: (values: BudgetFormValues) =>
      createFinanceBudget(user!.id, toBudgetInput(values)),
    onSuccess: () => {
      invalidateBudgets()
      closeModal()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: BudgetFormValues }) =>
      updateFinanceBudget(id, toBudgetInput(values)),
    onSuccess: () => {
      invalidateBudgets()
      closeModal()
    },
  })

  const archiveMutation = useMutation({
    mutationFn: (budget: FinanceBudget) => archiveFinanceBudget(budget.id),
    onSuccess: invalidateBudgets,
  })

  const closeModal = () => {
    setModalOpen(false)
    setEditingBudget(null)
  }

  const openCreateModal = () => {
    setEditingBudget(null)
    setModalOpen(true)
  }

  const openEditModal = (budget: FinanceBudget) => {
    setEditingBudget(budget)
    setModalOpen(true)
  }

  const handleArchive = (budget: FinanceBudget) => {
    const category = categoriesById.get(budget.category_id)
    if (
      window.confirm(
        `Excluir o orçamento de "${category?.name ?? 'categoria'}"?`,
      )
    ) {
      archiveMutation.mutate(budget)
    }
  }

  const handleFormSubmit = async (values: BudgetFormValues) => {
    if (editingBudget) {
      await updateMutation.mutateAsync({ id: editingBudget.id, values })
    } else {
      await createMutation.mutateAsync(values)
    }
  }

  const isLoading =
    budgetsQuery.isLoading ||
    categoriesQuery.isLoading ||
    transactionsQuery.isLoading
  const isError =
    budgetsQuery.isError || categoriesQuery.isError || transactionsQuery.isError

  return (
    <div>
      <div className="flex justify-end">
        <Button
          onClick={openCreateModal}
          disabled={availableCategories.length === 0}
          className="gap-1.5"
        >
          <Plus size={16} />
          Novo orçamento
        </Button>
      </div>

      <div className="mt-6">
        {isLoading && (
          <p
            role="status"
            aria-live="polite"
            className="text-sm text-[var(--color-text-muted)]"
          >
            Carregando orçamentos…
          </p>
        )}
        {isError && (
          <p className="text-error-500 text-sm">
            Não foi possível carregar seus orçamentos. Tente novamente.
          </p>
        )}
        {budgets.length === 0 && !isLoading && !isError && (
          <MotionCard
            variants={fadeIn}
            initial="hidden"
            animate="show"
            className="p-8 text-center text-sm text-[var(--color-text-muted)]"
          >
            Nenhum orçamento ainda. Defina um limite mensal por categoria para
            acompanhar seus gastos.
          </MotionCard>
        )}
        {budgets.length > 0 && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence>
              {budgets.map((budget) => (
                <BudgetItem
                  key={budget.id}
                  budget={budget}
                  category={categoriesById.get(budget.category_id)}
                  spentCents={spentByCategory.get(budget.category_id) ?? 0}
                  onEdit={openEditModal}
                  onArchive={handleArchive}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <Modal
            title={editingBudget ? 'Editar orçamento' : 'Novo orçamento'}
            onClose={closeModal}
          >
            <BudgetForm
              categories={
                editingBudget ? expenseCategories : availableCategories
              }
              initialBudget={editingBudget ?? undefined}
              onSubmit={handleFormSubmit}
              onCancel={closeModal}
            />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}

export function OrcamentosPage() {
  return (
    <PageFade className="mx-auto max-w-4xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-[var(--color-text)]">
          Orçamentos
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Defina um limite de gasto mensal por categoria.
        </p>
      </div>

      <div className="mt-6">
        <PremiumGate
          title="Orçamentos por categoria"
          description="Defina limites de gasto mensal por categoria e receba alertas visuais quando ultrapassar com o plano Premium."
        >
          <OrcamentosContent />
        </PremiumGate>
      </div>
    </PageFade>
  )
}
