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
    <div className="group flex flex-1 items-center gap-3 px-4 py-5 sm:px-6">
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-[--duration-base] ease-[--ease-glide] group-hover:scale-105',
          tone === 'error'
            ? 'bg-error-500/10 text-error-500'
            : 'bg-primary-500/10 text-primary-600',
        )}
      >
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-2xs truncate font-medium tracking-[0.08em] text-[var(--color-text-muted)] uppercase">
          {label}
        </p>
        <p
          className={cn(
            'numeric-display mt-0.5 text-3xl sm:text-4xl',
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
