import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { HabitForm } from '@/components/habits/HabitForm'
import { HabitItem } from '@/components/habits/HabitItem'
import { useAuth } from '@/hooks/useAuth'
import { getLocalDateString } from '@/lib/date'
import { isHabitDueOnDate } from '@/lib/habits'
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
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: HabitFormValues }) =>
      updateHabit(id, toHabitInput(values), values.weekdays ?? []),
    onSuccess: () => {
      invalidateHabits()
      invalidateFrequencyDays()
      closeModal()
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

  const handleArchive = (habit: Habit) => {
    if (window.confirm(`Arquivar o hábito "${habit.name}"?`)) {
      archiveMutation.mutate(habit)
    }
  }

  const handleFormSubmit = async (values: HabitFormValues) => {
    if (editingHabit) {
      await updateMutation.mutateAsync({ id: editingHabit.id, values })
    } else {
      await createMutation.mutateAsync(values)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Hábitos</h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Sono, hidratação, exercícios, estudos, meditação — todo dia ou em
            dias específicos.
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-1.5">
          <Plus size={16} /> Novo
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {habitsQuery.isLoading && (
          <p className="text-sm text-[var(--color-text-muted)]">
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
            <Card className="p-8 text-center text-sm text-[var(--color-text-muted)]">
              Nenhum hábito ainda. Crie o primeiro para começar a construir sua
              consistência.
            </Card>
          )}
        {habits.map((habit) => {
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
      </div>

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
    </div>
  )
}
