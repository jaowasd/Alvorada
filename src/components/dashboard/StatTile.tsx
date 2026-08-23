import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/cn'

interface StatTileProps {
  label: string
  value: string
  icon: LucideIcon
  tone?: 'default' | 'error'
}

export function StatTile({
  label,
  value,
  icon: Icon,
  tone = 'default',
}: StatTileProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-[var(--color-text-muted)]">
          {label}
        </p>
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg',
            tone === 'error'
              ? 'bg-error-500/10 text-error-500'
              : 'bg-primary-500/10 text-primary-600',
          )}
        >
          <Icon size={16} />
        </div>
      </div>
      <p className="mt-2 text-2xl font-bold text-[var(--color-text)]">
        {value}
      </p>
    </Card>
  )
}
