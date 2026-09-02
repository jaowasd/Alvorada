import { cn } from '@/lib/cn'
import { interactiveStates } from '@/lib/interactive-states'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

const variantClasses: Record<ButtonVariant, string> = {
  // `hover:-translate-y-px` + sombra maior: o botão sobe pra encontrar o
  // cursor. É o gesto que separa um botão vivo de um retângulo colorido.
  primary:
    'bg-primary-600 text-white [box-shadow:var(--shadow-card)] hover:bg-primary-700 hover:-translate-y-px hover:[box-shadow:var(--shadow-lift)]',
  secondary:
    'border border-[var(--color-hairline)] bg-[var(--color-surface)] text-[var(--color-text)] [box-shadow:var(--surface-highlight)] hover:bg-[var(--color-bg)] hover:-translate-y-px',
  ghost: 'text-[var(--color-text)] hover:bg-[var(--color-bg)]',
  danger:
    'bg-error-500 text-white [box-shadow:var(--shadow-card)] hover:bg-error-500/90 hover:-translate-y-px hover:[box-shadow:var(--shadow-lift)]',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'gap-1.5 px-3 py-1.5 text-xs',
  md: 'gap-2 px-4 py-2 text-sm',
  lg: 'gap-2.5 px-6 py-3 text-base',
}

export function buttonVariants(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  pill = false,
): string {
  return cn(
    'group inline-flex items-center justify-center font-medium disabled:pointer-events-none disabled:opacity-50',
    pill ? 'rounded-full' : 'rounded-lg',
    sizeClasses[size],
    interactiveStates,
    variantClasses[variant],
  )
}
