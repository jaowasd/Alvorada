import { motion } from 'framer-motion'
import { Archive, Pencil, Wallet } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { ItemMenu } from '@/components/ui/ItemMenu'
import { cn } from '@/lib/cn'
import { listItemVariants } from '@/lib/motion'
import { centsToBRL } from '@/lib/money'
import { ACCOUNT_TYPE_LABELS } from '@/lib/validation/financas/account'
import type { FinanceAccount } from '@/types/database'

interface AccountItemProps {
  account: FinanceAccount
  balanceCents: number
  onEdit: (account: FinanceAccount) => void
  onArchive: (account: FinanceAccount) => void
}

export function AccountItem({
  account,
  balanceCents,
  onEdit,
  onArchive,
}: AccountItemProps) {
  return (
    <motion.div variants={listItemVariants} exit="exit">
      <Card className="p-4">
        <div className="flex items-start justify-between">
          <div className="bg-primary-500/10 text-primary-600 flex h-9 w-9 items-center justify-center rounded-lg">
            <Wallet size={16} />
          </div>
          <ItemMenu
            actions={[
              { label: 'Editar', icon: Pencil, onClick: () => onEdit(account) },
              {
                label: 'Arquivar',
                icon: Archive,
                onClick: () => onArchive(account),
                tone: 'danger',
              },
            ]}
          />
        </div>
        <p className="mt-3 text-sm font-medium text-[var(--color-text)]">
          {account.name}
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">
          {ACCOUNT_TYPE_LABELS[account.type]}
        </p>
        <p
          className={cn(
            'numeric-display mt-3 text-2xl',
            balanceCents < 0 ? 'text-error-500' : 'text-[var(--color-text)]',
          )}
        >
          {centsToBRL(balanceCents)}
        </p>
        {!account.include_in_total && (
          <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
            Fora do saldo total
          </p>
        )}
      </Card>
    </motion.div>
  )
}
