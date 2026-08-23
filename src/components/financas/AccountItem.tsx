import { useState } from 'react'
import { motion } from 'framer-motion'
import { Archive, MoreVertical, Pencil, Wallet } from 'lucide-react'
import { Card } from '@/components/ui/Card'
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
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <motion.div variants={listItemVariants}>
      <Card className="p-4">
        <div className="flex items-start justify-between">
          <div className="bg-primary-500/10 text-primary-600 flex h-9 w-9 items-center justify-center rounded-lg">
            <Wallet size={16} />
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Mais ações"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg)]"
            >
              <MoreVertical size={16} />
            </button>
            {menuOpen && (
              <div className="shadow-card-lg absolute right-0 z-10 mt-1 w-36 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-1">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    onEdit(account)
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--color-bg)]"
                >
                  <Pencil size={14} /> Editar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    onArchive(account)
                  }}
                  className="text-error-500 flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--color-bg)]"
                >
                  <Archive size={14} /> Arquivar
                </button>
              </div>
            )}
          </div>
        </div>
        <p className="mt-3 text-sm font-medium text-[var(--color-text)]">
          {account.name}
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">
          {ACCOUNT_TYPE_LABELS[account.type]}
        </p>
        <p
          className={cn(
            'font-heading mt-3 text-xl font-bold tabular-nums',
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
