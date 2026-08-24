import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { MotionCard } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { PageFade } from '@/components/ui/PageFade'
import { RoutineStepForm } from '@/components/routine/RoutineStepForm'
import { SortableStepItem } from '@/components/routine/SortableStepItem'
import { useAuth } from '@/hooks/useAuth'
import { getLocalDateString } from '@/lib/date'
import { fetchCategories } from '@/lib/queries/categories'
import {
  completeRoutineStep,
  createRoutineStep,
  fetchCompletionsForDate,
  fetchOrCreateActiveRoutine,
  fetchRoutineSteps,
  reorderRoutineSteps,
  softDeleteRoutineStep,
  uncompleteRoutineStep,
  updateRoutineStep,
} from '@/lib/queries/routines'
import {
  toRoutineStepInput,
  type RoutineStepFormValues,
} from '@/lib/validation/routineStep'
import type { Category, RoutineStep } from '@/types/database'

const EMPTY_CATEGORIES: Category[] = []
const EMPTY_STEPS: RoutineStep[] = []

export function RotinaPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const today = getLocalDateString()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingStep, setEditingStep] = useState<RoutineStep | null>(null)

  const routineQuery = useQuery({
    queryKey: ['routine', user?.id],
    queryFn: () => fetchOrCreateActiveRoutine(user!.id),
    enabled: !!user,
  })

  const routine = routineQuery.data

  const stepsQuery = useQuery({
    queryKey: ['routineSteps', routine?.id],
    queryFn: () => fetchRoutineSteps(routine!.id),
    enabled: !!routine,
  })

  const completionsQuery = useQuery({
    queryKey: ['routineCompletions', user?.id, today],
    queryFn: () => fetchCompletionsForDate(user!.id, today),
    enabled: !!user,
  })

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    enabled: !!user,
  })

  const categories = categoriesQuery.data ?? EMPTY_CATEGORIES
  const categoriesById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  )

  const steps = stepsQuery.data ?? EMPTY_STEPS
  const completedStepIds = useMemo(
    () => new Set((completionsQuery.data ?? []).map((c) => c.routine_step_id)),
    [completionsQuery.data],
  )

  const invalidateSteps = () =>
    queryClient.invalidateQueries({ queryKey: ['routineSteps', routine?.id] })
  const invalidateCompletions = () =>
    queryClient.invalidateQueries({
      queryKey: ['routineCompletions', user?.id, today],
    })

  const createMutation = useMutation({
    mutationFn: (values: RoutineStepFormValues) =>
      createRoutineStep(routine!.id, toRoutineStepInput(values), steps.length),
    onSuccess: () => {
      invalidateSteps()
      closeModal()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string
      values: RoutineStepFormValues
    }) => updateRoutineStep(id, toRoutineStepInput(values)),
    onSuccess: () => {
      invalidateSteps()
      closeModal()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (step: RoutineStep) => softDeleteRoutineStep(step.id),
    onSuccess: invalidateSteps,
  })

  const toggleMutation = useMutation({
    mutationFn: (step: RoutineStep) =>
      completedStepIds.has(step.id)
        ? uncompleteRoutineStep(step.id, today)
        : completeRoutineStep(user!.id, step.id, today),
    onSuccess: invalidateCompletions,
  })

  const reorderMutation = useMutation({
    mutationFn: reorderRoutineSteps,
    onSuccess: invalidateSteps,
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = steps.findIndex((step) => step.id === active.id)
    const newIndex = steps.findIndex((step) => step.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(steps, oldIndex, newIndex)
    queryClient.setQueryData(['routineSteps', routine?.id], reordered)
    reorderMutation.mutate(
      reordered.map((step, index) => ({ id: step.id, order_index: index })),
    )
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingStep(null)
  }

  const openCreateModal = () => {
    setEditingStep(null)
    setModalOpen(true)
  }

  const openEditModal = (step: RoutineStep) => {
    setEditingStep(step)
    setModalOpen(true)
  }

  const handleDelete = (step: RoutineStep) => {
    if (window.confirm(`Remover a etapa "${step.title}" da rotina?`)) {
      deleteMutation.mutate(step)
    }
  }

  const handleFormSubmit = async (values: RoutineStepFormValues) => {
    if (editingStep) {
      await updateMutation.mutateAsync({ id: editingStep.id, values })
    } else {
      await createMutation.mutateAsync(values)
    }
  }

  const isLoading = routineQuery.isLoading || stepsQuery.isLoading
  const isError = routineQuery.isError || stepsQuery.isError

  return (
    <PageFade className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--color-text)]">
            Rotina matinal
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Monte sua manhã em etapas, na ordem que funciona para você.
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          className="gap-1.5"
          disabled={!routine}
        >
          <Plus size={16} /> Nova etapa
        </Button>
      </div>

      <div className="mt-6">
        {isLoading && (
          <p className="text-sm text-[var(--color-text-muted)]">
            Carregando rotina…
          </p>
        )}
        {isError && (
          <p className="text-error-500 text-sm">
            Não foi possível carregar sua rotina. Tente novamente.
          </p>
        )}
        {!isLoading && !isError && steps.length === 0 && (
          <MotionCard
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 text-center text-sm text-[var(--color-text-muted)]"
          >
            Sua rotina ainda não tem etapas. Adicione a primeira para começar.
          </MotionCard>
        )}
        {steps.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={steps.map((step) => step.id)}
              strategy={verticalListSortingStrategy}
            >
              <MotionCard
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="divide-y divide-[var(--color-border)] overflow-hidden py-0"
              >
                {steps.map((step) => (
                  <SortableStepItem
                    key={step.id}
                    step={step}
                    category={
                      step.category_id
                        ? categoriesById.get(step.category_id)
                        : undefined
                    }
                    completed={completedStepIds.has(step.id)}
                    onToggleComplete={(s) => toggleMutation.mutate(s)}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                  />
                ))}
              </MotionCard>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <Modal
            title={editingStep ? 'Editar etapa' : 'Nova etapa'}
            onClose={closeModal}
          >
            <RoutineStepForm
              categories={categories}
              initialStep={editingStep ?? undefined}
              onSubmit={handleFormSubmit}
              onCancel={closeModal}
            />
          </Modal>
        )}
      </AnimatePresence>
    </PageFade>
  )
}
