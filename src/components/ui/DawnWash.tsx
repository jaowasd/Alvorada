import { cn } from '@/lib/cn'

interface DawnWashProps {
  /** `page` cobre o topo de uma tela inteira; `panel`, o topo de uma coluna. */
  scale?: 'page' | 'panel'
  className?: string
}

/**
 * A "Primeira Luz": um horizonte no topo da tela, com a cor da hora do dia.
 *
 * É `absolute`, não `fixed`, de propósito — um horizonte só precisa existir
 * no topo da página. Isso evita o jank de background fixo no Safari mobile e
 * qualquer disputa de z-index (o Modal é z-50, e há vários z-10 internos):
 * fica em -z-10 dentro de um pai com `isolate`.
 *
 * As cores vêm de --dawn-from/--dawn-to, trocadas por `data-daypart` no
 * <html>. Todas saem da paleta que já existia — nenhum hex novo.
 */
export function DawnWash({ scale = 'page', className }: DawnWashProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-x-0 top-0 -z-10 overflow-hidden',
        scale === 'page' ? 'h-[420px]' : 'h-[260px]',
        className,
      )}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 100% at 50% -20%, var(--dawn-from) 0%, var(--dawn-to) 45%, transparent 72%)',
          opacity: 'var(--dawn-intensity)',
        }}
      />
    </div>
  )
}
