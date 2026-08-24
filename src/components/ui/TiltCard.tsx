import { useRef, useState, type ReactNode } from 'react'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion'

interface TiltCardProps {
  children: ReactNode
  className?: string
  tiltStrength?: number
}

export function TiltCard({
  children,
  className,
  tiltStrength = 10,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const [tiltEnabled] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches,
  )

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springConfig = { stiffness: 150, damping: 20, mass: 0.5 }
  const rotateX = useSpring(
    useTransform(y, [-0.5, 0.5], [`${tiltStrength}deg`, `-${tiltStrength}deg`]),
    springConfig,
  )
  const rotateY = useSpring(
    useTransform(x, [-0.5, 0.5], [`-${tiltStrength}deg`, `${tiltStrength}deg`]),
    springConfig,
  )

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    x.set((event.clientX - rect.left) / rect.width - 0.5)
    y.set((event.clientY - rect.top) / rect.height - 0.5)
  }

  function handleMouseLeave() {
    x.set(0)
    y.set(0)
  }

  if (!tiltEnabled || prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <div style={{ perspective: '1000px' }} className={className}>
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="h-full"
      >
        {children}
      </motion.div>
    </div>
  )
}
