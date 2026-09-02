import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence } from 'framer-motion'
import { subDays } from 'date-fns'
import { Plus, Timer } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { MotionCard } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { PageFade } from '@/components/ui/PageFade'
import { Select } from '@/components/ui/Select'
import { StudySessionForm } from '@/components/estudos/StudySessionForm'
import { StudySessionItem } from '@/components/estudos/StudySessionItem'
import { useAuth } from '@/hooks/useAuth'
import { useInlineFeedback } from '@/hooks/useInlineFeedback'
import { cn } from '@/lib/cn'
import { getLocalDateString } from '@/lib/date'
import { interactiveStates } from '@/lib/interactive-states'
import { staggerContainer } from '@/lib/motion'
import {
  deleteFocusSession,
  fetchFocusSessions,
  logFocusSession,
  updateFocusSession,
} from '@/lib/queries/focusSessions'
import { fetchAllStudySubjects } from '@/lib/queries/studySubjects'
import {
  computeDailyAverageMinutes,
  formatStudyMinutes,
  sumStudyMinutes,
} from '@/lib/studies'
import {
  toStudySessionTimestamps,
  type StudySessionFormValues,
} from '@/lib/validation/studySession'
import type { FocusSession, StudySubject } from '@/types/database'

const EMPTY_SESSIONS: FocusSession[] = []
const EMPTY_SUBJECTS: StudySubject[] = []

type PeriodFilter = '7' | '30' | 'all'

const PERIOD_TABS: { value: PeriodFilter; label: string }[] = [
  { value: '7', label: '7 dias' },
  { value: '30', label: '30 dias' },
  { value: 'all', label: 'Tudo' },
]

