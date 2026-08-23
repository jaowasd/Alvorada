import { format } from 'date-fns'

/** Data local (não UTC) no formato YYYY-MM-DD, usada para "hoje" em conclusões. */
export function getLocalDateString(date: Date = new Date()): string {
  return format(date, 'yyyy-MM-dd')
}

export function getGreeting(date: Date = new Date()): string {
  const hour = date.getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}
