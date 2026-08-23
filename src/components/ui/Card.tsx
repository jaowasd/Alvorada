import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'shadow-card rounded-2xl border border-[var(--color-border)]/60 bg-[var(--color-surface)]',
          className,
        )}
        {...props}
      />
    )
  },
)

Card.displayName = 'Card'
