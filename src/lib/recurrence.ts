import { addDays, addMonths, format, lastDayOfMonth, parseISO } from 'date-fns'

export interface RecurringTemplateSchedule {
  frequency: 'monthly' | 'weekly'
  dayOfMonth: number | null
  weekday: number | null
  startDate: string
  endDate: string | null
  lastGeneratedDate: string | null
}

function toDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

function clampToDayOfMonth(
  year: number,
  monthIndex: number,
  day: number,
): Date {
  const last = lastDayOfMonth(new Date(year, monthIndex, 1))
  return new Date(year, monthIndex, Math.min(day, last.getDate()))
}

/**
 * Datas que uma recorrência deveria ter gerado entre o cursor
 * (last_generated_date, ou start_date se nunca gerou) e hoje + 1 mês,
 * respeitando end_date. Não sabe nada de is_active/archived_at — quem
 * chama filtra isso antes de passar o template aqui (mesmo espírito de
 * streaks.ts: função pura recebendo dados já brutos). Domínio-neutra: usada
 * tanto por recorrências financeiras quanto por tarefas recorrentes.
 */
export function computeMissingOccurrences(
  template: RecurringTemplateSchedule,
  today: string,
): string[] {
  const horizon = toDateString(addMonths(parseISO(today), 1))
  const windowEnd =
    template.endDate && template.endDate < horizon ? template.endDate : horizon
  if (windowEnd < template.startDate) return []

  const after = template.lastGeneratedDate
  const occurrences: string[] = []

  if (template.frequency === 'monthly') {
    if (template.dayOfMonth == null) return []
    const start = parseISO(template.startDate)
    let cursor = new Date(start.getFullYear(), start.getMonth(), 1)
    const endCursor = parseISO(windowEnd)
    while (cursor <= endCursor) {
      const occurrence = toDateString(
        clampToDayOfMonth(
          cursor.getFullYear(),
          cursor.getMonth(),
          template.dayOfMonth,
        ),
      )
      if (
        occurrence >= template.startDate &&
        occurrence <= windowEnd &&
        (after == null || occurrence > after)
      ) {
        occurrences.push(occurrence)
      }
      cursor = addMonths(cursor, 1)
    }
  } else {
    if (template.weekday == null) return []
    let cursor = parseISO(template.startDate)
    const endCursor = parseISO(windowEnd)
    while (cursor <= endCursor) {
      if (cursor.getDay() === template.weekday) {
        const occurrence = toDateString(cursor)
        if (occurrence <= windowEnd && (after == null || occurrence > after)) {
          occurrences.push(occurrence)
        }
      }
      cursor = addDays(cursor, 1)
    }
  }

  return occurrences.sort()
}
