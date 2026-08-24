import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { EASE_SMOOTH } from '@/lib/motion'

export function PageFade({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE_SMOOTH }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
