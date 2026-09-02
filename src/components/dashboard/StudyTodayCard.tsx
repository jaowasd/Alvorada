import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, GraduationCap } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getLocalDateString } from '@/lib/date'
import { fetchFocusSessions } from '@/lib/queries/focusSessions'
import {
  formatStudyMinutes,
  getWeekRange,
  sumStudyMinutes,
} from '@/lib/studies'
import type { FocusSession } from '@/types/database'

const EMPTY_SESSIONS: FocusSession[] = []

/**
 * Atalho para Estudos no Dashboard. O cronômetro em si mora em
 * /app/estudos — aqui fica só o número que o card de Modo Foco mostrava,
 * lido da mesma query key que o módulo já usa (nenhuma requisição extra).
 */
export function StudyTodayCard() {
  const { user } = useAuth()
  const today = getLocalDateString()
  const week = useMemo(() => getWeekRange(today), [today])

  const sessionsQuery = useQuery({
    queryKey: ['focusSessions', user?.id],
    queryFn: () => fetchFocusSessions(user!.id),
    enabled: !!user,
  })
  const sessions = sessionsQuery.data ?? EMPTY_SESSIONS

  const todayMinutes = sumStudyMinutes(sessions, today, today)
  const weekMinutes = sumStudyMinutes(sessions, week.start, week.end)
  const hasHistory = sessions.length > 0

  return (
    <Link
      to="/app/estudos"
      className="group mt-3 flex items-center justify-between rounded-2xl border border-[var(--color-hairline)] bg-[var(--color-surface)] px-4 py-3.5 text-sm font-medium text-[var(--color-text)] [box-shadow:var(--surface-highlight)] transition-[transform,box-shadow] duration-[--duration-base] ease-[--ease-glide] hover:-translate-y-0.5 hover:[box-shadow:var(--shadow-lift)]"
    >
      <span className="min-w-0">
        <span className="flex items-center gap-2">
          <GraduationCap size={16} className="text-primary-600" />
          Ver Estudos
        </span>
        <span className="mt-0.5 block text-xs font-normal text-[var(--color-text-muted)]">
          {hasHistory
            ? `Hoje: ${formatStudyMinutes(todayMinutes)} · Esta semana: ${formatStudyMinutes(weekMinutes)}`
            : 'Cronometre sua primeira sessão de estudo.'}
        </span>
      </span>
      <ChevronRight
        size={16}
        className="text-[var(--color-text-muted)] transition-transform duration-[--duration-base] ease-[--ease-glide] group-hover:translate-x-0.5"
      />
    </Link>
  )
}
