import { cn } from '@/lib/cn'
import { interactiveStates } from '@/lib/interactive-states'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary-600 text-white shadow-card hover:bg-primary-700',
  secondary:
    'border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-bg)]',
  ghost: 'text-[var(--color-text)] hover:bg-[var(--color-bg)]',
  danger: 'bg-error-500 text-white shadow-card hover:bg-error-500/90',
}

export function buttonVariants(variant: ButtonVariant = 'primary'): string {
  return cn(
    'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium disabled:pointer-events-none disabled:opacity-50',
    interactiveStates,
    variantClasses[variant],
  )
}
