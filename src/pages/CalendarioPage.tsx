import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence } from 'framer-motion'
import { Check, ChevronLeft, ChevronRight, Circle, Wallet } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { PageFade } from '@/components/ui/PageFade'
import { useAuth } from '@/hooks/useAuth'
import {
  buildCalendarGrid,
  computeDayCompletionPercent,
  shiftMonth,
} from '@/lib/calendarGrid'
import { cn } from '@/lib/cn'
import { getLocalDateString } from '@/lib/date'
import { fetchTransactions } from '@/lib/queries/financas/transactions'
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
import { isHabitDueOnDate } from '@/lib/habits'
import { interactiveStates } from '@/lib/interactive-states'
import { centsToBRL } from '@/lib/money'
import type {
  FinanceTransaction,
  Habit,
  HabitCompletion,
  RoutineStep,
  RoutineStepCompletion,
  Task,
} from '@/types/database'

const WEEKDAY_HEADERS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const EMPTY_STEPS: RoutineStep[] = []
const EMPTY_HABITS: Habit[] = []
const EMPTY_ROUTINE_COMPLETIONS: RoutineStepCompletion[] = []
const EMPTY_HABIT_COMPLETIONS: HabitCompletion[] = []

function percentToBgClass(percent: number | null): string {
  if (!percent) return ''
  if (percent < 50) return 'bg-primary-500/10'
  if (percent < 100) return 'bg-primary-500/25'
  return 'bg-primary-500/40'
}

function formatDayLabel(date: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(`${date}T00:00:00`))
}

