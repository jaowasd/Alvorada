import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface BezelProps {
  children: ReactNode
  className?: string
  innerClassName?: string
}

/**
 * Moldura dupla: uma casca externa com padding e um núcleo interno de raio
 * concêntrico — o que faz um painel parecer peça usinada em vez de div.
 *
 * Reservado a poucas superfícies-herói. Aplicar em todo card vira ruído.
 * Raio: externo 1.75rem (--radius-3xl), padding 0.375rem, então o interno é
 * 1.375rem para as curvas ficarem concêntricas de verdade.
 */
export function Bezel({ children, className, innerClassName }: BezelProps) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-[var(--color-hairline)] bg-[var(--color-bg)] p-1.5',
        className,
      )}
    >
      <div
        className={cn(
          'overflow-hidden rounded-[1.375rem] bg-[var(--color-surface)]',
          '[box-shadow:var(--shadow-card),var(--surface-highlight)]',
          innerClassName,
        )}
      >
        {children}
      </div>
    </div>
  )
}
