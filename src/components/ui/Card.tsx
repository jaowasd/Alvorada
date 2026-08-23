import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm',
          className,
        )}
        {...props}
      />
    )
  },
)

Card.displayName = 'Card'
