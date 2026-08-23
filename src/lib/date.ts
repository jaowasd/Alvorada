import { format } from 'date-fns'

/** Data local (não UTC) no formato YYYY-MM-DD, usada para "hoje" em conclusões. */
export function getLocalDateString(date: Date = new Date()): string {
  return format(date, 'yyyy-MM-dd')
}
