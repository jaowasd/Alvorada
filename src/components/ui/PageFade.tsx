import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { DURATION, EASE_GLIDE } from '@/lib/motion'

/**
 * Entrada de página. Sai de um leve desfoque além do deslocamento — é o que
 * dá sensação de peso em vez de um fade seco.
 */
export function PageFade({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: DURATION.slow, ease: EASE_GLIDE }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
