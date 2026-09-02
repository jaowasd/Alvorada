import { useState, type PointerEvent } from 'react'
import { useMotionValue, useReducedMotion } from 'framer-motion'

/** Deslocamento máximo, em px, que o ponteiro empurra as camadas da cena. */
export const POINTER_RANGE = 70

/**
 * Plumbing do paralaxe por ponteiro, compartilhado por quem monta uma
 * DawnScene. Devolve os dois MotionValues normalizados e os handlers pra
 * pendurar no container.
 *
 * `interactive` é falso em toque e com movimento reduzido — nesses casos os
 * valores ficam em zero e a cena é estática, sem gastar evento nenhum.
 */
export function usePointerScene() {
  const prefersReducedMotion = useReducedMotion()
  const [pointerEnabled] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches,
  )
  const interactive = pointerEnabled && !prefersReducedMotion

  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (!interactive) return
    pointerX.set((event.clientX / window.innerWidth - 0.5) * 2 * POINTER_RANGE)
    pointerY.set((event.clientY / window.innerHeight - 0.5) * 2 * POINTER_RANGE)
  }

  const onPointerLeave = () => {
    pointerX.set(0)
    pointerY.set(0)
  }

  return {
    pointerX,
    pointerY,
    interactive,
    prefersReducedMotion: !!prefersReducedMotion,
    sceneHandlers: { onPointerMove, onPointerLeave },
  }
}
