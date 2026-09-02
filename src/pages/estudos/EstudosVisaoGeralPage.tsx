import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence } from 'framer-motion'
import { subDays } from 'date-fns'
import {
  CalendarDays,
  ChevronRight,
  Clock,
  Flame,
  GraduationCap,
  Pencil,
  Target,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, MotionCard } from '@/components/ui/Card'
import { ConsistencyHeatmap } from '@/components/ui/ConsistencyHeatmap'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { PageFade } from '@/components/ui/PageFade'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { StatTile } from '@/components/dashboard/StatTile'
import { StatsBar } from '@/components/dashboard/StatsBar'
import { StudyGoalForm } from '@/components/estudos/StudyGoalForm'
import { StudySessionItem } from '@/components/estudos/StudySessionItem'
import { StudyTimerCard } from '@/components/estudos/StudyTimerCard'
import { SubjectWeeklyProgressList } from '@/components/estudos/SubjectWeeklyProgress'
import { useAuth } from '@/hooks/useAuth'
import { useInlineFeedback } from '@/hooks/useInlineFeedback'
import { cn } from '@/lib/cn'
import { getLocalDateString } from '@/lib/date'
import { interactiveStates } from '@/lib/interactive-states'
import { staggerContainer } from '@/lib/motion'
import { fetchFocusSessions } from '@/lib/queries/focusSessions'
import { fetchStudyExamRecords } from '@/lib/queries/studyExamRecords'
import {
  fetchOrCreateStudySettings,
  updateStudySettings,
} from '@/lib/queries/studySettings'
import { fetchAllStudySubjects } from '@/lib/queries/studySubjects'
import { calculateDailyStreak } from '@/lib/streaks'
import {
  buildStudyConsistencyMap,
  computeExamAccuracy,
  computeWeeklyProgress,
  daysUntilExam,
  formatStudyMinutes,
  getStudiedDates,
  getWeekRange,
  sumStudyMinutes,
} from '@/lib/studies'
import {
  toStudySettingsInput,
  type StudySettingsFormValues,
} from '@/lib/validation/studySettings'
import type {
  FocusSession,
  StudyExamRecord,
  StudySubject,
} from '@/types/database'

const EMPTY_SESSIONS: FocusSession[] = []
const EMPTY_SUBJECTS: StudySubject[] = []
const EMPTY_RECORDS: StudyExamRecord[] = []
const HEATMAP_WEEKS = 26

