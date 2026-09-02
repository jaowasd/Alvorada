import { motion } from 'framer-motion'
import { Archive, Pencil, RotateCcw, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { ItemMenu } from '@/components/ui/ItemMenu'
import { formatStudyMinutes } from '@/lib/studies'
import { EASE_SMOOTH, listItemVariants } from '@/lib/motion'
import type { StudySubject } from '@/types/database'

interface StudySubjectItemProps {
  subject: StudySubject
  weekMinutes: number
  /** Quantos registros dependem da matéria — decide arquivar vs excluir. */
  historyCount: number
  onEdit: (subject: StudySubject) => void
  onArchive: (subject: StudySubject) => void
  onUnarchive: (subject: StudySubject) => void
  onDelete: (subject: StudySubject) => void
}

export function StudySubjectItem({
  subject,
  weekMinutes,
  historyCount,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
}: StudySubjectItemProps) {
  const isArchived = subject.archived_at !== null
  const goalMinutes = subject.weekly_goal_minutes
  const percent = goalMinutes
    ? Math.min(Math.round((weekMinutes / goalMinutes) * 100), 100)
    : null

  return (
    <motion.div
      variants={listItemVariants}
      exit="exit"
      className="px-4 py-3 transition-colors hover:bg-[var(--color-bg)]"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: subject.color }}
        />

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[var(--color-text)]">
            {subject.name}
          </p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            {goalMinutes
              ? `${formatStudyMinutes(weekMinutes)} de ${formatStudyMinutes(goalMinutes)} esta semana`
              : `${formatStudyMinutes(weekMinutes)} esta semana · sem meta`}
          </p>

          {percent !== null && (
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--color-bg)]">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: percent / 100 }}
                transition={{ duration: 0.5, ease: EASE_SMOOTH }}
                className="h-full w-full origin-left rounded-full"
                style={{ backgroundColor: subject.color }}
              />
            </div>
          )}
        </div>

        {isArchived && (
          <Badge tone="neutral" className="mt-0.5 shrink-0">
            Arquivada
          </Badge>
        )}

        <ItemMenu
          triggerLabel={`Ações de ${subject.name}`}
          actions={[
            { label: 'Editar', icon: Pencil, onClick: () => onEdit(subject) },
            ...(isArchived
              ? [
                  {
                    label: 'Reativar',
                    icon: RotateCcw,
                    onClick: () => onUnarchive(subject),
                  },
                ]
              : [
                  {
                    label: 'Arquivar',
                    icon: Archive,
                    onClick: () => onArchive(subject),
                  },
                ]),
            // Excluir só quando não há nada apontando pra matéria: com
            // histórico, arquivar é a saída que preserva as estatísticas.
            ...(historyCount === 0
              ? [
                  {
                    label: 'Excluir',
                    icon: Trash2,
                    onClick: () => onDelete(subject),
                    tone: 'danger' as const,
                  },
                ]
              : []),
          ]}
        />
      </div>
    </motion.div>
  )
}
