import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-sm hover:opacity-90',
  secondary:
    'border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-border)]/30',
  ghost: 'text-[var(--color-text)] hover:bg-[var(--color-border)]/30',
}

export function buttonVariants(variant: ButtonVariant = 'primary'): string {
  return cn(
    'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:pointer-events-none disabled:opacity-50',
    variantClasses[variant],
  )
}
