import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { TaskForm } from '@/components/tasks/TaskForm'
import { TaskItem } from '@/components/tasks/TaskItem'
import { useAuth } from '@/hooks/useAuth'
import { fetchCategories } from '@/lib/queries/categories'
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
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Tarefas</h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Suas tarefas avulsas, além da rotina matinal e dos hábitos.
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-1.5">
          <Plus size={16} /> Nova
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {tasksQuery.isLoading && (
          <p className="text-sm text-[var(--color-text-muted)]">
            Carregando tarefas…
          </p>
        )}
        {tasksQuery.isError && (
          <p className="text-error-500 text-sm">
            Não foi possível carregar suas tarefas. Tente novamente.
          </p>
        )}
        {tasksQuery.data?.length === 0 && (
          <Card className="p-8 text-center text-sm text-[var(--color-text-muted)]">
            Nenhuma tarefa ainda. Crie a primeira para começar.
          </Card>
        )}
        {tasksQuery.data?.map((task) => (
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
      </div>

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
    </div>
  )
}
