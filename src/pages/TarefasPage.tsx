import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence } from 'framer-motion'
import { ListChecks, Plus, Repeat, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { MotionCard } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { PageFade } from '@/components/ui/PageFade'
import { RecurringTaskForm } from '@/components/tasks/RecurringTaskForm'
import { RecurringTaskItem } from '@/components/tasks/RecurringTaskItem'
import { TaskForm } from '@/components/tasks/TaskForm'
import { TaskItem } from '@/components/tasks/TaskItem'
import { useAuth } from '@/hooks/useAuth'
import { useInlineFeedback } from '@/hooks/useInlineFeedback'
import { cn } from '@/lib/cn'
import { interactiveStates } from '@/lib/interactive-states'
import { fetchCategories } from '@/lib/queries/categories'
import { staggerContainer } from '@/lib/motion'
import {
  archiveRecurringTask,
  createRecurringTask,
  fetchRecurringTasks,
  generateMissingRecurringTasks,
  setRecurringTaskActive,
  updateRecurringTask,
} from '@/lib/queries/recurringTasks'
import {
  createTask,
  fetchTasks,
  setTaskCompleted,
  softDeleteTask,
  updateTask,
} from '@/lib/queries/tasks'
import {
  toRecurringTaskInput,
  type RecurringTaskFormValues,
} from '@/lib/validation/recurringTask'
import { toTaskInput, type TaskFormValues } from '@/lib/validation/task'
import type { Category, RecurringTask, Task } from '@/types/database'

const EMPTY_CATEGORIES: Category[] = []
const EMPTY_RECURRING: RecurringTask[] = []

export function TarefasPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'tasks' | 'recurring'>('tasks')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null)
  const [search, setSearch] = useState('')
  const [recurringModalOpen, setRecurringModalOpen] = useState(false)
  const [editingRecurring, setEditingRecurring] = useState<RecurringTask | null>(
    null,
  )
  const { message: feedback, show: showFeedback } = useInlineFeedback()

  const generatedForUserId = useRef<string | null>(null)
  useEffect(() => {
    if (!user || generatedForUserId.current === user.id) return
    generatedForUserId.current = user.id
    generateMissingRecurringTasks(user.id)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['tasks', user.id] })
        queryClient.invalidateQueries({ queryKey: ['recurringTasks', user.id] })
      })
      .catch(() => {})
  }, [user, queryClient])

  const tasksQuery = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: () => fetchTasks(user!.id),
    enabled: !!user,
  })

  const recurringQuery = useQuery({
    queryKey: ['recurringTasks', user?.id],
    queryFn: () => fetchRecurringTasks(user!.id),
    enabled: !!user,
  })
  const recurringTasks = recurringQuery.data ?? EMPTY_RECURRING

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

  const filteredTasks = useMemo(
    () =>
      (tasksQuery.data ?? []).filter((task) =>
        task.title.toLowerCase().includes(search.trim().toLowerCase()),
      ),
    [tasksQuery.data, search],
  )

  const invalidateTasks = () =>
    queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] })

  const createMutation = useMutation({
    mutationFn: (values: TaskFormValues) =>
      createTask(user!.id, toTaskInput(values)),
    onSuccess: () => {
      invalidateTasks()
      closeModal()
      showFeedback('Tarefa criada.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: TaskFormValues }) =>
      updateTask(id, toTaskInput(values)),
    onSuccess: () => {
      invalidateTasks()
      closeModal()
      showFeedback('Tarefa atualizada.')
    },
  })

  const toggleMutation = useMutation({
    mutationFn: (task: Task) => setTaskCompleted(task.id, !task.is_completed),
    onSuccess: invalidateTasks,
  })

  const deleteMutation = useMutation({
    mutationFn: (task: Task) => softDeleteTask(task.id),
    onSuccess: invalidateTasks,
  })

  const invalidateRecurring = () =>
    queryClient.invalidateQueries({ queryKey: ['recurringTasks', user?.id] })

  const createRecurringMutation = useMutation({
    mutationFn: (values: RecurringTaskFormValues) =>
      createRecurringTask(user!.id, toRecurringTaskInput(values)),
    onSuccess: () => {
      invalidateRecurring()
      closeRecurringModal()
      showFeedback('Recorrência criada.')
    },
  })

  const updateRecurringMutation = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string
      values: RecurringTaskFormValues
    }) => updateRecurringTask(id, toRecurringTaskInput(values)),
    onSuccess: () => {
      invalidateRecurring()
      closeRecurringModal()
      showFeedback('Recorrência atualizada.')
    },
  })

  const toggleRecurringActiveMutation = useMutation({
    mutationFn: (recurring: RecurringTask) =>
      setRecurringTaskActive(recurring.id, !recurring.is_active),
    onSuccess: invalidateRecurring,
  })

  const archiveRecurringMutation = useMutation({
    mutationFn: (recurring: RecurringTask) =>
      archiveRecurringTask(recurring.id),
    onSuccess: invalidateRecurring,
  })

  const closeRecurringModal = () => {
    setRecurringModalOpen(false)
    setEditingRecurring(null)
  }

  const handleRecurringFormSubmit = async (
    values: RecurringTaskFormValues,
  ) => {
    if (editingRecurring) {
      await updateRecurringMutation.mutateAsync({
        id: editingRecurring.id,
        values,
      })
    } else {
      await createRecurringMutation.mutateAsync(values)
    }
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingTask(null)
  }

  const openCreateModal = () => {
    setEditingTask(null)
    setModalOpen(true)
  }

  const openEditModal = (task: Task) => {
    setEditingTask(task)
    setModalOpen(true)
  }

  const openCreateRecurringModal = () => {
    setEditingRecurring(null)
    setRecurringModalOpen(true)
  }

  const openEditRecurringModal = (recurring: RecurringTask) => {
    setEditingRecurring(recurring)
    setRecurringModalOpen(true)
  }

  const handleDelete = (task: Task) => setDeleteTarget(task)

  const handleConfirmDelete = () => {
    if (!deleteTarget) return
    deleteMutation.mutate(deleteTarget, {
      onSuccess: () => setDeleteTarget(null),
    })
  }

  const handleFormSubmit = async (values: TaskFormValues) => {
    if (editingTask) {
      await updateMutation.mutateAsync({ id: editingTask.id, values })
    } else {
      await createMutation.mutateAsync(values)
    }
  }

  return (
    <PageFade className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--color-text)]">
            Tarefas
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Suas tarefas avulsas, além da rotina matinal e dos hábitos.
          </p>
        </div>
        <Button
          onClick={activeTab === 'tasks' ? openCreateModal : openCreateRecurringModal}
          className="gap-1.5"
        >
          <Plus size={16} /> Nova
        </Button>
      </div>

      {feedback && (
        <p
          role="status"
          aria-live="polite"
          className="text-success-600 mt-2 text-xs"
        >
          {feedback}
        </p>
      )}

      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('tasks')}
          className={cn(
            'rounded-lg px-3 py-1.5 text-sm font-medium',
            interactiveStates,
            activeTab === 'tasks'
              ? 'bg-primary-600 text-white'
              : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]',
          )}
        >
          Tarefas
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('recurring')}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium',
            interactiveStates,
            activeTab === 'recurring'
              ? 'bg-primary-600 text-white'
              : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]',
          )}
        >
          <Repeat size={14} /> Recorrentes
        </button>
      </div>

      {activeTab === 'tasks' && (
        <div className="relative mt-6 max-w-xs">
          <Search
            size={16}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[var(--color-text-muted)]"
          />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar tarefa…"
            className="focus:border-primary-500 focus:ring-primary-500/30 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pr-3 pl-9 text-sm text-[var(--color-text)] transition outline-none focus:ring-2"
          />
        </div>
      )}

      {activeTab === 'tasks' && (
      <div className="mt-6">
        {tasksQuery.isLoading && (
          <p
            role="status"
            aria-live="polite"
            className="text-sm text-[var(--color-text-muted)]"
          >
            Carregando tarefas…
          </p>
        )}
        {tasksQuery.isError && (
          <p className="text-error-500 text-sm">
            Não foi possível carregar suas tarefas. Tente novamente.
          </p>
        )}
        {tasksQuery.data?.length === 0 && (
          <EmptyState
            icon={ListChecks}
            title="Nenhuma tarefa ainda"
            description="Crie a primeira para começar."
            action={{ label: 'Criar tarefa', onClick: openCreateModal }}
          />
        )}
        {tasksQuery.data &&
          tasksQuery.data.length > 0 &&
          filteredTasks.length === 0 && (
            <EmptyState
              icon={Search}
              title={`Nenhuma tarefa encontrada para "${search}"`}
            />
          )}
        {filteredTasks.length > 0 && (
          <MotionCard
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="divide-y divide-[var(--color-border)] overflow-hidden py-0"
          >
            <AnimatePresence>
              {filteredTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  category={
                    task.category_id
                      ? categoriesById.get(task.category_id)
                      : undefined
                  }
                  onToggleComplete={(t) => toggleMutation.mutate(t)}
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </MotionCard>
        )}
      </div>
      )}

      {activeTab === 'recurring' && (
        <div className="mt-6">
          {recurringQuery.isLoading && (
            <p
              role="status"
              aria-live="polite"
              className="text-sm text-[var(--color-text-muted)]"
            >
              Carregando recorrências…
            </p>
          )}
          {recurringQuery.data?.length === 0 && (
            <EmptyState
              icon={Repeat}
              title="Nenhuma tarefa recorrente ainda"
              description="Crie um modelo pra gerar tarefas automaticamente (ex.: revisão semanal)."
              action={{
                label: 'Criar recorrência',
                onClick: openCreateRecurringModal,
              }}
            />
          )}
          {recurringTasks.length > 0 && (
            <MotionCard
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="divide-y divide-[var(--color-border)] overflow-hidden py-0"
            >
              <AnimatePresence>
                {recurringTasks.map((recurring) => (
                  <RecurringTaskItem
                    key={recurring.id}
                    recurring={recurring}
                    category={
                      recurring.category_id
                        ? categoriesById.get(recurring.category_id)
                        : undefined
                    }
                    onEdit={openEditRecurringModal}
                    onToggleActive={(r) =>
                      toggleRecurringActiveMutation.mutate(r)
                    }
                    onArchive={(r) => archiveRecurringMutation.mutate(r)}
                  />
                ))}
              </AnimatePresence>
            </MotionCard>
          )}
        </div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <Modal
            title={editingTask ? 'Editar tarefa' : 'Nova tarefa'}
            onClose={closeModal}
          >
            <TaskForm
              categories={categories}
              initialTask={editingTask ?? undefined}
              onSubmit={handleFormSubmit}
              onCancel={closeModal}
            />
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <ConfirmDialog
            title="Excluir tarefa"
            message={`Excluir a tarefa "${deleteTarget.title}"?`}
            confirmLabel="Excluir"
            isPending={deleteMutation.isPending}
            onConfirm={handleConfirmDelete}
            onClose={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {recurringModalOpen && (
          <Modal
            title={editingRecurring ? 'Editar recorrência' : 'Nova recorrência'}
            onClose={closeRecurringModal}
          >
            <RecurringTaskForm
              categories={categories}
              initialRecurring={editingRecurring ?? undefined}
              onSubmit={handleRecurringFormSubmit}
              onCancel={closeRecurringModal}
            />
          </Modal>
        )}
      </AnimatePresence>
    </PageFade>
  )
}
