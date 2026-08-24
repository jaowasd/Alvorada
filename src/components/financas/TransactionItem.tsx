import { motion } from 'framer-motion'
import {
  ArrowDownCircle,
  ArrowRightLeft,
  ArrowUpCircle,
  Check,
  Copy,
  Pencil,
  RotateCcw,
  Trash2,
  type LucideIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { ItemMenu, type ItemMenuAction } from '@/components/ui/ItemMenu'
import { cn } from '@/lib/cn'
import { getLocalDateString } from '@/lib/date'
import { listItemVariants } from '@/lib/motion'
import { centsToBRL } from '@/lib/money'
import type {
  FinanceAccount,
  FinanceCategory,
  FinanceTransaction,
} from '@/types/database'

interface TransactionItemProps {
  transaction: FinanceTransaction
  category?: FinanceCategory
  account?: FinanceAccount
  relatedAccount?: FinanceAccount
  onToggleStatus: (transaction: FinanceTransaction) => void
  onEdit: (transaction: FinanceTransaction) => void
  onDuplicate: (transaction: FinanceTransaction) => void
  onReverse: (transaction: FinanceTransaction) => void
  onDelete: (transaction: FinanceTransaction) => void
}

const TYPE_ICON: Record<FinanceTransaction['type'], LucideIcon> = {
  income: ArrowUpCircle,
  expense: ArrowDownCircle,
  transfer: ArrowRightLeft,
}

export function TransactionItem({
  transaction,
  category,
  account,
  relatedAccount,
  onToggleStatus,
  onEdit,
  onDuplicate,
  onReverse,
  onDelete,
}: TransactionItemProps) {
  const Icon = TYPE_ICON[transaction.type]
  const confirmed = transaction.status === 'confirmed'
  const late =
    transaction.status === 'planned' &&
    transaction.due_date < getLocalDateString()

  const amountClass =
    transaction.type === 'income'
      ? 'text-success-600'
      : transaction.type === 'expense'
        ? 'text-error-500'
        : 'text-[var(--color-text-muted)]'
  const amountPrefix =
    transaction.type === 'income'
      ? '+'
      : transaction.type === 'expense'
        ? '-'
        : ''

  const menuActions: ItemMenuAction[] = [
    { label: 'Editar', icon: Pencil, onClick: () => onEdit(transaction) },
    { label: 'Duplicar', icon: Copy, onClick: () => onDuplicate(transaction) },
    ...(confirmed && transaction.type !== 'transfer'
      ? [
          {
            label: 'Estornar',
            icon: RotateCcw,
            onClick: () => onReverse(transaction),
          },
        ]
      : []),
    {
      label: 'Excluir',
      icon: Trash2,
      onClick: () => onDelete(transaction),
      tone: 'danger',
    },
  ]

  return (
    <motion.div
      variants={listItemVariants}
      exit="exit"
      className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[var(--color-bg)]"
    >
      <button
        type="button"
        onClick={() => onToggleStatus(transaction)}
        aria-label={confirmed ? 'Marcar como previsto' : 'Confirmar'}
        className="relative mt-0.5 inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center"
      >
        <span
          className={cn(
            'h-[18px] w-[18px] rounded-md border transition-colors',
            confirmed
              ? 'border-primary-600 bg-primary-600'
              : 'border-[var(--color-border)] bg-[var(--color-surface)]',
          )}
        />
        <Check
          size={12}
          strokeWidth={3}
          className={cn(
            'pointer-events-none absolute text-white transition-opacity',
            confirmed ? 'opacity-100' : 'opacity-0',
          )}
        />
      </button>

      <Icon size={18} className={cn('mt-0.5 shrink-0', amountClass)} />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[var(--color-text)]">
          {transaction.description}
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
          {account && (
            <span>
              {transaction.type === 'transfer' && relatedAccount
                ? `${account.name} → ${relatedAccount.name}`
                : account.name}
            </span>
          )}
          <span className={cn(late && 'text-error-500 font-medium')}>
            {new Date(`${transaction.due_date}T00:00:00`).toLocaleDateString(
              'pt-BR',
            )}
          </span>
        </div>
        {transaction.notes && (
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            {transaction.notes}
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className={cn('text-sm font-semibold tabular-nums', amountClass)}>
          {amountPrefix}
          {centsToBRL(transaction.amount_cents)}
        </span>
        {late && <Badge tone="error">Atrasada</Badge>}
      </div>

      <ItemMenu actions={menuActions} />
    </motion.div>
  )
}
