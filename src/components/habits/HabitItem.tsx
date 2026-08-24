import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Flame, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { listItemVariants } from '@/lib/motion'
import { formatNumber } from '@/lib/number'
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
    <motion.div
      variants={listItemVariants}
      className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[var(--color-bg)]"
    >
      <label className="relative mt-0.5 inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center">
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
          className="peer sr-only"
        />
        <span
          className={cn(
            'h-[18px] w-[18px] rounded-md border transition-colors',
            completedToday
              ? 'border-primary-600 bg-primary-600'
              : 'border-[var(--color-border)] bg-[var(--color-surface)]',
            !dueToday && 'opacity-40',
          )}
        />
        <Check
          size={12}
          strokeWidth={3}
          className={cn(
            'pointer-events-none absolute text-white transition-opacity',
            completedToday ? 'opacity-100' : 'opacity-0',
          )}
        />
      </label>
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
            <span>{formatNumber(habit.estimated_duration_minutes)} min</span>
          )}
          {!dueToday && <span>Não é hoje</span>}
          {streak.currentStreak > 0 && (
            <span className="text-primary-600 flex items-center gap-1 font-medium">
              <Flame size={12} /> {formatNumber(streak.currentStreak)}{' '}
              {streak.currentStreak === 1 ? 'dia' : 'dias'}
            </span>
          )}
          {streak.bestStreak > 0 && (
            <span>Recorde: {formatNumber(streak.bestStreak)}</span>
          )}
        </div>
        {habit.notes && (
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            {habit.notes}
          </p>
        )}
      </div>
      {dueToday && completedToday && (
        <span className="bg-success-500/10 text-success-600 mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium">
          Concluído
        </span>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Mais ações"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-border)]/40"
        >
          <MoreVertical size={16} />
        </button>
        {menuOpen && (
          <div className="shadow-card-lg absolute right-0 z-10 mt-1 w-36 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-1">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                onEdit(habit)
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--color-bg)]"
            >
              <Pencil size={14} /> Editar
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                onArchive(habit)
              }}
              className="text-error-500 flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--color-bg)]"
            >
              <Trash2 size={14} /> Arquivar
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
