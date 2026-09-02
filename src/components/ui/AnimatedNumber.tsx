import { useEffect } from 'react'
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'framer-motion'
import { DURATION, EASE_SMOOTH } from '@/lib/motion'
import { formatNumber } from '@/lib/number'

interface AnimatedNumberProps {
  value: number
  duration?: number
  suffix?: string
  className?: string
}

export function AnimatedNumber({
  value,
  duration = DURATION.ambient,
  suffix = '',
  className,
}: AnimatedNumberProps) {
  // O @media prefers-reduced-motion do CSS só desliga animação CSS; o Framer
  // roda em JS e passava batido. Aqui a contagem simplesmente não acontece.
  const prefersReducedMotion = useReducedMotion()
  const motionValue = useMotionValue(prefersReducedMotion ? value : 0)
  const rounded = useTransform(
    motionValue,
    (latest) => `${formatNumber(Math.round(latest))}${suffix}`,
  )

  useEffect(() => {
    if (prefersReducedMotion) {
      motionValue.set(value)
      return
    }
    const controls = animate(motionValue, value, {
      duration,
      ease: EASE_SMOOTH,
    })
    return () => controls.stop()
  }, [value, duration, motionValue, prefersReducedMotion])

  return <motion.span className={className}>{rounded}</motion.span>
}
