import { useState } from 'react'
import { Flame, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { StreakStats } from '@/lib/streaks'
import { WEEKDAY_LABELS } from '@/lib/validation/habit'
import type { Category, Habit } from '@/types/database'

interface HabitItemProps {
  habit: Habit
  category?: Category
  weekdays: number[]
  dueToday: boolean
  completedToday: boolean
  streak: StreakStats
  onToggleComplete: (habit: Habit) => void
  onEdit: (habit: Habit) => void
  onArchive: (habit: Habit) => void
}

export function HabitItem({
  habit,
  category,
  weekdays,
  dueToday,
  completedToday,
  streak,
  onToggleComplete,
  onEdit,
  onArchive,
}: HabitItemProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex items-start gap-3 px-4 py-3 transition hover:bg-[var(--color-bg)]">
      <input
        type="checkbox"
        checked={completedToday}
        disabled={!dueToday}
        onChange={() => onToggleComplete(habit)}
        aria-label={
          completedToday
            ? 'Marcar como não concluído hoje'
            : 'Marcar como concluído hoje'
        }
        className="accent-primary-500 mt-1 h-4 w-4 disabled:opacity-40"
      />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'text-sm font-medium text-[var(--color-text)]',
            !dueToday && 'text-[var(--color-text-muted)]',
          )}
        >
          {habit.name}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-muted)]">
          {category && (
            <span
              className="rounded-full px-2 py-0.5"
              style={{
                backgroundColor: `${category.color}1a`,
                color: category.color,
              }}
            >
              {category.name}
            </span>
          )}
          <span>
            {habit.frequency_type === 'daily'
              ? 'Todo dia'
              : weekdays.map((day) => WEEKDAY_LABELS[day]).join(', ')}
          </span>
          {habit.estimated_duration_minutes && (
            <span>{habit.estimated_duration_minutes} min</span>
          )}
          {!dueToday && <span>Não é hoje</span>}
          {streak.currentStreak > 0 && (
            <span className="text-primary-600 flex items-center gap-1 font-medium">
              <Flame size={12} /> {streak.currentStreak}{' '}
              {streak.currentStreak === 1 ? 'dia' : 'dias'}
            </span>
          )}
          {streak.bestStreak > 0 && <span>Recorde: {streak.bestStreak}</span>}
        </div>
        {habit.notes && (
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            {habit.notes}
          </p>
        )}
      </div>
      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Mais ações"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-border)]/30"
        >
          <MoreVertical size={16} />
        </button>
        {menuOpen && (
          <div className="absolute right-0 z-10 mt-1 w-36 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-sm">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                onEdit(habit)
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--color-border)]/30"
            >
              <Pencil size={14} /> Editar
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                onArchive(habit)
              }}
              className="text-error-500 flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--color-border)]/30"
            >
              <Trash2 size={14} /> Arquivar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
