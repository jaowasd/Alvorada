import { motion } from 'framer-motion'
import { EASE_SMOOTH } from '@/lib/motion'
import { formatStudyMinutes, type SubjectWeeklyProgress } from '@/lib/studies'
import type { StudySubject } from '@/types/database'

interface SubjectWeeklyProgressListProps {
  progress: SubjectWeeklyProgress[]
  subjectsById: Map<string, StudySubject>
}

export function SubjectWeeklyProgressList({
  progress,
  subjectsById,
}: SubjectWeeklyProgressListProps) {
  return (
    <ul className="flex flex-col gap-3">
      {progress.map((item) => {
        const subject = subjectsById.get(item.subjectId)
        if (!subject) return null
        const color = subject.color
        const cappedPercent =
          item.percent === null ? null : Math.min(item.percent, 100)

        return (
          <li key={item.subjectId}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="inline-flex min-w-0 items-center gap-1.5 text-sm text-[var(--color-text)]">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="truncate">{subject.name}</span>
              </span>
              <span className="shrink-0 text-xs text-[var(--color-text-muted)] tabular-nums">
                {item.goalMinutes
                  ? `${formatStudyMinutes(item.minutes)} / ${formatStudyMinutes(item.goalMinutes)} · ${item.percent}%`
                  : formatStudyMinutes(item.minutes)}
              </span>
            </div>
            {cappedPercent !== null && (
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--color-bg)]">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: cappedPercent / 100 }}
                  transition={{ duration: 0.5, ease: EASE_SMOOTH }}
                  className="h-full w-full origin-left rounded-full"
                  style={{ backgroundColor: color }}
                />
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
