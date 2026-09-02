import { motion, useReducedMotion } from 'framer-motion'
import { Flame } from 'lucide-react'
import { EASE_GLIDE, REVEAL_VIEWPORT } from '@/lib/motion'

/**
 * A fita de consistência: o artefato mais característico do produto,
 * animado. Cada célula é um dia; elas acendem em cascata até "hoje".
 *
 * Os dados são fixos de propósito — é uma demonstração, não um gráfico de
 * dados reais, e inventar aleatoriedade a cada render só produziria ruído.
 * 0 = dia vazio, 1..4 = faixas de conclusão (mesma escala do
 * ConsistencyHeatmap real do app).
 */
const WEEKS = [
  [0, 2, 3, 4, 3, 1, 0],
  [1, 3, 4, 4, 2, 3, 1],
  [2, 4, 4, 3, 4, 2, 0],
  [3, 4, 3, 4, 4, 3, 2],
  [2, 3, 4, 4, 4, 4, 3],
  [4, 4, 4, 3, 4, 4, 4],
]

const LEVEL_OPACITY = [0.07, 0.28, 0.5, 0.72, 1]

export function ConsistencyRibbon() {
  const prefersReducedMotion = useReducedMotion()
  const cells = WEEKS.flat()

  return (
    <div className="rounded-2xl border border-[var(--color-hairline)] bg-[var(--color-surface)] p-5 [box-shadow:var(--shadow-card),var(--surface-highlight)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-2xs font-medium tracking-[0.14em] text-[var(--color-text-muted)] uppercase">
            Mapa de consistência
          </p>
          <p className="mt-1 text-sm text-[var(--color-text)]">
            Seis semanas de manhãs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Flame size={16} className="text-accent-500" />
          <span className="numeric-display text-2xl text-[var(--color-text)]">
            42
          </span>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="mt-4 grid grid-flow-col grid-rows-7 justify-start gap-[3px]"
      >
        {cells.map((level, index) => (
          <motion.span
            key={index}
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.4 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={REVEAL_VIEWPORT}
            transition={{
              duration: 0.4,
              ease: EASE_GLIDE,
              // Cascata na diagonal: acende semana a semana, como o tempo passa.
              delay: index * 0.012,
            }}
            className="bg-primary-600 h-[13px] w-[13px] rounded-[3px]"
            style={{ opacity: LEVEL_OPACITY[level] }}
          />
        ))}
      </div>

      <p className="mt-3 text-xs text-[var(--color-text-muted)]">
        Cada quadrado é um dia. Quanto mais cheio, mais da sua rotina você
        cumpriu.
      </p>
    </div>
  )
}
