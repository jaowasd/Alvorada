import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence } from 'framer-motion'
import { HeartPulse, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { MotionCard } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { PageFade } from '@/components/ui/PageFade'
import { HabitForm } from '@/components/habits/HabitForm'
import { HabitItem } from '@/components/habits/HabitItem'
import { useAuth } from '@/hooks/useAuth'
import { useInlineFeedback } from '@/hooks/useInlineFeedback'
import { getLocalDateString } from '@/lib/date'
import { isHabitDueOnDate } from '@/lib/habits'
import { staggerContainer } from '@/lib/motion'
import { calculateHabitStreak } from '@/lib/streaks'
import { fetchCategories } from '@/lib/queries/categories'
import {
  archiveHabit,
  completeHabit,
  createHabit,
  fetchAllHabitCompletions,
  fetchHabitCompletionsForDate,
  fetchHabitFrequencyDays,
  fetchHabits,
  uncompleteHabit,
  updateHabit,
} from '@/lib/queries/habits'
import { toHabitInput, type HabitFormValues } from '@/lib/validation/habit'
import type { Category, Habit } from '@/types/database'

const EMPTY_CATEGORIES: Category[] = []
const EMPTY_HABITS: Habit[] = []

export function HabitosPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const today = getLocalDateString()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [archiveTarget, setArchiveTarget] = useState<Habit | null>(null)
  const [search, setSearch] = useState('')
  const { message: feedback, show: showFeedback } = useInlineFeedback()

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

  const completionsQuery = useQuery({
    queryKey: ['habitCompletions', user?.id, today],
    queryFn: () => fetchHabitCompletionsForDate(user!.id, today),
    enabled: !!user,
  })
  const completedHabitIds = useMemo(
    () => new Set((completionsQuery.data ?? []).map((c) => c.habit_id)),
    [completionsQuery.data],
  )

  const allCompletionsQuery = useQuery({
    queryKey: ['allHabitCompletions', user?.id],
    queryFn: () => fetchAllHabitCompletions(user!.id),
    enabled: !!user,
  })
  const completionDatesByHabit = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const completion of allCompletionsQuery.data ?? []) {
      const list = map.get(completion.habit_id) ?? []
      list.push(completion.completion_date)
      map.set(completion.habit_id, list)
    }
    return map
  }, [allCompletionsQuery.data])

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    enabled: !!user,
  })
  const categories = categoriesQuery.data ?? EMPTY_CATEGORIES
  const categoriesById = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  )

  const invalidateHabits = () =>
    queryClient.invalidateQueries({ queryKey: ['habits', user?.id] })
  const invalidateFrequencyDays = () =>
    queryClient.invalidateQueries({
      queryKey: ['habitFrequencyDays', habitIds],
    })
  const invalidateCompletions = () => {
    queryClient.invalidateQueries({
      queryKey: ['habitCompletions', user?.id, today],
    })
    queryClient.invalidateQueries({
      queryKey: ['allHabitCompletions', user?.id],
    })
  }

  const createMutation = useMutation({
    mutationFn: (values: HabitFormValues) =>
      createHabit(user!.id, toHabitInput(values), values.weekdays ?? []),
    onSuccess: () => {
      invalidateHabits()
      invalidateFrequencyDays()
      closeModal()
      showFeedback('Hábito criado.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: HabitFormValues }) =>
      updateHabit(id, toHabitInput(values), values.weekdays ?? []),
    onSuccess: () => {
      invalidateHabits()
      invalidateFrequencyDays()
      closeModal()
      showFeedback('Hábito atualizado.')
    },
  })

  const archiveMutation = useMutation({
    mutationFn: (habit: Habit) => archiveHabit(habit.id),
    onSuccess: invalidateHabits,
  })

  const toggleMutation = useMutation({
    mutationFn: (habit: Habit) =>
      completedHabitIds.has(habit.id)
        ? uncompleteHabit(habit.id, today)
        : completeHabit(user!.id, habit.id, today),
    onSuccess: invalidateCompletions,
  })

  const closeModal = () => {
    setModalOpen(false)
    setEditingHabit(null)
  }

  const openCreateModal = () => {
    setEditingHabit(null)
    setModalOpen(true)
  }

  const openEditModal = (habit: Habit) => {
    setEditingHabit(habit)
    setModalOpen(true)
  }

  const handleArchive = (habit: Habit) => setArchiveTarget(habit)

  const handleConfirmArchive = () => {
    if (!archiveTarget) return
    archiveMutation.mutate(archiveTarget, {
      onSuccess: () => setArchiveTarget(null),
    })
  }

  const handleFormSubmit = async (values: HabitFormValues) => {
    if (editingHabit) {
      await updateMutation.mutateAsync({ id: editingHabit.id, values })
    } else {
      await createMutation.mutateAsync(values)
    }
  }

  const filteredHabits = useMemo(
    () =>
      habits.filter((habit) =>
        habit.name.toLowerCase().includes(search.trim().toLowerCase()),
      ),
    [habits, search],
  )

  return (
    <PageFade className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--color-text)]">
            Hábitos
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Sono, hidratação, exercícios, estudos, meditação — todo dia ou em
            dias específicos.
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-1.5">
          <Plus size={16} /> Novo
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

      <div className="relative mt-6 max-w-xs">
        <Search
          size={16}
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[var(--color-text-muted)]"
        />
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar hábito…"
          className="focus:border-primary-500 focus:ring-primary-500/30 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pr-3 pl-9 text-sm text-[var(--color-text)] transition outline-none focus:ring-2"
        />
      </div>

      <div className="mt-6">
        {habitsQuery.isLoading && (
          <p
            role="status"
            aria-live="polite"
            className="text-sm text-[var(--color-text-muted)]"
          >
            Carregando hábitos…
          </p>
        )}
        {habitsQuery.isError && (
          <p className="text-error-500 text-sm">
            Não foi possível carregar seus hábitos. Tente novamente.
          </p>
        )}
        {habits.length === 0 &&
          !habitsQuery.isLoading &&
          !habitsQuery.isError && (
            <EmptyState
              icon={HeartPulse}
              title="Nenhum hábito ainda"
              description="Crie o primeiro para começar a construir sua consistência."
              action={{ label: 'Criar hábito', onClick: openCreateModal }}
            />
          )}
        {habits.length > 0 && filteredHabits.length === 0 && (
          <EmptyState
            icon={Search}
            title={`Nenhum hábito encontrado para "${search}"`}
          />
        )}
        {filteredHabits.length > 0 && (
          <MotionCard
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="divide-y divide-[var(--color-border)] overflow-hidden py-0"
          >
            <AnimatePresence>
              {filteredHabits.map((habit) => {
                const weekdays = weekdaysByHabit.get(habit.id) ?? []
                const dueToday = isHabitDueOnDate(habit, weekdays)
                const streak = calculateHabitStreak(
                  completionDatesByHabit.get(habit.id) ?? [],
                  habit.frequency_type,
                  weekdays,
                  today,
                )
                return (
                  <HabitItem
                    key={habit.id}
                    habit={habit}
                    category={
                      habit.category_id
                        ? categoriesById.get(habit.category_id)
                        : undefined
                    }
                    weekdays={weekdays}
                    dueToday={dueToday}
                    completedToday={completedHabitIds.has(habit.id)}
                    streak={streak}
                    onToggleComplete={(h) => toggleMutation.mutate(h)}
                    onEdit={openEditModal}
                    onArchive={handleArchive}
                  />
                )
              })}
            </AnimatePresence>
          </MotionCard>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <Modal
            title={editingHabit ? 'Editar hábito' : 'Novo hábito'}
            onClose={closeModal}
          >
            <HabitForm
              categories={categories}
              initialHabit={editingHabit ?? undefined}
              initialWeekdays={
                editingHabit ? weekdaysByHabit.get(editingHabit.id) : undefined
              }
              onSubmit={handleFormSubmit}
              onCancel={closeModal}
            />
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {archiveTarget && (
          <ConfirmDialog
            title="Arquivar hábito"
            message={`Arquivar o hábito "${archiveTarget.name}"?`}
            confirmLabel="Arquivar"
            isPending={archiveMutation.isPending}
            onConfirm={handleConfirmArchive}
            onClose={() => setArchiveTarget(null)}
          />
        )}
      </AnimatePresence>
    </PageFade>
  )
}
