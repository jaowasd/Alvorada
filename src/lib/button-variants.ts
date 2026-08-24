import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary-600 text-white shadow-sm hover:bg-primary-700',
  secondary:
    'border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-bg)]',
  ghost: 'text-[var(--color-text)] hover:bg-[var(--color-bg)]',
}

export function buttonVariants(variant: ButtonVariant = 'primary'): string {
  return cn(
    'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:pointer-events-none disabled:opacity-50',
    variantClasses[variant],
  )
}
