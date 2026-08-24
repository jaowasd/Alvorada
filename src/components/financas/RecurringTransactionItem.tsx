import { motion } from 'framer-motion'
import { Pause, Pencil, Play, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { ItemMenu } from '@/components/ui/ItemMenu'
import { cn } from '@/lib/cn'
import { getLocalDateString } from '@/lib/date'
import { listItemVariants } from '@/lib/motion'
import { centsToBRL } from '@/lib/money'
import type {
  FinanceCategory,
  FinanceRecurringTransaction,
  FinanceTransaction,
} from '@/types/database'

interface RecurringTransactionItemProps {
  recurring: FinanceRecurringTransaction
  category?: FinanceCategory
  currentInstance: FinanceTransaction | null
  previousInstance: FinanceTransaction | null
  onMarkPaid: (transaction: FinanceTransaction) => void
  onEdit: (recurring: FinanceRecurringTransaction) => void
  onToggleActive: (recurring: FinanceRecurringTransaction) => void
  onArchive: (recurring: FinanceRecurringTransaction) => void
}

export function RecurringTransactionItem({
  recurring,
  category,
  currentInstance,
  previousInstance,
  onMarkPaid,
  onEdit,
  onToggleActive,
  onArchive,
}: RecurringTransactionItemProps) {
  const late =
    currentInstance != null &&
    currentInstance.status === 'planned' &&
    currentInstance.due_date < getLocalDateString()
  const paid = currentInstance?.status === 'confirmed'
  const delta =
    currentInstance && previousInstance
      ? currentInstance.amount_cents - previousInstance.amount_cents
      : null

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
            {recurring.description}
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
          {currentInstance && (
            <span className={cn(late && 'text-error-500 font-medium')}>
              Vence{' '}
              {new Date(
                `${currentInstance.due_date}T00:00:00`,
              ).toLocaleDateString('pt-BR')}
            </span>
          )}
          {delta != null && delta !== 0 && (
            <span className={delta > 0 ? 'text-error-500' : 'text-success-600'}>
              {delta > 0 ? '+' : '-'}
              {centsToBRL(Math.abs(delta))} vs mês anterior
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span className="text-sm font-semibold text-[var(--color-text)] tabular-nums">
          {centsToBRL(
            currentInstance
              ? currentInstance.amount_cents
              : recurring.amount_cents,
          )}
        </span>
        {currentInstance && !paid && (
          <button
            type="button"
            onClick={() => onMarkPaid(currentInstance)}
            className="text-primary-600 text-xs font-medium hover:underline"
          >
            Marcar como paga
          </button>
        )}
        {paid && <Badge tone="success">Paga</Badge>}
        {late && <Badge tone="error">Atrasada</Badge>}
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
