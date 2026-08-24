import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Flame,
  Trophy,
  Wallet,
} from 'lucide-react'
import { MotionCard } from '@/components/ui/Card'
import { PageFade } from '@/components/ui/PageFade'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { ChecklistItem } from '@/components/dashboard/ChecklistItem'
import { FocusLauncherCard } from '@/components/dashboard/FocusLauncherCard'
import { JournalCard } from '@/components/dashboard/JournalCard'
import { StatTile } from '@/components/dashboard/StatTile'
import { StatsBar } from '@/components/dashboard/StatsBar'
import { useAuth } from '@/hooks/useAuth'
import { useDisplayName } from '@/hooks/useProfile'
import { getGreeting, getLocalDateString } from '@/lib/date'
import { isHabitDueOnDate } from '@/lib/habits'
import { staggerContainer } from '@/lib/motion'
import { formatNumber } from '@/lib/number'
import {
  calculateRoutineStreak,
  getFullyCompletedRoutineDates,
} from '@/lib/streaks'
import {
  completeHabit,
  fetchHabitCompletionsForDate,
  fetchHabitFrequencyDays,
  fetchHabits,
  uncompleteHabit,
} from '@/lib/queries/habits'
import {
  completeRoutineStep,
  fetchAllCompletions,
  fetchCompletionsForDate,
  fetchOrCreateActiveRoutine,
  fetchRoutineSteps,
  uncompleteRoutineStep,
} from '@/lib/queries/routines'
import { fetchTasks, setTaskCompleted } from '@/lib/queries/tasks'
import type { Habit, RoutineStep, Task } from '@/types/database'

const EMPTY_STEPS: RoutineStep[] = []
const EMPTY_HABITS: Habit[] = []
const EMPTY_TASKS: Task[] = []

