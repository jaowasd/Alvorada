import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'
import { listItemVariants } from '@/lib/motion'

interface ChecklistItemProps {
  title: string
  subtitle?: string
  completed: boolean
  late?: boolean
  onToggle: () => void
}

export function ChecklistItem({
  title,
  subtitle,
  completed,
  late = false,
  onToggle,
}: ChecklistItemProps) {
  return (
    <motion.label
      variants={listItemVariants}
      className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--color-bg)]"
    >
      <span className="relative inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center">
        <input
          type="checkbox"
          checked={completed}
          onChange={onToggle}
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
      </span>
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
      {completed && (
        <span className="bg-success-500/10 text-success-600 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium">
          Concluído
        </span>
      )}
      {!completed && late && (
        <span className="bg-error-500/10 text-error-500 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium">
          Atrasada
        </span>
      )}
    </motion.label>
  )
}
