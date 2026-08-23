import { useState } from 'react'
import { motion } from 'framer-motion'
import { Archive, Circle, MoreVertical, Pencil } from 'lucide-react'
import { FINANCE_CATEGORY_ICON_MAP } from '@/lib/financeCategoryIcons'
import { listItemVariants } from '@/lib/motion'
import type { FinanceCategory } from '@/types/database'

interface FinanceCategoryItemProps {
  category: FinanceCategory
  onEdit: (category: FinanceCategory) => void
  onArchive: (category: FinanceCategory) => void
}

export function FinanceCategoryItem({
  category,
  onEdit,
  onArchive,
}: FinanceCategoryItemProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const Icon = FINANCE_CATEGORY_ICON_MAP[category.icon] ?? Circle

  return (
    <motion.div
      variants={listItemVariants}
      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--color-bg)]"
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        style={{
          backgroundColor: `${category.color}1a`,
          color: category.color,
        }}
      >
        <Icon size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[var(--color-text)]">
          {category.name}
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">
          {category.kind === 'income' ? 'Receita' : 'Despesa'}
        </p>
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
          <div className="shadow-card-lg absolute right-0 z-10 mt-1 w-36 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-1">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                onEdit(category)
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--color-bg)]"
            >
              <Pencil size={14} /> Editar
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                onArchive(category)
              }}
              className="text-error-500 flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--color-bg)]"
            >
              <Archive size={14} /> Arquivar
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
