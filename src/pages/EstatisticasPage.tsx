import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { subWeeks } from 'date-fns'
import { TrendingDown, TrendingUp } from 'lucide-react'
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
import { ConsistencyHeatmap } from '@/components/ui/ConsistencyHeatmap'
import { PageFade } from '@/components/ui/PageFade'
import { useAuth } from '@/hooks/useAuth'
import { buildConsistencyMap } from '@/lib/calendarGrid'
import { cn } from '@/lib/cn'
import { getLocalDateString } from '@/lib/date'
import {
  computeHabitBreakdown,
  computeHabitConsistencyByWeek,
  computeHabitConsistencyMonthComparison,
  computeRoutineCompletionByWeek,
  computeRoutineCompletionMonthComparison,
  computeRoutineTaskCorrelationInsight,
  computeTasksCompletedByWeek,
  computeTasksCompletedMonthComparison,
  type HabitBreakdownPoint,
  type MonthComparison,
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

function MonthComparisonRow({
  label,
  comparison,
  unit = '',
}: {
  label: string
  comparison: MonthComparison
  unit?: string
}) {
  const delta = comparison.currentValue - comparison.previousValue
  const tone =
    delta > 0
      ? 'text-success-600'
      : delta < 0
        ? 'text-error-500'
        : 'text-[var(--color-text-muted)]'
  return (
    <div className="flex items-center justify-between border-b border-[var(--color-border)] py-2 text-sm last:border-0">
      <span className="text-[var(--color-text)]">{label}</span>
      <span className="flex items-center gap-2">
        <span className="tabular-nums text-[var(--color-text-muted)]">
          {comparison.previousValue}
          {unit} → {comparison.currentValue}
          {unit}
        </span>
        {delta !== 0 && (
          <span
            className={cn('flex items-center gap-0.5 font-medium tabular-nums', tone)}
          >
            {delta > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(delta)}
            {unit}
          </span>
        )}
      </span>
    </div>
  )
}

function HabitBreakdownChart({ data }: { data: HabitBreakdownPoint[] }) {
  const height = Math.max(120, data.length * 36)
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
      >
        <CartesianGrid
          horizontal={false}
          stroke="var(--color-border)"
          strokeDasharray="3 3"
        />
        <XAxis
          type="number"
          domain={[0, 100]}
          tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
          axisLine={{ stroke: 'var(--color-border)' }}
          tickLine={false}
          unit="%"
        />
        <YAxis
          dataKey="name"
          type="category"
          width={96}
          tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          content={ChartTooltip}
          cursor={{ fill: 'var(--color-primary-500)', opacity: 0.08 }}
        />
        <Bar
          dataKey="percent"
          fill="var(--color-primary-600)"
          radius={[0, 4, 4, 0]}
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

  const habitBreakdown = useMemo(
    () =>
      computeHabitBreakdown(
        habits,
        habitWeekdaysByHabit,
        habitCompletions,
        WEEKS_COUNT,
      ),
    [habits, habitWeekdaysByHabit, habitCompletions],
  )

  const tasksMonthComparison = useMemo(
    () => computeTasksCompletedMonthComparison(tasks),
    [tasks],
  )
  const routineMonthComparison = useMemo(
    () => computeRoutineCompletionMonthComparison(totalSteps, routineCompletions),
    [totalSteps, routineCompletions],
  )
  const habitsMonthComparison = useMemo(
    () =>
      computeHabitConsistencyMonthComparison(
        habits,
        habitWeekdaysByHabit,
        habitCompletions,
      ),
    [habits, habitWeekdaysByHabit, habitCompletions],
  )

  const yearConsistencyMap = useMemo(
    () =>
      buildConsistencyMap(
        getLocalDateString(subWeeks(new Date(), 51)),
        getLocalDateString(),
        totalSteps,
        routineCompletions,
        habits,
        habitWeekdaysByHabit,
        habitCompletions,
      ),
    [totalSteps, routineCompletions, habits, habitWeekdaysByHabit, habitCompletions],
  )

  const correlationInsight = useMemo(
    () =>
      computeRoutineTaskCorrelationInsight(
        totalSteps,
        routineCompletions,
        tasks,
        WEEKS_COUNT,
      ),
    [totalSteps, routineCompletions, tasks],
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

      <Card className="p-6">
        <h2 className="text-sm font-semibold text-[var(--color-text)]">
          Comparação mensal
        </h2>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          Mês atual (até hoje) contra o mês anterior completo.
        </p>
        <div className="mt-4">
          <MonthComparisonRow label="Tarefas concluídas" comparison={tasksMonthComparison} />
          <MonthComparisonRow
            label="Conclusão da rotina"
            comparison={routineMonthComparison}
            unit="%"
          />
          <MonthComparisonRow
            label="Consistência de hábitos"
            comparison={habitsMonthComparison}
            unit="%"
          />
        </div>
      </Card>

      {habitBreakdown.length > 0 && (
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-[var(--color-text)]">
            Hábitos individualmente
          </h2>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            % de consistência de cada hábito nas últimas {WEEKS_COUNT} semanas.
          </p>
          <div className="mt-4">
            <HabitBreakdownChart data={habitBreakdown} />
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="text-sm font-semibold text-[var(--color-text)]">
          Consistência (12 meses)
        </h2>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          Visão ampliada do mapa de consistência do último ano.
        </p>
        <div className="mt-4">
          <ConsistencyHeatmap dataByDate={yearConsistencyMap} weeksCount={52} />
        </div>
      </Card>

      {correlationInsight && (
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-[var(--color-text)]">
            Insight
          </h2>
          <p className="mt-2 text-sm text-[var(--color-text)]">
            Nos dias em que você completa toda a rotina, você conclui em média{' '}
            <strong className="font-semibold">
              {correlationInsight.fullRoutineAvgTasks.toFixed(1)}
            </strong>{' '}
            tarefas — contra{' '}
            <strong className="font-semibold">
              {correlationInsight.otherAvgTasks.toFixed(1)}
            </strong>{' '}
            nos demais dias.
          </p>
        </Card>
      )}
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
