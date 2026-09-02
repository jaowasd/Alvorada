import { forwardRef, type HTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Superfície-herói: mais elevação, raio maior e reage ao ponteiro. */
  elevated?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, elevated = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        // O `shadow-inset-hi` é o que faz a superfície captar luz no topo em
        // vez de parecer um retângulo pintado. A borda passou de sólida para
        // hairline: a linha some e o que separa os cards é a própria luz.
        className={cn(
          'rounded-2xl border border-[var(--color-hairline)] bg-[var(--color-surface)]',
          '[box-shadow:var(--shadow-card),var(--surface-highlight)]',
          elevated &&
            'rounded-3xl bg-[var(--color-surface-raised)] [box-shadow:var(--shadow-card-lg),var(--surface-highlight)]',
          className,
        )}
        {...props}
      />
    )
  },
)

Card.displayName = 'Card'

export const MotionCard = motion.create(Card)
