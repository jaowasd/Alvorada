import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { taskFormSchema, type TaskFormValues } from '@/lib/validation/task'
import type { Category, Task } from '@/types/database'

interface TaskFormProps {
  categories: Category[]
  initialTask?: Task
  onSubmit: (values: TaskFormValues) => Promise<void>
  onCancel: () => void
}

export function TaskForm({
  categories,
  initialTask,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: initialTask?.title ?? '',
      notes: initialTask?.notes ?? '',
      categoryId: initialTask?.category_id ?? '',
      estimatedDurationMinutes: initialTask?.estimated_duration_minutes
        ? String(initialTask.estimated_duration_minutes)
        : '',
      dueDate: initialTask?.due_date ?? '',
    },
  })

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      <Input
        label="Título"
        error={errors.title?.message}
        {...register('title')}
      />
      <Select
        label="Categoria"
        error={errors.categoryId?.message}
        {...register('categoryId')}
      >
        <option value="">Sem categoria</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Select>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Data"
          type="date"
          error={errors.dueDate?.message}
          {...register('dueDate')}
        />
        <Input
          label="Duração (min)"
          inputMode="numeric"
          placeholder="ex: 15"
          error={errors.estimatedDurationMinutes?.message}
          {...register('estimatedDurationMinutes')}
        />
      </div>
      <Input
        label="Nota (opcional)"
        error={errors.notes?.message}
        {...register('notes')}
      />
      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Salvando…'
            : initialTask
              ? 'Salvar alterações'
              : 'Criar tarefa'}
        </Button>
      </div>
    </form>
  )
}
