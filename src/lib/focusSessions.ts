import { getLocalDateString } from '@/lib/date'
import type { FocusSession } from '@/types/database'

/** Soma os minutos de sessões concluídas (não interrompidas) num dia local. */
export function computeFocusMinutesForDate(
  sessions: FocusSession[],
  date: string,
): number {
  return sessions
    .filter(
      (session) =>
        session.completed_at &&
        getLocalDateString(new Date(session.started_at)) === date,
    )
    .reduce((sum, session) => sum + session.duration_minutes, 0)
}
