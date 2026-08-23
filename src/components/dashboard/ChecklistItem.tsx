import { cn } from '@/lib/cn'

interface ChecklistItemProps {
  title: string
  subtitle?: string
  completed: boolean
  onToggle: () => void
}

export function ChecklistItem({
  title,
  subtitle,
  completed,
  onToggle,
}: ChecklistItemProps) {
  return (
    <label className="flex cursor-pointer items-center gap-3 px-4 py-3 transition hover:bg-[var(--color-bg)]">
      <input
        type="checkbox"
        checked={completed}
        onChange={onToggle}
        className="accent-primary-500 h-4 w-4"
      />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'text-sm font-medium text-[var(--color-text)]',
            completed && 'text-[var(--color-text-muted)] line-through',
          )}
        >
          {title}
        </p>
        {subtitle && (
          <p className="text-xs text-[var(--color-text-muted)]">{subtitle}</p>
        )}
      </div>
    </label>
  )
}
