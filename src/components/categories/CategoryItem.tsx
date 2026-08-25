import { motion } from 'framer-motion'
import { Circle, Pencil, Trash2 } from 'lucide-react'
import { ItemMenu } from '@/components/ui/ItemMenu'
import { CATEGORY_ICON_MAP } from '@/lib/categoryIcons'
import { listItemVariants } from '@/lib/motion'
import type { Category } from '@/types/database'

interface CategoryItemProps {
  category: Category
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}

export function CategoryItem({
  category,
  onEdit,
  onDelete,
}: CategoryItemProps) {
  const Icon = CATEGORY_ICON_MAP[category.icon] ?? Circle

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
      </div>
      <ItemMenu
        actions={[
          { label: 'Editar', icon: Pencil, onClick: () => onEdit(category) },
          {
            label: 'Excluir',
            icon: Trash2,
            onClick: () => onDelete(category),
            tone: 'danger',
          },
        ]}
      />
    </motion.div>
  )
}