function formatDayHeading(date: string, today: string): string {
  if (date === today) return 'Hoje'
  const yesterday = getLocalDateString(
    subDays(new Date(`${today}T00:00:00`), 1),
  )
  if (date === yesterday) return 'Ontem'
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

export function SessoesPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const today = getLocalDateString()
  const { message: feedback, show: showFeedback } = useInlineFeedback()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<FocusSession | null>(
    null,
  )
  const [deletingSession, setDeletingSession] = useState<FocusSession | null>(
    null,
  )
  const [subjectFilter, setSubjectFilter] = useState('')
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('30')

  const sessionsQuery = useQuery({
    queryKey: ['focusSessions', user?.id],
    queryFn: () => fetchFocusSessions(user!.id),
    enabled: !!user,
  })
  const sessions = sessionsQuery.data ?? EMPTY_SESSIONS

  const subjectsQuery = useQuery({
    queryKey: ['studySubjects', user?.id, 'all'],
    queryFn: () => fetchAllStudySubjects(user!.id),
    enabled: !!user,
  })
  const subjects = subjectsQuery.data ?? EMPTY_SUBJECTS

  const subjectsById = useMemo(
    () => new Map(subjects.map((subject) => [subject.id, subject])),
    [subjects],
  )
  const activeSubjects = useMemo(
    () => subjects.filter((subject) => !subject.archived_at),
    [subjects],
  )

  const invalidateSessions = () => {
    void queryClient.invalidateQueries({
      queryKey: ['focusSessions', user?.id],
    })
    void queryClient.invalidateQueries({
      queryKey: ['activeFocusSession', user?.id],
    })
  }

  const createMutation = useMutation({
    mutationFn: (values: StudySessionFormValues) => {
      const { input, startedAt, completedAt } = toStudySessionTimestamps(values)
      return logFocusSession(user!.id, input, startedAt, completedAt)
    },
    onSuccess: () => {
      invalidateSessions()
      closeModal()
      showFeedback('Sessão registrada.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string
      values: StudySessionFormValues
    }) => {
      const { input, startedAt, completedAt } = toStudySessionTimestamps(values)
      return updateFocusSession(id, input, startedAt, completedAt)
    },
    onSuccess: () => {
      invalidateSessions()
      closeModal()
      showFeedback('Sessão atualizada.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFocusSession(id),
    onSuccess: () => {
      invalidateSessions()
      setDeletingSession(null)
      showFeedback('Sessão excluída.')
    },
  })

  const closeModal = () => {
    setModalOpen(false)
    setEditingSession(null)
  }

  const openCreateModal = () => {
    setEditingSession(null)
    setModalOpen(true)
  }

  const handleFormSubmit = async (values: StudySessionFormValues) => {
    if (editingSession) {
      await updateMutation.mutateAsync({ id: editingSession.id, values })
    } else {
      await createMutation.mutateAsync(values)
    }
  }

  const fromDate =
    periodFilter === 'all'
      ? null
      : getLocalDateString(
          subDays(new Date(`${today}T00:00:00`), Number(periodFilter) - 1),
        )

  const filteredSessions = useMemo(
    () =>
      sessions.filter((session) => {
        if (subjectFilter && session.subject_id !== subjectFilter) return false
        if (!fromDate) return true
        return getLocalDateString(new Date(session.started_at)) >= fromDate
      }),
    [sessions, subjectFilter, fromDate],
  )

  const groupedByDay = useMemo(() => {
    const groups = new Map<string, FocusSession[]>()
    for (const session of filteredSessions) {
      const date = getLocalDateString(new Date(session.started_at))
      const list = groups.get(date) ?? []
      list.push(session)
      groups.set(date, list)
    }
    return [...groups.entries()].sort((a, b) => b[0].localeCompare(a[0]))
  }, [filteredSessions])

  const filteredMinutes = sumStudyMinutes(filteredSessions)
  // Só faz sentido com uma janela fechada: "média/dia desde sempre" diluiria
  // o número por todo o tempo desde a primeira sessão.
  const dailyAverageMinutes =
    fromDate && filteredSessions.length > 0
      ? computeDailyAverageMinutes(filteredSessions, fromDate, today)
      : null
  const hasAnySession = sessions.length > 0
  const isFiltering = subjectFilter !== '' || periodFilter !== 'all'

  return (
    <PageFade className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--color-text)]">
            Sessões
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Tudo que você cronometrou — e o que estudou fora do app.
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-1.5">
          <Plus size={16} /> Registrar sessão
        </Button>
      </div>

      {feedback && (
        <p
          role="status"
          aria-live="polite"
          className="text-success-600 mt-2 text-xs"
        >
          {feedback}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {PERIOD_TABS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setPeriodFilter(item.value)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium',
                interactiveStates,
                periodFilter === item.value
                  ? 'bg-primary-500/10 text-primary-600'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <Select
          value={subjectFilter}
          onChange={(event) => setSubjectFilter(event.target.value)}
          aria-label="Filtrar por matéria"
          className="w-full sm:w-56"
        >
          <option value="">Todas as matérias</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </Select>
      </div>

      <p className="mt-3 text-xs text-[var(--color-text-muted)]">
        {formatStudyMinutes(filteredMinutes)} · {filteredSessions.length}{' '}
        {filteredSessions.length === 1 ? 'sessão' : 'sessões'}
        {dailyAverageMinutes !== null &&
          ` · média de ${formatStudyMinutes(dailyAverageMinutes)}/dia`}
      </p>

      <div className="mt-4">
        {sessionsQuery.isLoading && (
          <p
            role="status"
            aria-live="polite"
            className="text-sm text-[var(--color-text-muted)]"
          >
            Carregando sessões…
          </p>
        )}
        {sessionsQuery.isError && (
          <p className="text-error-500 text-sm">
            Não foi possível carregar suas sessões. Tente novamente.
          </p>
        )}

        {!sessionsQuery.isLoading &&
          !sessionsQuery.isError &&
          !hasAnySession && (
            <EmptyState
              icon={Timer}
              title="Nenhuma sessão registrada"
              description="Use o cronômetro na visão geral ou registre uma sessão que você já fez."
              action={{ label: 'Registrar sessão', onClick: openCreateModal }}
            />
          )}

        {/* Filtro sem resultado não é feature vazia — não usa EmptyState. */}
        {!sessionsQuery.isLoading &&
          hasAnySession &&
          filteredSessions.length === 0 &&
          isFiltering && (
            <p className="text-sm text-[var(--color-text-muted)]">
              Nenhuma sessão com esses filtros.
            </p>
          )}

        <div className="flex flex-col gap-6">
          {groupedByDay.map(([date, daySessions]) => (
            <section key={date}>
              <h2 className="mb-2 text-sm font-semibold text-[var(--color-text)]">
                {formatDayHeading(date, today)}
              </h2>
              <MotionCard
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="divide-y divide-[var(--color-border)] overflow-hidden py-0"
              >
                <AnimatePresence>
                  {daySessions.map((session) => (
                    <StudySessionItem
                      key={session.id}
                      session={session}
                      subject={
                        session.subject_id
                          ? subjectsById.get(session.subject_id)
                          : undefined
                      }
                      onEdit={(item) => {
                        setEditingSession(item)
                        setModalOpen(true)
                      }}
                      onDelete={setDeletingSession}
                    />
                  ))}
                </AnimatePresence>
              </MotionCard>
            </section>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <Modal
            title={editingSession ? 'Editar sessão' : 'Registrar sessão'}
            onClose={closeModal}
          >
            <StudySessionForm
              initialSession={editingSession ?? undefined}
              subjects={activeSubjects}
              onSubmit={handleFormSubmit}
              onCancel={closeModal}
            />
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deletingSession && (
          <ConfirmDialog
            title="Excluir sessão"
            confirmLabel="Excluir"
            isPending={deleteMutation.isPending}
            message={`Excluir esta sessão de ${formatStudyMinutes(
              deletingSession.duration_minutes,
            )}? O tempo sai das suas estatísticas.`}
            onConfirm={() => deleteMutation.mutate(deletingSession.id)}
            onClose={() => setDeletingSession(null)}
          />
        )}
      </AnimatePresence>
    </PageFade>
  )
}
