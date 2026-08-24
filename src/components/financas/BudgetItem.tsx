import { motion } from 'framer-motion'
import { AlertTriangle, PiggyBank, Trash2, Pencil } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { ItemMenu } from '@/components/ui/ItemMenu'
import { cn } from '@/lib/cn'
import { EASE_SMOOTH, listItemVariants } from '@/lib/motion'
import { centsToBRL } from '@/lib/money'
import type { FinanceBudget, FinanceCategory } from '@/types/database'

interface BudgetItemProps {
  budget: FinanceBudget
  category: FinanceCategory | undefined
  spentCents: number
  onEdit: (budget: FinanceBudget) => void
  onArchive: (budget: FinanceBudget) => void
}

export function BudgetItem({
  budget,
  category,
  spentCents,
  onEdit,
  onArchive,
}: BudgetItemProps) {
  const percent =
    budget.limit_cents > 0
      ? Math.min((spentCents / budget.limit_cents) * 100, 100)
      : 0
  const isOver = spentCents > budget.limit_cents

  return (
    <motion.div variants={listItemVariants} exit="exit">
      <Card className="p-4">
        <div className="flex items-start justify-between">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{
              backgroundColor: `${category?.color ?? '#78716c'}1a`,
              color: category?.color ?? '#78716c',
            }}
          >
            <PiggyBank size={16} />
          </div>
          <ItemMenu
            actions={[
              { label: 'Editar', icon: Pencil, onClick: () => onEdit(budget) },
              {
                label: 'Excluir',
                icon: Trash2,
                onClick: () => onArchive(budget),
                tone: 'danger',
              },
            ]}
          />
        </div>
        <p className="mt-3 text-sm font-medium text-[var(--color-text)]">
          {category?.name ?? 'Categoria removida'}
        </p>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span
            className={cn(
              'font-medium',
              isOver ? 'text-error-500' : 'text-[var(--color-text)]',
            )}
          >
            {centsToBRL(spentCents)}
          </span>
          <span className="text-[var(--color-text-muted)]">
            de {centsToBRL(budget.limit_cents)}
          </span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--color-bg)]">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: percent / 100 }}
            transition={{ duration: 0.5, ease: EASE_SMOOTH }}
            className={cn(
              'h-full w-full origin-left rounded-full',
              isOver ? 'bg-error-500' : 'bg-primary-600',
            )}
          />
        </div>
        {isOver && (
          <p className="text-error-500 mt-2 flex items-center gap-1.5 text-xs font-medium">
            <AlertTriangle size={13} />
            Limite ultrapassado
          </p>
        )}
      </Card>
    </motion.div>
  )
}
