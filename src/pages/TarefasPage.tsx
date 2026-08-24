import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence } from 'framer-motion'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { MotionCard } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { PageFade } from '@/components/ui/PageFade'
import { TaskForm } from '@/components/tasks/TaskForm'
import { TaskItem } from '@/components/tasks/TaskItem'
import { useAuth } from '@/hooks/useAuth'
import { fetchCategories } from '@/lib/queries/categories'
import { fadeIn, staggerContainer } from '@/lib/motion'
import {
  createTask,
  fetchTasks,
  setTaskCompleted,
  softDeleteTask,
  updateTask,
} from '@/lib/queries/tasks'
import { toTaskInput, type TaskFormValues } from '@/lib/validation/task'
import type { Category, Task } from '@/types/database'

const EMPTY_CATEGORIES: Category[] = []

export function TarefasPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [search, setSearch] = useState('')

  const tasksQuery = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: () => fetchTasks(user!.id),
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
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: TaskFormValues }) =>
      updateTask(id, toTaskInput(values)),
    onSuccess: () => {
      invalidateTasks()
      closeModal()
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

  const handleDelete = (task: Task) => {
    if (window.confirm(`Excluir a tarefa "${task.title}"?`)) {
      deleteMutation.mutate(task)
    }
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
        <Button onClick={openCreateModal} className="gap-1.5">
          <Plus size={16} /> Nova
        </Button>
      </div>

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
          <MotionCard
            variants={fadeIn}
            initial="hidden"
            animate="show"
            className="p-8 text-center text-sm text-[var(--color-text-muted)]"
          >
            Nenhuma tarefa ainda. Crie a primeira para começar.
          </MotionCard>
        )}
        {tasksQuery.data &&
          tasksQuery.data.length > 0 &&
          filteredTasks.length === 0 && (
            <MotionCard
              variants={fadeIn}
              initial="hidden"
              animate="show"
              className="p-8 text-center text-sm text-[var(--color-text-muted)]"
            >
              Nenhuma tarefa encontrada para "{search}".
            </MotionCard>
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
    </PageFade>
  )
}
