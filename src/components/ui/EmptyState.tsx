import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { MotionCard } from '@/components/ui/Card'
import { fadeIn } from '@/lib/motion'

interface EmptyStateAction {
  label: string
  onClick: () => void
}

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: EmptyStateAction
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <MotionCard
      variants={fadeIn}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center p-8 text-center"
    >
      <div className="bg-primary-500/10 text-primary-600 flex h-12 w-12 items-center justify-center rounded-full">
        <Icon size={22} />
      </div>
      <p className="mt-4 text-sm font-medium text-[var(--color-text)]">
        {title}
      </p>
      {description && (
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} className="mt-4">
          {action.label}
        </Button>
      )}
    </MotionCard>
  )
}