export function EstudosVisaoGeralPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const today = getLocalDateString()
  const week = useMemo(() => getWeekRange(today), [today])
  const { message: feedback, show: showFeedback } = useInlineFeedback()
  const [goalModalOpen, setGoalModalOpen] = useState(false)

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

  const recordsQuery = useQuery({
    queryKey: ['studyExamRecords', user?.id],
    queryFn: () => fetchStudyExamRecords(user!.id),
    enabled: !!user,
  })
  const records = recordsQuery.data ?? EMPTY_RECORDS

  const settingsQuery = useQuery({
    queryKey: ['studySettings', user?.id],
    queryFn: () => fetchOrCreateStudySettings(user!.id),
    enabled: !!user,
  })
  const settings = settingsQuery.data

  const updateSettingsMutation = useMutation({
    mutationFn: (values: StudySettingsFormValues) =>
      updateStudySettings(user!.id, toStudySettingsInput(values)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['studySettings', user?.id],
      })
      setGoalModalOpen(false)
      showFeedback('Meta atualizada.')
    },
  })

  const activeSubjects = useMemo(
    () => subjects.filter((subject) => !subject.archived_at),
    [subjects],
  )
  const subjectsById = useMemo(
    () => new Map(subjects.map((subject) => [subject.id, subject])),
    [subjects],
  )

  const todayMinutes = sumStudyMinutes(sessions, today, today)
  const weekMinutes = sumStudyMinutes(sessions, week.start, week.end)
  const streak = useMemo(
    () => calculateDailyStreak(getStudiedDates(sessions), today),
    [sessions, today],
  )

  const last30Start = getLocalDateString(
    subDays(new Date(`${today}T00:00:00`), 29),
  )
  const recentAccuracy = useMemo(
    () =>
      computeExamAccuracy(
        records.filter((record) => record.exam_date >= last30Start),
      ),
    [records, last30Start],
  )

  const weeklyProgress = useMemo(
    () => computeWeeklyProgress(activeSubjects, sessions, week.start, week.end),
    [activeSubjects, sessions, week.start, week.end],
  )

  const weeklyGoalMinutes = settings?.weekly_goal_minutes ?? null
  const goalPercent = weeklyGoalMinutes
    ? Math.min(Math.round((weekMinutes / weeklyGoalMinutes) * 100), 100)
    : 0
  const daysLeft = daysUntilExam(settings?.exam_date ?? null, today)

  const consistencyMap = useMemo(
    () =>
      buildStudyConsistencyMap(
        sessions,
        weeklyGoalMinutes ? Math.round(weeklyGoalMinutes / 7) : 60,
        HEATMAP_WEEKS,
        today,
      ),
    [sessions, weeklyGoalMinutes, today],
  )

  const recentSessions = useMemo(() => sessions.slice(0, 5), [sessions])

  const isLoading =
    sessionsQuery.isLoading ||
    subjectsQuery.isLoading ||
    settingsQuery.isLoading
  const isError =
    sessionsQuery.isError || subjectsQuery.isError || settingsQuery.isError
  const hasNothingYet =
    !isLoading && subjects.length === 0 && sessions.length === 0

  return (
    <PageFade className="mx-auto max-w-3xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-[var(--color-text)]">
          Estudos
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Cronômetro, matérias e desempenho — tudo do seu edital em um lugar.
        </p>
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

      {isError && (
        <p className="text-error-500 mt-4 text-sm">
          Não foi possível carregar seus dados de estudo. Tente novamente.
        </p>
      )}

      <div className="mt-6 flex flex-col gap-6">
        {!isLoading && !isError && (
          <StatsBar>
            <StatTile
              label="Hoje"
              value={todayMinutes}
              suffix=" min"
              icon={Clock}
            />
            <StatTile
              label="Esta semana"
              value={weekMinutes}
              suffix=" min"
              icon={CalendarDays}
            />
            <StatTile
              label="Sequência"
              value={streak.currentStreak}
              suffix={streak.currentStreak === 1 ? ' dia' : ' dias'}
              icon={Flame}
            />
            <StatTile
              label="Aproveitamento"
              value={recentAccuracy.percent ?? 0}
              suffix="%"
              icon={Target}
            />
          </StatsBar>
        )}

        {isLoading && (
          <p
            role="status"
            aria-live="polite"
            className="text-sm text-[var(--color-text-muted)]"
          >
            Carregando seus estudos…
          </p>
        )}

        {/* O cronômetro fica fora de qualquer estado vazio: começar a estudar
            nunca depende de ter cadastrado matéria antes. */}
        <StudyTimerCard subjects={activeSubjects} sessions={sessions} />

        {hasNothingYet && (
          <EmptyState
            icon={GraduationCap}
            title="Comece a organizar seus estudos"
            description="Cadastre suas matérias e cronometre sessões para acompanhar seu progresso."
          />
        )}

        {!isLoading && !hasNothingYet && (
          <>
            <Card className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-[var(--color-text)]">
                    Meta da semana
                  </h2>
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    {week.start.split('-').reverse().slice(0, 2).join('/')} a{' '}
                    {week.end.split('-').reverse().slice(0, 2).join('/')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setGoalModalOpen(true)}
                  aria-label="Editar meta semanal e data da prova"
                  className={cn(
                    'inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]',
                    interactiveStates,
                  )}
                >
                  <Pencil size={14} />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-6">
                {weeklyGoalMinutes ? (
                  <>
                    <ProgressRing percent={goalPercent} size={92}>
                      <span className="font-heading text-sm font-bold text-[var(--color-text)]">
                        {goalPercent}%
                      </span>
                    </ProgressRing>
                    <div>
                      <p className="text-sm text-[var(--color-text)]">
                        {formatStudyMinutes(weekMinutes)} de{' '}
                        {formatStudyMinutes(weeklyGoalMinutes)}
                      </p>
                      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        {weekMinutes >= weeklyGoalMinutes
                          ? 'Meta batida. Bom trabalho!'
                          : `Faltam ${formatStudyMinutes(weeklyGoalMinutes - weekMinutes)}.`}
                      </p>
                    </div>
                  </>
                ) : (
                  <div>
                    <p className="text-sm text-[var(--color-text)]">
                      {formatStudyMinutes(weekMinutes)} estudados esta semana.
                    </p>
                    <Button
                      variant="ghost"
                      onClick={() => setGoalModalOpen(true)}
                      className="mt-2"
                    >
                      Definir meta semanal
                    </Button>
                  </div>
                )}

                {daysLeft !== null && daysLeft >= 0 && (
                  <Badge tone={daysLeft <= 30 ? 'primary' : 'neutral'}>
                    {daysLeft === 0
                      ? 'A prova é hoje'
                      : `Faltam ${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'} para a prova`}
                  </Badge>
                )}
              </div>
            </Card>

            {weeklyProgress.length > 0 && (
              <Card className="p-6">
                <h2 className="text-sm font-semibold text-[var(--color-text)]">
                  Por matéria, esta semana
                </h2>
                <div className="mt-4">
                  <SubjectWeeklyProgressList
                    progress={weeklyProgress}
                    subjectsById={subjectsById}
                  />
                </div>
              </Card>
            )}

            <section>
              <h2 className="mb-2 text-sm font-semibold text-[var(--color-text)]">
                Consistência
              </h2>
              <MotionCard>
                <ConsistencyHeatmap
                  dataByDate={consistencyMap}
                  weeksCount={HEATMAP_WEEKS}
                  today={today}
                />
              </MotionCard>
            </section>

            {recentSessions.length > 0 && (
              <section>
                <h2 className="mb-2 text-sm font-semibold text-[var(--color-text)]">
                  Últimas sessões
                </h2>
                <MotionCard
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                  className="divide-y divide-[var(--color-border)] overflow-hidden py-0"
                >
                  {recentSessions.map((session) => (
                    <StudySessionItem
                      key={session.id}
                      session={session}
                      subject={
                        session.subject_id
                          ? subjectsById.get(session.subject_id)
                          : undefined
                      }
                    />
                  ))}
                  <Link
                    to="sessoes"
                    className={cn(
                      'flex items-center justify-between px-4 py-3 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg)]',
                      interactiveStates,
                    )}
                  >
                    Ver todas as sessões
                    <ChevronRight size={16} />
                  </Link>
                </MotionCard>
              </section>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {goalModalOpen && (
          <Modal title="Meta de estudo" onClose={() => setGoalModalOpen(false)}>
            <StudyGoalForm
              initialSettings={settings ?? undefined}
              onSubmit={async (values) => {
                await updateSettingsMutation.mutateAsync(values)
              }}
              onCancel={() => setGoalModalOpen(false)}
            />
          </Modal>
        )}
      </AnimatePresence>
    </PageFade>
  )
}
