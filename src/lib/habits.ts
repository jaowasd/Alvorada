import type { Habit } from '@/types/database'

/** Um hábito diário é sempre devido; um de dias específicos só nos weekdays configurados (0 = domingo). */
export function isHabitDueOnDate(
  habit: Habit,
  weekdays: number[],
  date: Date = new Date(),
): boolean {
  if (habit.frequency_type === 'daily') return true
  return weekdays.includes(date.getDay())
}
