export const EASE_SMOOTH = [0.16, 1, 0.3, 1] as const
/** Curva mais "pesada", com desaceleração longa — entradas e reveals. */
export const EASE_GLIDE = [0.32, 0.72, 0, 1] as const

/**
 * Durações nomeadas. Antes cada call site digitava a própria (0.15, 0.18,
 * 0.2, 0.35, 0.5, 0.6, 0.8) e nada combinava com nada.
 */
export const DURATION = {
  instant: 0.12,
  quick: 0.18,
  base: 0.28,
  slow: 0.48,
  ambient: 0.8,
} as const

export const SPRING_SNAPPY = {
  type: 'spring',
  stiffness: 500,
  damping: 40,
} as const

export const SPRING_SOFT = { stiffness: 150, damping: 20, mass: 0.5 } as const

export const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}

/** Escalonamento mais lento, para seções da landing. */
export const staggerSection = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
}

export const listItemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
}

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
}

/**
 * Reveal com peso: sobe de mais longe e sai de um leve desfoque, o que dá a
 * impressão de massa em vez de um fade seco. Só transform/opacity/filter.
 */
export const revealUp = {
  hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: DURATION.ambient, ease: EASE_GLIDE },
  },
}

/** Viewport padrão dos reveals de scroll — dispara uma vez, com folga. */
export const REVEAL_VIEWPORT = { once: true, margin: '-80px' } as const
