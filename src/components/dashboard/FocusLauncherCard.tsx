import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence } from 'framer-motion'
import { Timer } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/cn'
import { getLocalDateString } from '@/lib/date'
import { computeFocusMinutesForDate } from '@/lib/focusSessions'
import { interactiveStates } from '@/lib/interactive-states'
import {
  completeFocusSession,
  fetchFocusSessions,
  startFocusSession,
} from '@/lib/queries/focusSessions'
import { fetchTasks } from '@/lib/queries/tasks'
import type { FocusSession, Task } from '@/types/database'

const DURATION_PRESETS = [15, 25, 45]
const EMPTY_TASKS: Task[] = []
const EMPTY_SESSIONS: FocusSession[] = []

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function FocusLauncherCard() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const today = getLocalDateString()

  const [durationMinutes, setDurationMinutes] = useState(25)
  const [taskId, setTaskId] = useState('')
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle')
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [lastCompletedMinutes, setLastCompletedMinutes] = useState<
    number | null
  >(null)
  const activeSessionRef = useRef<FocusSession | null>(null)

  const tasksQuery = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: () => fetchTasks(user!.id),
    enabled: !!user,
  })
  const openTasks = useMemo(
    () => (tasksQuery.data ?? EMPTY_TASKS).filter((t) => !t.is_completed),
    [tasksQuery.data],
  )

  const sessionsQuery = useQuery({
    queryKey: ['focusSessions', user?.id],
    queryFn: () => fetchFocusSessions(user!.id),
    enabled: !!user,
  })
  const todayFocusMinutes = computeFocusMinutesForDate(
    sessionsQuery.data ?? EMPTY_SESSIONS,
    today,
  )

  const startMutation = useMutation({
    mutationFn: () =>
      startFocusSession(user!.id, {
        task_id: taskId || null,
        label: null,
        duration_minutes: durationMinutes,
      }),
    onSuccess: (session) => {
      activeSessionRef.current = session
      setSecondsLeft(durationMinutes * 60)
      setPhase('running')
    },
  })

  const completeMutation = useMutation({
    mutationFn: (id: string) => completeFocusSession(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['focusSessions', user?.id],
      })
    },
  })

  useEffect(() => {
    if (phase !== 'running') return
    const interval = setInterval(() => {
      setSecondsLeft((seconds) => {
        const next = seconds - 1
        if (next > 0) return next

        clearInterval(interval)
        const session = activeSessionRef.current
        if (session) completeMutation.mutate(session.id)
        setLastCompletedMinutes(durationMinutes)
        setPhase('done')
        setTimeout(() => setLastCompletedMinutes(null), 4000)
        return 0
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [phase, completeMutation, durationMinutes])

  const stopSession = () => {
    activeSessionRef.current = null
    setPhase('idle')
  }

  const linkedTask = openTasks.find((t) => t.id === taskId)

  return (
    <Card className="p-6">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text)]">
        <Timer size={16} className="text-primary-600" />
        Modo Foco
      </h2>

      <div className="mt-3 flex flex-wrap gap-2">
        {DURATION_PRESETS.map((minutes) => (
          <button
            key={minutes}
            type="button"
            onClick={() => setDurationMinutes(minutes)}
            aria-pressed={durationMinutes === minutes}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-sm font-medium',
              interactiveStates,
              durationMinutes === minutes
                ? 'border-primary-600 bg-primary-500/10 text-primary-600'
                : 'border-[var(--color-border)] text-[var(--color-text-muted)]',
            )}
          >
            {minutes} min
          </button>
        ))}
      </div>

      {openTasks.length > 0 && (
        <div className="mt-3 max-w-xs">
          <Select
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
            aria-label="Vincular a uma tarefa (opcional)"
          >
            <option value="">Sem tarefa vinculada</option>
            {openTasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </Select>
        </div>
      )}

      <button
        type="button"
        onClick={() => startMutation.mutate()}
        disabled={startMutation.isPending}
        className={cn(
          'bg-primary-600 mt-4 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50',
          interactiveStates,
        )}
      >
        Iniciar foco
      </button>

      {lastCompletedMinutes && (
        <p
          role="status"
          aria-live="polite"
          className="text-success-600 mt-2 text-xs"
        >
          Sessão concluída — {lastCompletedMinutes} min.
        </p>
      )}
      {todayFocusMinutes > 0 && (
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">
          Hoje: {todayFocusMinutes} min focados.
        </p>
      )}

      <AnimatePresence>
        {phase === 'running' && (
          <Modal title="Modo Foco" onClose={stopSession}>
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              {linkedTask && (
                <p className="text-sm text-[var(--color-text-muted)]">
                  {linkedTask.title}
                </p>
              )}
              <p className="font-heading text-5xl font-bold text-[var(--color-text)] tabular-nums">
                {formatClock(Math.max(secondsLeft, 0))}
              </p>
              <button
                type="button"
                onClick={stopSession}
                className={cn(
                  'rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-muted)]',
                  interactiveStates,
                )}
              >
                Parar
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </Card>
  )
}
