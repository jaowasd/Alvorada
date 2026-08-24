import { motion } from 'framer-motion'
import { Check, Flame, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { ItemMenu } from '@/components/ui/ItemMenu'
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
  return (
    <motion.div
      variants={listItemVariants}
      exit="exit"
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
        <Badge tone="success" className="mt-0.5 shrink-0">
          Concluído
        </Badge>
      )}
      <ItemMenu
        actions={[
          { label: 'Editar', icon: Pencil, onClick: () => onEdit(habit) },
          {
            label: 'Arquivar',
            icon: Trash2,
            onClick: () => onArchive(habit),
            tone: 'danger',
          },
        ]}
      />
    </motion.div>
  )
}
