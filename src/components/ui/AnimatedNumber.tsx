import { useEffect, useRef } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { formatNumber } from '@/lib/number'

interface AnimatedNumberProps {
  value: number
  duration?: number
  suffix?: string
  className?: string
}

export function AnimatedNumber({
  value,
  duration = 0.8,
  suffix = '',
  className,
}: AnimatedNumberProps) {
  const motionValue = useMotionValue(0)
  const rounded = useTransform(
    motionValue,
    (latest) => `${formatNumber(Math.round(latest))}${suffix}`,
  )
  const previousValue = useRef(0)

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
    })
    previousValue.current = value
    return () => controls.stop()
  }, [value, duration, motionValue])

  return <motion.span className={className}>{rounded}</motion.span>
}
