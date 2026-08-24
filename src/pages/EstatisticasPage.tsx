import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts'
import { PremiumGate } from '@/components/premium/PremiumGate'
import { Card } from '@/components/ui/Card'
import { PageFade } from '@/components/ui/PageFade'
import { useAuth } from '@/hooks/useAuth'
import {
  computeHabitConsistencyByWeek,
  computeRoutineCompletionByWeek,
  computeTasksCompletedByWeek,
  type WeeklyPoint,
} from '@/lib/statsCalculations'
import {
  fetchAllHabitCompletions,
  fetchHabitFrequencyDays,
  fetchHabits,
} from '@/lib/queries/habits'
import {
  fetchAllCompletions,
  fetchOrCreateActiveRoutine,
  fetchRoutineSteps,
} from '@/lib/queries/routines'
import { fetchTasks } from '@/lib/queries/tasks'
import type {
  Habit,
  HabitCompletion,
  RoutineStepCompletion,
  Task,
} from '@/types/database'

const EMPTY_HABITS: Habit[] = []
const EMPTY_HABIT_COMPLETIONS: HabitCompletion[] = []
const EMPTY_ROUTINE_COMPLETIONS: RoutineStepCompletion[] = []
const EMPTY_TASKS: Task[] = []
const WEEKS_COUNT = 8

function ChartTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="shadow-popover rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs">
      <p className="font-medium text-[var(--color-text)]">{label}</p>
      <p className="text-[var(--color-text-muted)]">{payload[0].value}</p>
    </div>
  )
}

function WeeklyLineChart({
  data,
  unit,
}: {
  data: WeeklyPoint[]
  unit: string
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart
        data={data}
        margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
      >
        <CartesianGrid
          vertical={false}
          stroke="var(--color-border)"
          strokeDasharray="3 3"
        />
        <XAxis
          dataKey="label"
          tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
          axisLine={{ stroke: 'var(--color-border)' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={36}
          unit={unit}
        />
        <Tooltip
          content={ChartTooltip}
          cursor={{ stroke: 'var(--color-border)' }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="var(--color-primary-600)"
          strokeWidth={2}
          dot={{ r: 3, fill: 'var(--color-primary-600)', strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

function WeeklyBarChart({ data }: { data: WeeklyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid
          vertical={false}
          stroke="var(--color-border)"
          strokeDasharray="3 3"
        />
        <XAxis
          dataKey="label"
          tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
          axisLine={{ stroke: 'var(--color-border)' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={28}
          allowDecimals={false}
        />
        <Tooltip
          content={ChartTooltip}
          cursor={{ fill: 'var(--color-primary-500)', opacity: 0.08 }}
        />
        <Bar
          dataKey="value"
          fill="var(--color-primary-600)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

function EstatisticasContent() {
  const { user } = useAuth()

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
  const habitWeekdaysByHabit = useMemo(() => {
    const map = new Map<string, number[]>()
    for (const row of frequencyDaysQuery.data ?? []) {
      const list = map.get(row.habit_id) ?? []
      list.push(row.weekday)
      map.set(row.habit_id, list)
    }
    return map
  }, [frequencyDaysQuery.data])

  const habitCompletionsQuery = useQuery({
    queryKey: ['allHabitCompletions', user?.id],
    queryFn: () => fetchAllHabitCompletions(user!.id),
    enabled: !!user,
  })
  const habitCompletions = habitCompletionsQuery.data ?? EMPTY_HABIT_COMPLETIONS

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
  const totalSteps = stepsQuery.data?.length ?? 0

  const routineCompletionsQuery = useQuery({
    queryKey: ['allRoutineCompletions', user?.id],
    queryFn: () => fetchAllCompletions(user!.id),
    enabled: !!user,
  })
  const routineCompletions =
    routineCompletionsQuery.data ?? EMPTY_ROUTINE_COMPLETIONS

  const tasksQuery = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: () => fetchTasks(user!.id),
    enabled: !!user,
  })
  const tasks = tasksQuery.data ?? EMPTY_TASKS

  const isLoading =
    habitsQuery.isLoading || routineQuery.isLoading || tasksQuery.isLoading

  const habitSeries = useMemo(
    () =>
      computeHabitConsistencyByWeek(
        habits,
        habitWeekdaysByHabit,
        habitCompletions,
        WEEKS_COUNT,
      ),
    [habits, habitWeekdaysByHabit, habitCompletions],
  )

  const routineSeries = useMemo(
    () =>
      computeRoutineCompletionByWeek(
        totalSteps,
        routineCompletions,
        WEEKS_COUNT,
      ),
    [totalSteps, routineCompletions],
  )

  const tasksSeries = useMemo(
    () => computeTasksCompletedByWeek(tasks, WEEKS_COUNT),
    [tasks],
  )

  if (isLoading) {
    return (
      <p
        role="status"
        aria-live="polite"
        className="text-sm text-[var(--color-text-muted)]"
      >
        Carregando estatísticas…
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-6">
        <h2 className="text-sm font-semibold text-[var(--color-text)]">
          Consistência de hábitos
        </h2>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          % de hábitos devidos concluídos, por semana.
        </p>
        <div className="mt-4">
          <WeeklyLineChart data={habitSeries} unit="%" />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-sm font-semibold text-[var(--color-text)]">
          Conclusão da rotina matinal
        </h2>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          Média diária de % de etapas concluídas, por semana.
        </p>
        <div className="mt-4">
          <WeeklyLineChart data={routineSeries} unit="%" />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-sm font-semibold text-[var(--color-text)]">
          Tarefas concluídas
        </h2>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          Número de tarefas concluídas, por semana.
        </p>
        <div className="mt-4">
          <WeeklyBarChart data={tasksSeries} />
        </div>
      </Card>
    </div>
  )
}

export function EstatisticasPage() {
  return (
    <PageFade className="mx-auto max-w-3xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-[var(--color-text)]">
          Estatísticas
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Sua evolução de hábitos, rotina e tarefas nas últimas {WEEKS_COUNT}{' '}
          semanas.
        </p>
      </div>

      <div className="mt-6">
        <PremiumGate
          title="Estatísticas avançadas"
          description="Veja gráficos de evolução de hábitos, rotina e tarefas ao longo do tempo com o plano Premium."
        >
          <EstatisticasContent />
        </PremiumGate>
      </div>
    </PageFade>
  )
}
