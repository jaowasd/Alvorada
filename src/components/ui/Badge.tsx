import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type BadgeTone = 'success' | 'error' | 'neutral' | 'primary'

const toneClasses: Record<BadgeTone, string> = {
  success: 'bg-success-500/10 text-success-600',
  error: 'bg-error-500/10 text-error-500',
  neutral: 'bg-[var(--color-border)] text-[var(--color-text-muted)]',
  primary: 'bg-primary-500/10 text-primary-600',
}

interface BadgeProps {
  tone?: BadgeTone
  children: ReactNode
  className?: string
}

export function Badge({ tone = 'neutral', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-[11px] font-medium',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
