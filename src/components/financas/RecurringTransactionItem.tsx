import { useState } from 'react'
import { motion } from 'framer-motion'
import { MoreVertical, Pause, Pencil, Play, Trash2 } from 'lucide-react'
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
  const [menuOpen, setMenuOpen] = useState(false)
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
          {!recurring.is_active && (
            <span className="rounded-full bg-[var(--color-border)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-text-muted)]">
              Pausada
            </span>
          )}
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
        {paid && (
          <span className="bg-success-500/10 text-success-600 rounded-full px-2 py-0.5 text-[11px] font-medium">
            Paga
          </span>
        )}
        {late && (
          <span className="bg-error-500/10 text-error-500 rounded-full px-2 py-0.5 text-[11px] font-medium">
            Atrasada
          </span>
        )}
      </div>

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
          <div className="shadow-card-lg absolute right-0 z-10 mt-1 w-40 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-1">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                onEdit(recurring)
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--color-bg)]"
            >
              <Pencil size={14} /> Editar
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                onToggleActive(recurring)
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--color-bg)]"
            >
              {recurring.is_active ? <Pause size={14} /> : <Play size={14} />}{' '}
              {recurring.is_active ? 'Pausar' : 'Retomar'}
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                onArchive(recurring)
              }}
              className="text-error-500 flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--color-bg)]"
            >
              <Trash2 size={14} /> Arquivar
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
