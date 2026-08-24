import { addDays, format } from 'date-fns'

/** Data local (não UTC) no formato YYYY-MM-DD, usada para "hoje" em conclusões. */
export function getLocalDateString(date: Date = new Date()): string {
  return format(date, 'yyyy-MM-dd')
}

/** ISO de expiração daqui a `days` dias, ou `null` (nunca expira) quando `days` é `null`. */
export function computeExpiresAt(days: number | null): string | null {
  if (days === null) return null
  return addDays(new Date(), days).toISOString()
}

export function getGreeting(date: Date = new Date()): string {
  const hour = date.getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}
