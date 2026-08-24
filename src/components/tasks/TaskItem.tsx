import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { getLocalDateString } from '@/lib/date'
import { listItemVariants } from '@/lib/motion'
import { formatNumber } from '@/lib/number'
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
    <motion.div
      variants={listItemVariants}
      className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[var(--color-bg)]"
    >
      <label className="relative mt-0.5 inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center">
        <input
          type="checkbox"
          checked={task.is_completed}
          onChange={() => onToggleComplete(task)}
          aria-label={
            task.is_completed
              ? 'Marcar como não concluída'
              : 'Marcar como concluída'
          }
          className="peer sr-only"
        />
        <span
          className={cn(
            'h-[18px] w-[18px] rounded-md border transition-colors',
            task.is_completed
              ? 'border-primary-600 bg-primary-600'
              : 'border-[var(--color-border)] bg-[var(--color-surface)]',
          )}
        />
        <Check
          size={12}
          strokeWidth={3}
          className={cn(
            'pointer-events-none absolute text-white transition-opacity',
            task.is_completed ? 'opacity-100' : 'opacity-0',
          )}
        />
      </label>
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
              {new Date(`${task.due_date}T00:00:00`).toLocaleDateString(
                'pt-BR',
              )}
            </span>
          )}
          {task.estimated_duration_minutes && (
            <span>{formatNumber(task.estimated_duration_minutes)} min</span>
          )}
        </div>
        {task.notes && (
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            {task.notes}
          </p>
        )}
      </div>
      {task.is_completed && (
        <span className="bg-success-500/10 text-success-600 mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium">
          Concluída
        </span>
      )}
      {!task.is_completed && late && (
        <span className="bg-error-500/10 text-error-500 mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium">
          Atrasada
        </span>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Mais ações"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-border)]/40"
        >
          <MoreVertical size={16} />
        </button>
        {menuOpen && (
          <div className="shadow-card-lg absolute right-0 z-10 mt-1 w-36 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-1">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                onEdit(task)
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--color-bg)]"
            >
              <Pencil size={14} /> Editar
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                onDelete(task)
              }}
              className="text-error-500 flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--color-bg)]"
            >
              <Trash2 size={14} /> Excluir
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
