import { motion } from 'framer-motion'
import { Pencil, Trash2 } from 'lucide-react'
import { Badge, type BadgeTone } from '@/components/ui/Badge'
import { ItemMenu } from '@/components/ui/ItemMenu'
import { cn } from '@/lib/cn'
import { EASE_SMOOTH, listItemVariants } from '@/lib/motion'
import type {
  StudyExamKind,
  StudyExamRecord,
  StudySubject,
} from '@/types/database'

interface StudyExamRecordItemProps {
  record: StudyExamRecord
  subject?: StudySubject
  onEdit: (record: StudyExamRecord) => void
  onDelete: (record: StudyExamRecord) => void
}

const KIND_LABELS: Record<StudyExamKind, string> = {
  simulado: 'Simulado',
  prova: 'Prova',
  exercicios: 'Exercícios',
}

const KIND_TONES: Record<StudyExamKind, BadgeTone> = {
  simulado: 'primary',
  prova: 'success',
  exercicios: 'neutral',
}

function formatExamDate(date: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

/**
 * Faixa de desempenho. A cor nunca carrega o significado sozinha — o
 * percentual numérico está sempre visível ao lado (DESIGN.md).
 */
function barClassForPercent(percent: number): string {
  if (percent >= 70) return 'bg-success-500'
  if (percent >= 50) return 'bg-primary-600'
  return 'bg-error-500'
}

export function StudyExamRecordItem({
  record,
  subject,
  onEdit,
  onDelete,
}: StudyExamRecordItemProps) {
  const percent = Math.round(
    (record.correct_count / record.total_questions) * 100,
  )

  return (
    <motion.div
      variants={listItemVariants}
      exit="exit"
      className="px-4 py-3 transition-colors hover:bg-[var(--color-bg)]"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-[var(--color-text)]">
              {record.title}
            </p>
            <Badge tone={KIND_TONES[record.kind]}>
              {KIND_LABELS[record.kind]}
            </Badge>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <span>{formatExamDate(record.exam_date)}</span>
            {subject && (
              <span className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: subject.color }}
                />
                {subject.name}
              </span>
            )}
            <span className="text-[var(--color-text)]">
              {record.correct_count}/{record.total_questions} ·{' '}
              <span className="font-semibold">{percent}%</span>
            </span>
          </div>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--color-bg)]">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: percent / 100 }}
              transition={{ duration: 0.5, ease: EASE_SMOOTH }}
              className={cn(
                'h-full w-full origin-left rounded-full',
                barClassForPercent(percent),
              )}
            />
          </div>

          {record.notes && (
            <p className="mt-2 text-xs text-[var(--color-text-muted)]">
              {record.notes}
            </p>
          )}
        </div>

        <ItemMenu
          triggerLabel={`Ações de ${record.title}`}
          actions={[
            { label: 'Editar', icon: Pencil, onClick: () => onEdit(record) },
            {
              label: 'Excluir',
              icon: Trash2,
              onClick: () => onDelete(record),
              tone: 'danger' as const,
            },
          ]}
        />
      </div>
    </motion.div>
  )
}
