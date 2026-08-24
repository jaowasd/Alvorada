import type { LucideIcon } from 'lucide-react'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { cn } from '@/lib/cn'

interface StatTileProps {
  label: string
  value: number
  suffix?: string
  icon: LucideIcon
  tone?: 'default' | 'error'
}

export function StatTile({
  label,
  value,
  suffix = '',
  icon: Icon,
  tone = 'default',
}: StatTileProps) {
  return (
    <div className="flex flex-1 items-center gap-3 px-4 py-4 sm:px-6">
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
          tone === 'error'
            ? 'bg-error-500/10 text-error-500'
            : 'bg-primary-500/10 text-primary-600',
        )}
      >
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-[var(--color-text-muted)]">
          {label}
        </p>
        <p
          className={cn(
            'font-heading text-2xl font-bold tabular-nums',
            tone === 'error' && value > 0
              ? 'text-error-500'
              : 'text-[var(--color-text)]',
          )}
        >
          <AnimatedNumber value={value} suffix={suffix} />
        </p>
      </div>
    </div>
  )
}
