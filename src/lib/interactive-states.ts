/**
 * Estados de interação de qualquer elemento clicável. `transition-[...]`
 * explícito em vez de `transition` cru: só transform/opacity/cor/sombra
 * animam, e na curva do sistema.
 */
export const interactiveStates =
  'transition-[transform,box-shadow,background-color,color,border-color,opacity] duration-[--duration-quick] ease-[--ease-glide] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500'
