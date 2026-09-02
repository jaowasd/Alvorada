import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { centsToBRL } from '@/lib/money'

interface FinanceStatTileProps {
  label: string
  valueCents: number
  icon: LucideIcon
  tone?: 'default' | 'success' | 'error'
}

const TONE_TEXT: Record<NonNullable<FinanceStatTileProps['tone']>, string> = {
  default: 'text-[var(--color-text)]',
  success: 'text-success-600',
  error: 'text-error-500',
}

const TONE_ICON: Record<NonNullable<FinanceStatTileProps['tone']>, string> = {
  default: 'bg-primary-500/10 text-primary-600',
  success: 'bg-success-500/10 text-success-600',
  error: 'bg-error-500/10 text-error-500',
}

export function FinanceStatTile({
  label,
  valueCents,
  icon: Icon,
  tone = 'default',
}: FinanceStatTileProps) {
  return (
    <div className="group flex flex-1 items-center gap-3 px-4 py-5 sm:px-6">
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-[--duration-base] ease-[--ease-glide] group-hover:scale-105',
          TONE_ICON[tone],
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
            'numeric-display mt-0.5 text-2xl sm:text-3xl',
            TONE_TEXT[tone],
          )}
        >
          {centsToBRL(valueCents)}
        </p>
      </div>
    </div>
  )
}
