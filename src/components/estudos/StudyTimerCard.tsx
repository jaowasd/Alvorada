import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence } from 'framer-motion'
import { Timer } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/cn'
import { getLocalDateString } from '@/lib/date'
import { interactiveStates } from '@/lib/interactive-states'
import {
  completeFocusSession,
  fetchActiveFocusSession,
  startFocusSession,
  stopFocusSession,
} from '@/lib/queries/focusSessions'
import { fetchTasks } from '@/lib/queries/tasks'
import {
  formatStudyMinutes,
  getWeekRange,
  sumStudyMinutes,
  type StudySessionLike,
} from '@/lib/studies'
import {
  FOCUS_SESSION_LABEL_MAX_LENGTH,
  FOCUS_TIMER_MAX_MINUTES,
} from '@/lib/validation/focusSession'
import type { FocusSession, StudySubject, Task } from '@/types/database'

const DURATION_PRESETS = [25, 45, 60, 90]
const EMPTY_TASKS: Task[] = []

interface StudyTimerCardProps {
  subjects: StudySubject[]
  sessions: StudySessionLike[]
}

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function StudyTimerCard({ subjects, sessions }: StudyTimerCardProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const today = getLocalDateString()
  const week = useMemo(() => getWeekRange(today), [today])

  const [durationMinutes, setDurationMinutes] = useState(25)
  const [customMinutes, setCustomMinutes] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [taskId, setTaskId] = useState('')
  const [label, setLabel] = useState('')

  const [startedSession, setStartedSession] = useState<FocusSession | null>(
    null,
  )
  const [dismissedSessionId, setDismissedSessionId] = useState<string | null>(
    null,
  )
  const [nowMs, setNowMs] = useState(() => Date.now())
  const [confirmingStop, setConfirmingStop] = useState(false)
  const [announcement, setAnnouncement] = useState<string | null>(null)
  const finishedIdRef = useRef<string | null>(null)

  const tasksQuery = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: () => fetchTasks(user!.id),
    enabled: !!user,
  })
  const openTasks = useMemo(
    () => (tasksQuery.data ?? EMPTY_TASKS).filter((task) => !task.is_completed),
    [tasksQuery.data],
  )

  /**
   * Sessão pendente no banco. É o que permite retomar o cronômetro depois de
   * navegar para outra página de Estudos: started_at e duração já estão
   * gravados, então nada precisa de localStorage nem do componente montado.
   */
  const activeSessionQuery = useQuery({
    queryKey: ['activeFocusSession', user?.id],
    queryFn: () => fetchActiveFocusSession(user!.id),
    enabled: !!user,
  })

  // Estado derivado, não copiado: a sessão em andamento é a que acabou de ser
  // iniciada ou a pendente que veio do banco, desde que não tenha sido
  // encerrada nesta tela.
  const candidateSession = startedSession ?? activeSessionQuery.data ?? null
  const activeSession =
    candidateSession && candidateSession.id !== dismissedSessionId
      ? candidateSession
      : null

  const startedAtMs = activeSession
    ? Date.parse(activeSession.started_at)
    : null
  const runningMinutes = activeSession?.duration_minutes ?? durationMinutes
  const elapsedSeconds =
    startedAtMs === null ? 0 : Math.floor((nowMs - startedAtMs) / 1000)
  const secondsLeft = Math.max(runningMinutes * 60 - elapsedSeconds, 0)
  const elapsedMinutes = Math.floor(elapsedSeconds / 60)
  // Uma sessão pendente que já passou do fim (usuário fechou a aba) não volta
  // a rodar: fica registrada como interrompida, que é o que ela foi.
  const isRunning = activeSession !== null && secondsLeft > 0

  const invalidateSessions = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: ['focusSessions', user?.id],
    })
    void queryClient.invalidateQueries({
      queryKey: ['activeFocusSession', user?.id],
    })
  }, [queryClient, user?.id])

  const completeMutation = useMutation({
    mutationFn: (id: string) => completeFocusSession(id),
    onSuccess: invalidateSessions,
  })

  const stopMutation = useMutation({
    mutationFn: ({ id, minutes }: { id: string; minutes: number }) =>
      stopFocusSession(id, minutes),
    onSuccess: invalidateSessions,
  })

  const startMutation = useMutation({
    mutationFn: () =>
      startFocusSession(user!.id, {
        task_id: taskId || null,
        subject_id: subjectId || null,
        label: label.trim() ? label.trim() : null,
        duration_minutes: durationMinutes,
      }),
    onSuccess: (session) => {
      setStartedSession(session)
      setDismissedSessionId(null)
      setNowMs(Date.now())
      setConfirmingStop(false)
      setAnnouncement(`Sessão de ${durationMinutes} minutos iniciada.`)
    },
  })

  /**
   * Relógio de parede em vez de decrementar um contador: navegadores
   * estrangulam setInterval em aba de fundo e um decremento acumularia atraso.
   * A conclusão sai daqui (e não de um efeito próprio) porque é o mesmo tique
   * que descobre que o tempo acabou.
   */
  useEffect(() => {
    if (!isRunning || !activeSession) return

    const endMs =
      Date.parse(activeSession.started_at) +
      activeSession.duration_minutes * 60_000

    const interval = setInterval(() => {
      const now = Date.now()
      setNowMs(now)
      if (now < endMs || finishedIdRef.current === activeSession.id) return

      finishedIdRef.current = activeSession.id
      completeMutation.mutate(activeSession.id)
      setDismissedSessionId(activeSession.id)
      setStartedSession(null)
      setConfirmingStop(false)
      setAnnouncement(
        `Sessão concluída — ${activeSession.duration_minutes} min.`,
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, activeSession, completeMutation])

  useEffect(() => {
    if (!announcement) return
    const timeout = setTimeout(() => setAnnouncement(null), 5000)
    return () => clearTimeout(timeout)
  }, [announcement])

  const closeSession = (session: FocusSession) => {
    finishedIdRef.current = session.id
    setDismissedSessionId(session.id)
    setStartedSession(null)
    setConfirmingStop(false)
  }

  const handleRequestStop = () => {
    if (!activeSession) return
    // Escape e clique-fora não podem descartar em silêncio o tempo já feito.
    if (elapsedMinutes >= 1) {
      setConfirmingStop(true)
      return
    }
    closeSession(activeSession)
    invalidateSessions()
  }

  const handleRegisterPartial = () => {
    if (!activeSession) return
    stopMutation.mutate({ id: activeSession.id, minutes: elapsedMinutes })
    setAnnouncement(`Sessão registrada — ${elapsedMinutes} min.`)
    closeSession(activeSession)
  }

  const handleDiscard = () => {
    if (!activeSession) return
    closeSession(activeSession)
    invalidateSessions()
  }

  const handleCustomMinutes = (value: string) => {
    setCustomMinutes(value)
    const parsed = Number(value)
    if (
      value !== '' &&
      Number.isInteger(parsed) &&
      parsed > 0 &&
      parsed <= FOCUS_TIMER_MAX_MINUTES
    ) {
      setDurationMinutes(parsed)
    }
  }

  const todayMinutes = sumStudyMinutes(sessions, today, today)
  const weekMinutes = sumStudyMinutes(sessions, week.start, week.end)
  const runningSubject = activeSession?.subject_id
    ? subjects.find((subject) => subject.id === activeSession.subject_id)
    : undefined

  return (
    <Card className="p-6">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text)]">
        <Timer size={16} className="text-primary-600" />
        Modo Foco
      </h2>
      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
        Cronometre uma sessão. Ela entra no histórico de estudos ao terminar.
      </p>

      <div className="mt-3 flex flex-wrap items-end gap-2">
        {DURATION_PRESETS.map((minutes) => (
          <button
            key={minutes}
            type="button"
            onClick={() => {
              setDurationMinutes(minutes)
              setCustomMinutes('')
            }}
            aria-pressed={durationMinutes === minutes && customMinutes === ''}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-sm font-medium',
              interactiveStates,
              durationMinutes === minutes && customMinutes === ''
                ? 'border-primary-600 bg-primary-500/10 text-primary-600'
                : 'border-[var(--color-border)] text-[var(--color-text-muted)]',
            )}
          >
            {minutes} min
          </button>
        ))}
        <Input
          aria-label={`Duração personalizada em minutos, até ${FOCUS_TIMER_MAX_MINUTES}`}
          inputMode="numeric"
          placeholder="Outro"
          value={customMinutes}
          onChange={(event) => handleCustomMinutes(event.target.value)}
          className="w-20"
        />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Select
          value={subjectId}
          onChange={(event) => setSubjectId(event.target.value)}
          aria-label="Matéria (opcional)"
        >
          <option value="">Sem matéria</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </Select>
        {openTasks.length > 0 && (
          <Select
            value={taskId}
            onChange={(event) => setTaskId(event.target.value)}
            aria-label="Vincular a uma tarefa (opcional)"
          >
            <option value="">Sem tarefa vinculada</option>
            {openTasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </Select>
        )}
      </div>

      <div className="mt-3">
        <Input
          aria-label="Assunto da sessão"
          placeholder="O que você vai estudar?"
          maxLength={FOCUS_SESSION_LABEL_MAX_LENGTH}
          value={label}
          onChange={(event) => setLabel(event.target.value)}
        />
      </div>

      <Button
        type="button"
        onClick={() => startMutation.mutate()}
        disabled={startMutation.isPending || isRunning}
        className="mt-4"
      >
        {startMutation.isPending ? 'Iniciando…' : 'Iniciar foco'}
      </Button>

      <p
        role="status"
        aria-live="polite"
        className="text-success-600 mt-2 text-xs"
      >
        {announcement}
      </p>

      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
        Hoje: {formatStudyMinutes(todayMinutes)} · Esta semana:{' '}
        {formatStudyMinutes(weekMinutes)}
      </p>

      <AnimatePresence>
        {isRunning && activeSession && (
          <Modal title="Modo Foco" onClose={handleRequestStop}>
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              {runningSubject && (
                <p className="text-sm font-medium text-[var(--color-text)]">
                  {runningSubject.name}
                </p>
              )}
              {activeSession.label && (
                <p className="text-sm text-[var(--color-text-muted)]">
                  {activeSession.label}
                </p>
              )}

              {/*
                aria-live="off": um relógio que muda a cada segundo dentro de
                uma região viva inundaria o leitor de tela. Início e fim são
                anunciados pelo <p role="status"> do card.
              */}
              <p
                role="timer"
                aria-live="off"
                className="numeric-display text-6xl text-[var(--color-text)]"
              >
                {formatClock(secondsLeft)}
              </p>

              {confirmingStop ? (
                <div className="flex flex-col items-center gap-2">
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Você já estudou {formatStudyMinutes(elapsedMinutes)}.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button
                      type="button"
                      onClick={handleRegisterPartial}
                      disabled={stopMutation.isPending}
                    >
                      {stopMutation.isPending
                        ? 'Salvando…'
                        : `Registrar ${elapsedMinutes} min e sair`}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleDiscard}
                      disabled={stopMutation.isPending}
                    >
                      Descartar
                    </Button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConfirmingStop(false)}
                    className={cn(
                      'text-xs font-medium text-[var(--color-text-muted)]',
                      interactiveStates,
                    )}
                  >
                    Continuar estudando
                  </button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleRequestStop}
                >
                  Parar
                </Button>
              )}
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </Card>
  )
}
