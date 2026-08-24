import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { MotionCard } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { PageFade } from '@/components/ui/PageFade'
import { GoalForm } from '@/components/goals/GoalForm'
import { GoalItem } from '@/components/goals/GoalItem'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/cn'
import { getLocalDateString } from '@/lib/date'
import { interactiveStates } from '@/lib/interactive-states'
import { fadeIn, staggerContainer } from '@/lib/motion'
import {
  addProgressEntry,
  createGoal,
  fetchAllProgressEntries,
  fetchGoals,
  setGoalStatus,
  updateGoal,
} from '@/lib/queries/goals'
import { toGoalInput, type GoalFormValues } from '@/lib/validation/goal'
import type { Goal, GoalProgressEntry, GoalStatus } from '@/types/database'

const EMPTY_GOALS: Goal[] = []
const EMPTY_ENTRIES: GoalProgressEntry[] = []

const STATUS_TABS: { value: GoalStatus; label: string }[] = [
  { value: 'active', label: 'Ativas' },
  { value: 'completed', label: 'Concluídas' },
  { value: 'archived', label: 'Arquivadas' },
]

export function MetasPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const today = getLocalDateString()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [statusFilter, setStatusFilter] = useState<GoalStatus>('active')

  const goalsQuery = useQuery({
    queryKey: ['goals', user?.id],
    queryFn: () => fetchGoals(user!.id),
    enabled: !!user,
  })
  const goals = goalsQuery.data ?? EMPTY_GOALS

  const entriesQuery = useQuery({
    queryKey: ['goalProgressEntries', user?.id],
    queryFn: () => fetchAllProgressEntries(user!.id),
    enabled: !!user,
  })
  const entries = entriesQuery.data ?? EMPTY_ENTRIES

  const invalidateGoals = () =>
    queryClient.invalidateQueries({ queryKey: ['goals', user?.id] })
  const invalidateEntries = () =>
    queryClient.invalidateQueries({
      queryKey: ['goalProgressEntries', user?.id],
    })

  const createMutation = useMutation({
    mutationFn: (values: GoalFormValues) =>
      createGoal(user!.id, toGoalInput(values)),
    onSuccess: () => {
      invalidateGoals()
      closeModal()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: GoalFormValues }) =>
      updateGoal(id, toGoalInput(values)),
    onSuccess: () => {
      invalidateGoals()
      closeModal()
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: GoalStatus }) =>
      setGoalStatus(id, status),
    onSuccess: invalidateGoals,
  })

  const progressMutation = useMutation({
    mutationFn: ({
      goalId,
      amount,
      notes,
    }: {
      goalId: string
      amount: number
      notes: string | null
    }) =>
      addProgressEntry(user!.id, goalId, {
        amount,
        entry_date: today,
        notes,
      }),
    onSuccess: invalidateEntries,
  })

  const closeModal = () => {
    setModalOpen(false)
    setEditingGoal(null)
  }

  const openCreateModal = () => {
    setEditingGoal(null)
    setModalOpen(true)
  }

  const openEditModal = (goal: Goal) => {
    setEditingGoal(goal)
    setModalOpen(true)
  }

  const handleFormSubmit = async (values: GoalFormValues) => {
    if (editingGoal) {
      await updateMutation.mutateAsync({ id: editingGoal.id, values })
    } else {
      await createMutation.mutateAsync(values)
    }
  }

  const filteredGoals = useMemo(
    () => goals.filter((goal) => goal.status === statusFilter),
    [goals, statusFilter],
  )

  return (
    <PageFade className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--color-text)]">
            Metas
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Objetivos de médio prazo — ler livros, correr km, o que for.
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-1.5">
          <Plus size={16} /> Nova
        </Button>
      </div>

      <div className="mt-6 flex gap-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatusFilter(tab.value)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium',
              interactiveStates,
              statusFilter === tab.value
                ? 'bg-primary-500/10 text-primary-600'
                : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {goalsQuery.isLoading && (
          <p
            role="status"
            aria-live="polite"
            className="text-sm text-[var(--color-text-muted)]"
          >
            Carregando metas…
          </p>
        )}
        {goalsQuery.isError && (
          <p className="text-error-500 text-sm">
            Não foi possível carregar suas metas. Tente novamente.
          </p>
        )}
        {!goalsQuery.isLoading &&
          !goalsQuery.isError &&
          filteredGoals.length === 0 && (
            <MotionCard
              variants={fadeIn}
              initial="hidden"
              animate="show"
              className="p-8 text-center text-sm text-[var(--color-text-muted)]"
            >
              {statusFilter === 'active'
                ? 'Nenhuma meta ativa ainda. Crie a primeira.'
                : statusFilter === 'completed'
                  ? 'Nenhuma meta concluída ainda.'
                  : 'Nenhuma meta arquivada.'}
            </MotionCard>
          )}
        {filteredGoals.length > 0 && (
          <MotionCard
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="divide-y divide-[var(--color-border)] overflow-hidden py-0"
          >
            <AnimatePresence>
              {filteredGoals.map((goal) => (
                <GoalItem
                  key={goal.id}
                  goal={goal}
                  entries={entries}
                  onEdit={openEditModal}
                  onSetStatus={(g, status) =>
                    statusMutation.mutate({ id: g.id, status })
                  }
                  onAddProgress={(g, amount, notes) =>
                    progressMutation.mutate({ goalId: g.id, amount, notes })
                  }
                />
              ))}
            </AnimatePresence>
          </MotionCard>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <Modal
            title={editingGoal ? 'Editar meta' : 'Nova meta'}
            onClose={closeModal}
          >
            <GoalForm
              initialGoal={editingGoal ?? undefined}
              onSubmit={handleFormSubmit}
              onCancel={closeModal}
            />
          </Modal>
        )}
      </AnimatePresence>
    </PageFade>
  )
}
