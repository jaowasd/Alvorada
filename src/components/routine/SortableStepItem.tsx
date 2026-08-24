import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Check, GripVertical, Pencil, Trash2 } from 'lucide-react'
import { ItemMenu } from '@/components/ui/ItemMenu'
import { cn } from '@/lib/cn'
import { formatNumber } from '@/lib/number'
import type { Category, RoutineStep } from '@/types/database'

interface SortableStepItemProps {
  step: RoutineStep
  category?: Category
  completed: boolean
  onToggleComplete: (step: RoutineStep) => void
  onEdit: (step: RoutineStep) => void
  onDelete: (step: RoutineStep) => void
}

export function SortableStepItem({
  step,
  category,
  completed,
  onToggleComplete,
  onEdit,
  onDelete,
}: SortableStepItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative flex items-start gap-3 bg-[var(--color-surface)] px-4 py-3 transition-colors hover:bg-[var(--color-bg)]',
        isDragging && 'z-10',
      )}
    >
      <button
        type="button"
        aria-label="Arrastar para reordenar"
        className="mt-1 cursor-grab touch-none text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} />
      </button>
      <label className="relative mt-0.5 inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center">
        <input
          type="checkbox"
          checked={completed}
          onChange={() => onToggleComplete(step)}
          aria-label={
            completed ? 'Marcar como não concluída' : 'Marcar como concluída'
          }
          className="peer sr-only"
        />
        <span
          className={cn(
            'h-[18px] w-[18px] rounded-md border transition-colors',
            completed
              ? 'border-primary-600 bg-primary-600'
              : 'border-[var(--color-border)] bg-[var(--color-surface)]',
          )}
        />
        <Check
          size={12}
          strokeWidth={3}
          className={cn(
            'pointer-events-none absolute text-white transition-opacity',
            completed ? 'opacity-100' : 'opacity-0',
          )}
        />
      </label>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'text-sm font-medium text-[var(--color-text)]',
            completed && 'text-[var(--color-text-muted)] line-through',
          )}
        >
          {step.title}
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
          {step.estimated_duration_minutes && (
            <span>{formatNumber(step.estimated_duration_minutes)} min</span>
          )}
        </div>
        {step.notes && (
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            {step.notes}
          </p>
        )}
      </div>
      <ItemMenu
        actions={[
          { label: 'Editar', icon: Pencil, onClick: () => onEdit(step) },
          {
            label: 'Excluir',
            icon: Trash2,
            onClick: () => onDelete(step),
            tone: 'danger',
          },
        ]}
      />
    </div>
  )
}
