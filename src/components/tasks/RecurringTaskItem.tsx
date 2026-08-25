import { motion } from 'framer-motion'
import { Pause, Pencil, Play, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { ItemMenu } from '@/components/ui/ItemMenu'
import { cn } from '@/lib/cn'
import { listItemVariants } from '@/lib/motion'
import type { Category, RecurringTask } from '@/types/database'

interface RecurringTaskItemProps {
  recurring: RecurringTask
  category?: Category
  onEdit: (recurring: RecurringTask) => void
  onToggleActive: (recurring: RecurringTask) => void
  onArchive: (recurring: RecurringTask) => void
}

export function RecurringTaskItem({
  recurring,
  category,
  onEdit,
  onToggleActive,
  onArchive,
}: RecurringTaskItemProps) {
  return (
    <motion.div
      variants={listItemVariants}
      exit="exit"
      className={cn(
        'flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[var(--color-bg)]',
        !recurring.is_active && 'opacity-50',
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-[var(--color-text)]">
            {recurring.title}
          </p>
          {!recurring.is_active && <Badge tone="neutral">Pausada</Badge>}
        </div>
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
          <span>
            {recurring.frequency === 'monthly'
              ? `Todo dia ${recurring.day_of_month}`
              : 'Semanal'}
          </span>
        </div>
      </div>

      <ItemMenu
        actions={[
          { label: 'Editar', icon: Pencil, onClick: () => onEdit(recurring) },
          {
            label: recurring.is_active ? 'Pausar' : 'Retomar',
            icon: recurring.is_active ? Pause : Play,
            onClick: () => onToggleActive(recurring),
          },
          {
            label: 'Arquivar',
            icon: Trash2,
            onClick: () => onArchive(recurring),
            tone: 'danger',
          },
        ]}
      />
    </motion.div>
  )
}
