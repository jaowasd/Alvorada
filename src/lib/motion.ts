export const EASE_SMOOTH = [0.16, 1, 0.3, 1] as const

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
