import { motion } from 'framer-motion'
import { Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { ItemMenu } from '@/components/ui/ItemMenu'
import { cn } from '@/lib/cn'
import { listItemVariants } from '@/lib/motion'
import { formatStudyMinutes } from '@/lib/studies'
import type { FocusSession, StudySubject } from '@/types/database'

interface StudySessionItemProps {
  session: FocusSession
  subject?: StudySubject
  onEdit?: (session: FocusSession) => void
  onDelete?: (session: FocusSession) => void
}

function formatTime(isoDate: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoDate))
}

export function StudySessionItem({
  session,
  subject,
  onEdit,
  onDelete,
}: StudySessionItemProps) {
  const isInterrupted = session.completed_at === null
  const showMenu = !!onEdit || !!onDelete

  return (
    <motion.div
      variants={listItemVariants}
      exit="exit"
      className={cn(
        'px-4 py-3 transition-colors hover:bg-[var(--color-bg)]',
        // Sessão interrompida não soma minutos: a opacidade reforça o que a
        // etiqueta já diz, nunca substitui ela.
        isInterrupted && 'opacity-70',
      )}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 text-xs text-[var(--color-text-muted)] tabular-nums">
          {formatTime(session.started_at)}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {subject && (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-text)]">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: subject.color }}
                />
                {subject.name}
              </span>
            )}
            {!subject && (
              <span className="text-sm font-medium text-[var(--color-text-muted)]">
                Sem matéria
              </span>
            )}
            <Badge tone={isInterrupted ? 'neutral' : 'primary'}>
              {formatStudyMinutes(session.duration_minutes)}
            </Badge>
            {isInterrupted && <Badge tone="neutral">Interrompida</Badge>}
          </div>
          {session.label && (
            <p className="mt-1 truncate text-xs text-[var(--color-text-muted)]">
              {session.label}
            </p>
          )}
        </div>

        {showMenu && (
          <ItemMenu
            triggerLabel="Ações da sessão"
            actions={[
              ...(onEdit
                ? [
                    {
                      label: 'Editar',
                      icon: Pencil,
                      onClick: () => onEdit(session),
                    },
                  ]
                : []),
              ...(onDelete
                ? [
                    {
                      label: 'Excluir',
                      icon: Trash2,
                      onClick: () => onDelete(session),
                      tone: 'danger' as const,
                    },
                  ]
                : []),
            ]}
          />
        )}
      </div>
    </motion.div>
  )
}
