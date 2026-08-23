import { useState } from 'react'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { getLocalDateString } from '@/lib/date'
import type { Category, Task } from '@/types/database'

interface TaskItemProps {
  task: Task
  category?: Category
  onToggleComplete: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

function isLate(task: Task): boolean {
  if (task.is_completed || !task.due_date) return false
  return task.due_date < getLocalDateString()
}

export function TaskItem({
  task,
  category,
  onToggleComplete,
  onEdit,
  onDelete,
}: TaskItemProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const late = isLate(task)

  return (
    <div className="flex items-start gap-3 px-4 py-3 transition hover:bg-[var(--color-bg)]">
      <input
        type="checkbox"
        checked={task.is_completed}
        onChange={() => onToggleComplete(task)}
        aria-label={
          task.is_completed
            ? 'Marcar como não concluída'
            : 'Marcar como concluída'
        }
        className="accent-primary-500 mt-1 h-4 w-4"
      />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'text-sm font-medium text-[var(--color-text)]',
            task.is_completed && 'text-[var(--color-text-muted)] line-through',
          )}
        >
          {task.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-muted)]">
          {category && (
            <span
              className="rounded-full px-2 py-0.5"
              style={{
                backgroundColor: `${category.color}1a`,
                color: category.color,
              }}
            >
              {category.name}
            </span>
          )}
          {task.due_date && (
            <span className={cn(late && 'text-error-500 font-medium')}>
              {late ? 'Atrasada · ' : ''}
              {new Date(`${task.due_date}T00:00:00`).toLocaleDateString(
                'pt-BR',
              )}
            </span>
          )}
          {task.estimated_duration_minutes && (
            <span>{task.estimated_duration_minutes} min</span>
          )}
        </div>
        {task.notes && (
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            {task.notes}
          </p>
        )}
      </div>
      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Mais ações"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-border)]/30"
        >
          <MoreVertical size={16} />
        </button>
        {menuOpen && (
          <div className="absolute right-0 z-10 mt-1 w-36 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-sm">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                onEdit(task)
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--color-border)]/30"
            >
              <Pencil size={14} /> Editar
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                onDelete(task)
              }}
              className="text-error-500 flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--color-border)]/30"
            >
              <Trash2 size={14} /> Excluir
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
