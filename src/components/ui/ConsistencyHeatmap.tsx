import { useMemo } from 'react'
import { addDays, eachWeekOfInterval, startOfWeek, subWeeks } from 'date-fns'
import { getLocalDateString } from '@/lib/date'
import { cn } from '@/lib/cn'

interface ConsistencyHeatmapProps {
  dataByDate: Map<string, number | null>
  weeksCount?: number
  today?: string
  className?: string
}

const WEEKDAY_DOT_LABELS = ['', 'S', '', 'Q', '', 'S', '']
const LEVEL_OPACITY = [0.06, 0.28, 0.5, 0.72, 1]

function levelForPercent(percent: number | null): number {
  if (percent == null || percent === 0) return 0
  if (percent < 40) return 1
  if (percent < 70) return 2
  if (percent < 100) return 3
  return 4
}

/** Mapa de consistência estilo GitHub: uma célula por dia, opacidade por faixa de % de conclusão. */
export function ConsistencyHeatmap({
  dataByDate,
  weeksCount = 26,
  today = getLocalDateString(),
  className,
}: ConsistencyHeatmapProps) {
  const todayDate = new Date(`${today}T00:00:00`)

  const weeks = useMemo(() => {
    const start = startOfWeek(subWeeks(todayDate, weeksCount - 1), {
      weekStartsOn: 0,
    })
    return eachWeekOfInterval(
      { start, end: todayDate },
      { weekStartsOn: 0 },
    ).map((weekStart) =>
      Array.from({ length: 7 }, (_, i) =>
        getLocalDateString(addDays(weekStart, i)),
      ),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weeksCount, today])

  const monthLabelByWeek = useMemo(() => {
    const map = new Map<number, string>()
    let lastMonth = ''
    weeks.forEach((week, index) => {
      const month = week[0].slice(0, 7)
      if (month !== lastMonth) {
        map.set(
          index,
          new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(
            new Date(`${week[0]}T00:00:00`),
          ),
        )
        lastMonth = month
      }
    })
    return map
  }, [weeks])

  return (
    <div className={className}>
      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-1">
          <div className="flex gap-1 pl-5">
            {weeks.map((week, weekIndex) => (
              <span
                key={week[0]}
                className="w-3 shrink-0 overflow-visible text-[10px] whitespace-nowrap text-[var(--color-text-muted)] capitalize"
              >
                {monthLabelByWeek.get(weekIndex) ?? ''}
              </span>
            ))}
          </div>
          <div className="flex gap-1">
            <div className="flex flex-col gap-1 pr-1">
              {WEEKDAY_DOT_LABELS.map((label, i) => (
                <span
                  key={i}
                  className="flex h-3 w-4 items-center text-[9px] text-[var(--color-text-muted)]"
                >
                  {label}
                </span>
              ))}
            </div>
            {weeks.map((week) => (
              <div key={week[0]} className="flex flex-col gap-1">
                {week.map((date) => {
                  const isFuture = date > today
                  const percent = isFuture
                    ? null
                    : (dataByDate.get(date) ?? null)
                  const level = levelForPercent(percent)
                  return (
                    <div
                      key={date}
                      title={
                        isFuture
                          ? undefined
                          : `${new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR')} — ${
                              percent == null
                                ? 'sem atividade programada'
                                : `${percent}%`
                            }`
                      }
                      className={cn(
                        'h-3 w-3 rounded-[3px]',
                        isFuture && 'border border-[var(--color-border)]',
                      )}
                      style={
                        isFuture
                          ? undefined
                          : {
                              backgroundColor: 'var(--color-primary-600)',
                              opacity: LEVEL_OPACITY[level],
                            }
                      }
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-[var(--color-text-muted)]">
        <span>Menos</span>
        {LEVEL_OPACITY.map((opacity, i) => (
          <span
            key={i}
            className="h-3 w-3 rounded-[3px]"
            style={{ backgroundColor: 'var(--color-primary-600)', opacity }}
          />
        ))}
        <span>Mais</span>
      </div>
    </div>
  )
}
