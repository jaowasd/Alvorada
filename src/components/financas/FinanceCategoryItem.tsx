import { motion } from 'framer-motion'
import { Archive, Circle, Pencil } from 'lucide-react'
import { ItemMenu } from '@/components/ui/ItemMenu'
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
  const Icon = FINANCE_CATEGORY_ICON_MAP[category.icon] ?? Circle

  return (
    <motion.div
      variants={listItemVariants}
      exit="exit"
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
      <ItemMenu
        actions={[
          { label: 'Editar', icon: Pencil, onClick: () => onEdit(category) },
          {
            label: 'Arquivar',
            icon: Archive,
            onClick: () => onArchive(category),
            tone: 'danger',
          },
        ]}
      />
    </motion.div>
  )
}