export function CalendarioPage() {
  const { user } = useAuth()
  const today = getLocalDateString()
  const [monthDate, setMonthDate] = useState(
    () => new Date(`${today}T00:00:00`),
  )
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

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

  const routineCompletionsQuery = useQuery({
    queryKey: ['allRoutineCompletions', user?.id],
    queryFn: () => fetchAllCompletions(user!.id),
    enabled: !!user,
  })
  const routineCompletions =
    routineCompletionsQuery.data ?? EMPTY_ROUTINE_COMPLETIONS

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

  const tasksQuery = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: () => fetchTasks(user!.id),
    enabled: !!user,
  })

  const transactionsQuery = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: () => fetchTransactions(user!.id),
    enabled: !!user,
  })

  const isLoading =
    routineQuery.isLoading ||
    habitsQuery.isLoading ||
    tasksQuery.isLoading ||
    transactionsQuery.isLoading
  const isError =
    routineQuery.isError ||
    habitsQuery.isError ||
    tasksQuery.isError ||
    transactionsQuery.isError

  const grid = useMemo(
    () => buildCalendarGrid(monthDate, today),
    [monthDate, today],
  )

  const percentByDate = useMemo(() => {
    const map = new Map<string, number | null>()
    for (const cell of grid) {
      if (!cell.inCurrentMonth) continue
      map.set(
        cell.date,
        computeDayCompletionPercent(
          cell.date,
          steps.length,
          routineCompletions,
          habits,
          habitWeekdaysByHabit,
          habitCompletions,
        ),
      )
    }
    return map
  }, [
    grid,
    steps.length,
    routineCompletions,
    habits,
    habitWeekdaysByHabit,
    habitCompletions,
  ])

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>()
    for (const task of tasksQuery.data ?? []) {
      if (!task.due_date) continue
      const list = map.get(task.due_date) ?? []
      list.push(task)
      map.set(task.due_date, list)
    }
    return map
  }, [tasksQuery.data])

  const transactionsByDate = useMemo(() => {
    const map = new Map<string, FinanceTransaction[]>()
    for (const transaction of transactionsQuery.data ?? []) {
      const list = map.get(transaction.due_date) ?? []
      list.push(transaction)
      map.set(transaction.due_date, list)
    }
    return map
  }, [transactionsQuery.data])

  const monthLabel = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(monthDate)

  const selectedDayTasks = selectedDate
    ? (tasksByDate.get(selectedDate) ?? [])
    : []
  const selectedDayTransactions = selectedDate
    ? (transactionsByDate.get(selectedDate) ?? [])
    : []
  const selectedDayCompletedStepIds = selectedDate
    ? new Set(
        routineCompletions
          .filter((c) => c.completion_date === selectedDate)
          .map((c) => c.routine_step_id),
      )
    : new Set<string>()
  const selectedDayDueHabits = selectedDate
    ? habits.filter((h) =>
        isHabitDueOnDate(
          h,
          habitWeekdaysByHabit.get(h.id) ?? [],
          new Date(`${selectedDate}T00:00:00`),
        ),
      )
    : []
  const selectedDayCompletedHabitIds = selectedDate
    ? new Set(
        habitCompletions
          .filter((c) => c.completion_date === selectedDate)
          .map((c) => c.habit_id),
      )
    : new Set<string>()

  const hasSelectedDayContent =
    steps.length > 0 ||
    selectedDayDueHabits.length > 0 ||
    selectedDayTasks.length > 0 ||
    selectedDayTransactions.length > 0

  return (
    <PageFade className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--color-text)]">
            Calendário
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Rotina, hábitos, tarefas e finanças num só lugar.
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMonthDate((m) => shiftMonth(m, -1))}
            aria-label="Mês anterior"
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]',
              interactiveStates,
            )}
          >
            <ChevronLeft size={16} />
          </button>
          <span className="min-w-[140px] text-center text-sm font-semibold text-[var(--color-text)]">
            {monthLabel}
          </span>
          <button
            type="button"
            onClick={() => setMonthDate((m) => shiftMonth(m, 1))}
            aria-label="Próximo mês"
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]',
              interactiveStates,
            )}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {isLoading && (
        <p
          role="status"
          aria-live="polite"
          className="mt-8 text-sm text-[var(--color-text-muted)]"
        >
          Carregando calendário…
        </p>
      )}
      {isError && (
        <p className="text-error-500 mt-8 text-sm">
          Não foi possível carregar o calendário. Tente novamente.
        </p>
      )}

      {!isLoading && !isError && (
        <div className="mt-6">
          <div className="grid grid-cols-7 gap-0.5 text-center text-[11px] font-semibold text-[var(--color-text-muted)] sm:gap-1">
            {WEEKDAY_HEADERS.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-0.5 sm:gap-1">
            {grid.map((cell) => {
              const percent = cell.inCurrentMonth
                ? (percentByDate.get(cell.date) ?? null)
                : null
              const hasPendingTask = (tasksByDate.get(cell.date) ?? []).some(
                (t) => !t.is_completed,
              )
              const hasPendingFinance = (
                transactionsByDate.get(cell.date) ?? []
              ).some((t) => t.status === 'planned')

              if (!cell.inCurrentMonth) {
                return <div key={cell.date} aria-hidden="true" />
              }

              return (
                <button
                  key={cell.date}
                  type="button"
                  onClick={() => setSelectedDate(cell.date)}
                  className={cn(
                    'flex aspect-square flex-col items-start gap-1 rounded-lg border p-1 text-left sm:p-1.5',
                    interactiveStates,
                    percentToBgClass(percent),
                    cell.isToday
                      ? 'border-primary-600'
                      : 'border-[var(--color-border)]',
                  )}
                >
                  <span
                    className={cn(
                      'text-[11px] font-medium',
                      cell.isToday
                        ? 'text-primary-600'
                        : 'text-[var(--color-text)]',
                    )}
                  >
                    {Number(cell.date.slice(-2))}
                  </span>
                  <div className="mt-auto flex gap-0.5">
                    {hasPendingTask && (
                      <span className="bg-primary-500 h-1.5 w-1.5 rounded-full" />
                    )}
                    {hasPendingFinance && (
                      <span className="bg-accent-500 h-1.5 w-1.5 rounded-full" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <AnimatePresence>
        {selectedDate && (
          <Modal
            title={formatDayLabel(selectedDate)}
            onClose={() => setSelectedDate(null)}
          >
            {!hasSelectedDayContent && (
              <p className="text-sm text-[var(--color-text-muted)]">
                Nada programado para esse dia.
              </p>
            )}

            {steps.length > 0 && (
              <div className="mb-4">
                <h3 className="mb-1.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase">
                  Rotina
                </h3>
                <div className="flex flex-col gap-1">
                  {steps.map((step) => (
                    <div
                      key={step.id}
                      className="flex items-center gap-2 text-sm text-[var(--color-text)]"
                    >
                      {selectedDayCompletedStepIds.has(step.id) ? (
                        <Check size={14} className="text-primary-600" />
                      ) : (
                        <Circle
                          size={14}
                          className="text-[var(--color-text-muted)]"
                        />
                      )}
                      {step.title}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedDayDueHabits.length > 0 && (
              <div className="mb-4">
                <h3 className="mb-1.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase">
                  Hábitos
                </h3>
                <div className="flex flex-col gap-1">
                  {selectedDayDueHabits.map((habit) => (
                    <div
                      key={habit.id}
                      className="flex items-center gap-2 text-sm text-[var(--color-text)]"
                    >
                      {selectedDayCompletedHabitIds.has(habit.id) ? (
                        <Check size={14} className="text-primary-600" />
                      ) : (
                        <Circle
                          size={14}
                          className="text-[var(--color-text-muted)]"
                        />
                      )}
                      {habit.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedDayTasks.length > 0 && (
              <div className="mb-4">
                <h3 className="mb-1.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase">
                  Tarefas
                </h3>
                <div className="flex flex-col gap-1">
                  {selectedDayTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-2 text-sm text-[var(--color-text)]"
                    >
                      {task.is_completed ? (
                        <Check size={14} className="text-primary-600" />
                      ) : (
                        <Circle
                          size={14}
                          className="text-[var(--color-text-muted)]"
                        />
                      )}
                      {task.title}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedDayTransactions.length > 0 && (
              <div>
                <h3 className="mb-1.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase">
                  Finanças
                </h3>
                <div className="flex flex-col gap-1">
                  {selectedDayTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between gap-2 text-sm text-[var(--color-text)]"
                    >
                      <span className="flex items-center gap-2">
                        <Wallet
                          size={14}
                          className={
                            transaction.status === 'confirmed'
                              ? 'text-primary-600'
                              : 'text-[var(--color-text-muted)]'
                          }
                        />
                        {transaction.description}
                      </span>
                      <span className="tabular-nums">
                        {centsToBRL(transaction.amount_cents)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Modal>
        )}
      </AnimatePresence>
    </PageFade>
  )
}
