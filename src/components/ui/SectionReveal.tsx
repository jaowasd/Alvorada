import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { REVEAL_VIEWPORT, revealUp } from '@/lib/motion'

interface SectionRevealProps {
  children: ReactNode
  className?: string
  /** Atraso em segundos, para escalonar irmãos sem um container de stagger. */
  delay?: number
}

/**
 * Revela um bloco quando ele entra na viewport. Usa `whileInView` do Framer
 * (IntersectionObserver por baixo) — nunca um listener de scroll, que forçaria
 * reflow contínuo.
 */
export function SectionReveal({
  children,
  className,
  delay = 0,
}: SectionRevealProps) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      variants={revealUp}
      initial="hidden"
      whileInView="show"
      viewport={REVEAL_VIEWPORT}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
