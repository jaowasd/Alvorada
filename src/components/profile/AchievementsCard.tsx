import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Award,
  BookMarked,
  BookOpen,
  CheckCircle2,
  Flame,
  HeartPulse,
  Sparkles,
  Trophy,
  type LucideIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'
import { computeAchievements } from '@/lib/achievements'
import { cn } from '@/lib/cn'
import { getLocalDateString } from '@/lib/date'
import { fetchAllHabitCompletions } from '@/lib/queries/habits'
import { fetchAllJournalEntries } from '@/lib/queries/journal'
import {
  fetchAllCompletions,
  fetchOrCreateActiveRoutine,
  fetchRoutineSteps,
} from '@/lib/queries/routines'
import { fetchTasks } from '@/lib/queries/tasks'
import {
  calculateRoutineStreak,
  getFullyCompletedRoutineDates,
} from '@/lib/streaks'

const ACHIEVEMENT_ICONS: Record<string, LucideIcon> = {
  routine_streak_7: Flame,
  routine_streak_30: Trophy,
  tasks_10: CheckCircle2,
  tasks_100: Award,
  habits_50: HeartPulse,
  habits_200: Sparkles,
  journal_1: BookOpen,
  journal_7: BookMarked,
}

export function AchievementsCard() {
  const { user } = useAuth()
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

  const allRoutineCompletionsQuery = useQuery({
    queryKey: ['allRoutineCompletions', user?.id],
    queryFn: () => fetchAllCompletions(user!.id),
    enabled: !!user,
  })

  const tasksQuery = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: () => fetchTasks(user!.id),
    enabled: !!user,
  })

  const allHabitCompletionsQuery = useQuery({
    queryKey: ['allHabitCompletions', user?.id],
    queryFn: () => fetchAllHabitCompletions(user!.id),
    enabled: !!user,
  })

  const journalEntriesQuery = useQuery({
    queryKey: ['journalEntries', user?.id],
    queryFn: () => fetchAllJournalEntries(user!.id),
    enabled: !!user,
  })

  const isLoading =
    routineQuery.isLoading ||
    tasksQuery.isLoading ||
    allHabitCompletionsQuery.isLoading ||
    journalEntriesQuery.isLoading

  const achievements = useMemo(() => {
    const routineBestStreak = calculateRoutineStreak(
      getFullyCompletedRoutineDates(
        allRoutineCompletionsQuery.data ?? [],
        stepsQuery.data?.length ?? 0,
      ),
      today,
    ).bestStreak

    return computeAchievements({
      routineBestStreak,
      completedTasksCount: (tasksQuery.data ?? []).filter((t) => t.is_completed)
        .length,
      habitCompletionsCount: (allHabitCompletionsQuery.data ?? []).length,
      journalEntriesCount: (journalEntriesQuery.data ?? []).length,
    })
  }, [
    allRoutineCompletionsQuery.data,
    stepsQuery.data?.length,
    tasksQuery.data,
    allHabitCompletionsQuery.data,
    journalEntriesQuery.data,
    today,
  ])

  if (isLoading) return null

  return (
    <Card className="mt-6 p-6">
      <h2 className="text-sm font-semibold text-[var(--color-text)]">
        Conquistas
      </h2>
      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
        Marcos que você já alcançou usando o Alvorada.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {achievements.map(
          ({ key, label, description, achieved, current, target }) => {
            const Icon = ACHIEVEMENT_ICONS[key]
            return (
              <div
                key={key}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-xl border p-3 text-center',
                  achieved
                    ? 'border-primary-600 bg-primary-500/10'
                    : 'border-[var(--color-border)]',
                )}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full',
                    achieved
                      ? 'bg-primary-500/10 text-primary-600'
                      : 'bg-[var(--color-bg)] text-[var(--color-text-muted)]',
                  )}
                >
                  <Icon size={20} />
                </div>
                <p className="text-xs font-semibold text-[var(--color-text)]">
                  {label}
                </p>
                <p className="text-[11px] text-[var(--color-text-muted)]">
                  {description}
                </p>
                {achieved ? (
                  <Badge tone="success">Conquistado</Badge>
                ) : (
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-bg)]">
                    <div
                      className="bg-primary-500 h-full rounded-full"
                      style={{ width: `${(current / target) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            )
          },
        )}
      </div>
    </Card>
  )
}