export function DashboardPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const today = getLocalDateString()

  const routineQuery = useQuery({
    queryKey: ['routine', user?.id],
    queryFn: () => fetchOrCreateActiveRoutine(user!.id),
    enabled: !!user,
  })
  const routine = routineQuery.data

  const stepsQuery = useQuery({
    queryKey: ['routineSteps', routine?.id],
    queryFn: () => fetchRoutineSteps(routine!.id),
    enabled: !!routine,
  })
  const steps = stepsQuery.data ?? EMPTY_STEPS

  const routineCompletionsTodayQuery = useQuery({
    queryKey: ['routineCompletions', user?.id, today],
    queryFn: () => fetchCompletionsForDate(user!.id, today),
    enabled: !!user,
  })
  const completedStepIds = useMemo(
    () =>
      new Set(
        (routineCompletionsTodayQuery.data ?? []).map((c) => c.routine_step_id),
      ),
    [routineCompletionsTodayQuery.data],
  )

  const allRoutineCompletionsQuery = useQuery({
    queryKey: ['allRoutineCompletions', user?.id],
    queryFn: () => fetchAllCompletions(user!.id),
    enabled: !!user,
  })

  const routineStreak = useMemo(() => {
    const fullyCompletedDates = getFullyCompletedRoutineDates(
      allRoutineCompletionsQuery.data ?? [],
      steps.length,
    )
    return calculateRoutineStreak(fullyCompletedDates, today)
  }, [allRoutineCompletionsQuery.data, steps.length, today])

  const habitsQuery = useQuery({
    queryKey: ['habits', user?.id],
    queryFn: () => fetchHabits(user!.id),
    enabled: !!user,
  })
  const habits = habitsQuery.data ?? EMPTY_HABITS
  const habitIds = useMemo(() => habits.map((h) => h.id), [habits])

  const frequencyDaysQuery = useQuery({
    queryKey: ['habitFrequencyDays', habitIds],
    queryFn: () => fetchHabitFrequencyDays(habitIds),
    enabled: habitIds.length > 0,
  })
  const weekdaysByHabit = useMemo(() => {
    const map = new Map<string, number[]>()
    for (const row of frequencyDaysQuery.data ?? []) {
      const list = map.get(row.habit_id) ?? []
      list.push(row.weekday)
      map.set(row.habit_id, list)
    }
    return map
  }, [frequencyDaysQuery.data])

  const dueHabitsToday = useMemo(
    () =>
      habits.filter((h) =>
        isHabitDueOnDate(h, weekdaysByHabit.get(h.id) ?? []),
      ),
    [habits, weekdaysByHabit],
  )

  const habitCompletionsTodayQuery = useQuery({
    queryKey: ['habitCompletions', user?.id, today],
    queryFn: () => fetchHabitCompletionsForDate(user!.id, today),
    enabled: !!user,
  })
  const completedHabitIds = useMemo(
    () =>
      new Set((habitCompletionsTodayQuery.data ?? []).map((c) => c.habit_id)),
    [habitCompletionsTodayQuery.data],
  )

  const tasksQuery = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: () => fetchTasks(user!.id),
    enabled: !!user,
  })
  const tasks = tasksQuery.data ?? EMPTY_TASKS
  const todayTasks = useMemo(
    () => tasks.filter((t) => t.due_date === today),
    [tasks, today],
  )
  const lateTasks = useMemo(
    () =>
      tasks.filter((t) => t.due_date && t.due_date < today && !t.is_completed),
    [tasks, today],
  )

  const toggleStepMutation = useMutation({
    mutationFn: (step: RoutineStep) =>
      completedStepIds.has(step.id)
        ? uncompleteRoutineStep(step.id, today)
        : completeRoutineStep(user!.id, step.id, today),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['routineCompletions', user?.id, today],
      })
      queryClient.invalidateQueries({
        queryKey: ['allRoutineCompletions', user?.id],
      })
    },
  })

  const toggleHabitMutation = useMutation({
    mutationFn: (habit: Habit) =>
      completedHabitIds.has(habit.id)
        ? uncompleteHabit(habit.id, today)
        : completeHabit(user!.id, habit.id, today),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['habitCompletions', user?.id, today],
      })
      queryClient.invalidateQueries({
        queryKey: ['allHabitCompletions', user?.id],
      })
    },
  })

  const toggleTaskMutation = useMutation({
    mutationFn: (task: Task) => setTaskCompleted(task.id, !task.is_completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] })
    },
  })

  const completedHabitsDueToday = dueHabitsToday.filter((h) =>
    completedHabitIds.has(h.id),
  ).length
  const completedTasksToday = todayTasks.filter((t) => t.is_completed).length

  const totalDue = steps.length + dueHabitsToday.length + todayTasks.length
  const totalCompleted =
    completedStepIds.size + completedHabitsDueToday + completedTasksToday
  const progressPercent =
    totalDue > 0 ? Math.round((totalCompleted / totalDue) * 100) : 0

  const isLoading =
    routineQuery.isLoading ||
    stepsQuery.isLoading ||
    habitsQuery.isLoading ||
    tasksQuery.isLoading
  const isError =
    routineQuery.isError ||
    stepsQuery.isError ||
    habitsQuery.isError ||
    tasksQuery.isError

  const firstName = useDisplayName()

  return (
    <PageFade className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="font-heading text-3xl font-bold text-[var(--color-text)]">
            {getGreeting()},{' '}
            <span className="font-medium text-[var(--color-text-muted)]">
              {firstName}
            </span>
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            {isLoading
              ? 'Carregando seu dia…'
              : totalDue > 0
                ? `${formatNumber(totalCompleted)} de ${formatNumber(totalDue)} concluídos hoje`
                : 'Nada programado para hoje ainda'}
          </p>
        </div>
        {totalDue > 0 && (
          <ProgressRing percent={progressPercent} size={88} strokeWidth={8}>
            <span className="text-lg font-bold tabular-nums">
              <AnimatedNumber value={progressPercent} suffix="%" />
            </span>
          </ProgressRing>
        )}
      </div>

      <div className="mt-6">
        <StatsBar>
          <StatTile
            label="Sequência atual"
            value={routineStreak.currentStreak}
            icon={Flame}
          />
          <StatTile
            label="Recorde"
            value={routineStreak.bestStreak}
            icon={Trophy}
          />
          <StatTile
            label="Concluído hoje"
            value={progressPercent}
            suffix="%"
            icon={CheckCircle2}
          />
          <StatTile
            label="Atrasadas"
            value={lateTasks.length}
            icon={AlertTriangle}
            tone={lateTasks.length > 0 ? 'error' : 'default'}
          />
        </StatsBar>
      </div>

      <Link
        to="/app/financas"
        className="mt-4 flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-bg)]"
      >
        <span className="flex items-center gap-2">
          <Wallet size={16} className="text-primary-600" />
          Ver Finanças
        </span>
        <ChevronRight size={16} className="text-[var(--color-text-muted)]" />
      </Link>

      {isLoading && (
        <p
          role="status"
          aria-live="polite"
          className="mt-8 text-sm text-[var(--color-text-muted)]"
        >
          Carregando…
        </p>
      )}
      {isError && (
        <p className="text-error-500 mt-8 text-sm">
          Não foi possível carregar seu dia. Tente novamente.
        </p>
      )}

      {!isLoading && !isError && (
        <div className="mt-8 flex flex-col gap-6">
          {lateTasks.length > 0 && (
            <section>
              <h2 className="text-error-500 mb-2 text-sm font-semibold">
                Atrasadas
              </h2>
              <MotionCard
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="divide-y divide-[var(--color-border)] overflow-hidden py-0"
              >
                {lateTasks.map((task) => (
                  <ChecklistItem
                    key={task.id}
                    title={task.title}
                    completed={task.is_completed}
                    late
                    onToggle={() => toggleTaskMutation.mutate(task)}
                  />
                ))}
              </MotionCard>
            </section>
          )}

          <section>
            <h2 className="mb-2 text-sm font-semibold text-[var(--color-text)]">
              Rotina matinal
            </h2>
            {steps.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)]">
                Sua rotina ainda não tem etapas. Adicione em "Rotina".
              </p>
            ) : (
              <MotionCard
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="divide-y divide-[var(--color-border)] overflow-hidden py-0"
              >
                {steps.map((step) => (
                  <ChecklistItem
                    key={step.id}
                    title={step.title}
                    completed={completedStepIds.has(step.id)}
                    onToggle={() => toggleStepMutation.mutate(step)}
                  />
                ))}
              </MotionCard>
            )}
          </section>

          <section>
            <h2 className="mb-2 text-sm font-semibold text-[var(--color-text)]">
              Hábitos de hoje
            </h2>
            {dueHabitsToday.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)]">
                Nenhum hábito programado para hoje.
              </p>
            ) : (
              <MotionCard
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="divide-y divide-[var(--color-border)] overflow-hidden py-0"
              >
                {dueHabitsToday.map((habit) => (
                  <ChecklistItem
                    key={habit.id}
                    title={habit.name}
                    completed={completedHabitIds.has(habit.id)}
                    onToggle={() => toggleHabitMutation.mutate(habit)}
                  />
                ))}
              </MotionCard>
            )}
          </section>

          <section>
            <h2 className="mb-2 text-sm font-semibold text-[var(--color-text)]">
              Tarefas de hoje
            </h2>
            {todayTasks.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)]">
                Nenhuma tarefa para hoje.
              </p>
            ) : (
              <MotionCard
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="divide-y divide-[var(--color-border)] overflow-hidden py-0"
              >
                {todayTasks.map((task) => (
                  <ChecklistItem
                    key={task.id}
                    title={task.title}
                    completed={task.is_completed}
                    onToggle={() => toggleTaskMutation.mutate(task)}
                  />
                ))}
              </MotionCard>
            )}
          </section>

          {totalDue > 0 && totalCompleted === totalDue && (
            <MotionCard
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-primary-600 p-6 text-center text-sm font-medium"
            >
              Tudo pronto por hoje. Bom trabalho!
            </MotionCard>
          )}

          <FocusLauncherCard />

          <JournalCard />
        </div>
      )}
    </PageFade>
  )
}
