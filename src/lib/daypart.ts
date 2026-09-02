/**
 * Fase do dia — a "Primeira Luz". Controla `data-daypart` no <html>, que o
 * index.css usa para trocar --dawn-from/--dawn-to/--dawn-intensity.
 *
 * A mesma lógica está duplicada em public/theme-init.js, de propósito:
 * aquele script roda antes da primeira pintura pra não piscar, e não pode
 * importar nada. Mudou aqui, muda lá.
 */
export type Daypart = 'dawn' | 'day' | 'dusk' | 'night'

export const DAYPART_ATTRIBUTE = 'data-daypart'

export function resolveDaypart(date: Date = new Date()): Daypart {
  const hour = date.getHours()
  if (hour >= 5 && hour < 10) return 'dawn'
  if (hour >= 10 && hour < 17) return 'day'
  if (hour >= 17 && hour < 20) return 'dusk'
  return 'night'
}

/** Rótulo curto da fase, usado como legenda do amanhecer no Dashboard. */
export const DAYPART_LABELS: Record<Daypart, string> = {
  dawn: 'Amanhecer',
  day: 'Dia claro',
  dusk: 'Entardecer',
  night: 'Noite',
}
