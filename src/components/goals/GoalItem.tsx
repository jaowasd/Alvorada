import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Archive, Check, Pencil, Plus, RotateCcw } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { ItemMenu } from '@/components/ui/ItemMenu'
import { cn } from '@/lib/cn'
import { computeGoalProgress } from '@/lib/goals'
import { interactiveStates } from '@/lib/interactive-states'
import { listItemVariants, EASE_SMOOTH } from '@/lib/motion'
import { formatNumber } from '@/lib/number'
import type { Goal, GoalProgressEntry } from '@/types/database'

interface GoalItemProps {
  goal: Goal
  entries: GoalProgressEntry[]
  onEdit: (goal: Goal) => void
  onSetStatus: (goal: Goal, status: Goal['status']) => void
  onAddProgress: (goal: Goal, amount: number, notes: string | null) => void
}

function formatDeadline(date: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

export function GoalItem({
  goal,
  entries,
  onEdit,
  onSetStatus,
  onAddProgress,
}: GoalItemProps) {
  const [addingOpen, setAddingOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')

  const { current, percent } = computeGoalProgress(goal, entries)
  const isBoolean = goal.target_value === null
  const isCompleted = goal.status === 'completed'
  const isArchived = goal.status === 'archived'

  const handleAddProgress = (event: FormEvent) => {
    event.preventDefault()
    const value = Number(amount)
    if (!value || value <= 0) return
    onAddProgress(goal, value, notes.trim() ? notes.trim() : null)
    setAmount('')
    setNotes('')
    setAddingOpen(false)
  }

  return (
    <motion.div
      variants={listItemVariants}
      exit="exit"
      className="px-4 py-3 transition-colors hover:bg-[var(--color-bg)]"
    >
      <div className="flex items-start gap-3">
        {isBoolean ? (
          <label className="relative mt-0.5 inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center">
            <input
              type="checkbox"
              checked={isCompleted}
              onChange={() =>
                onSetStatus(goal, isCompleted ? 'active' : 'completed')
              }
              aria-label={
                isCompleted
                  ? 'Marcar como não concluída'
                  : 'Marcar como concluída'
              }
              className="peer sr-only"
            />
            <span
              className={cn(
                'h-[18px] w-[18px] rounded-md border transition-colors',
                isCompleted
                  ? 'border-primary-600 bg-primary-600'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)]',
              )}
            />
            <Check
              size={12}
              strokeWidth={3}
              className={cn(
                'pointer-events-none absolute text-white transition-opacity',
                isCompleted ? 'opacity-100' : 'opacity-0',
              )}
            />
          </label>
        ) : null}

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'text-sm font-medium text-[var(--color-text)]',
              isCompleted && 'line-through opacity-70',
            )}
          >
            {goal.name}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-muted)]">
            {!isBoolean && (
              <span>
                {formatNumber(current)}
                {goal.unit ? ` ${goal.unit}` : ''} de{' '}
                {formatNumber(goal.target_value!)}
                {goal.unit ? ` ${goal.unit}` : ''}
              </span>
            )}
            {goal.deadline_date && (
              <span>Prazo: {formatDeadline(goal.deadline_date)}</span>
            )}
          </div>

          {!isBoolean && (
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--color-bg)]">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: (percent ?? 0) / 100 }}
                transition={{ duration: 0.5, ease: EASE_SMOOTH }}
                className="bg-primary-600 h-full w-full origin-left rounded-full"
              />
            </div>
          )}

          {!isBoolean && !isCompleted && !isArchived && (
            <div className="mt-2">
              {!addingOpen && (
                <button
                  type="button"
                  onClick={() => setAddingOpen(true)}
                  className={cn(
                    'text-primary-600 inline-flex items-center gap-1 text-xs font-medium',
                    interactiveStates,
                  )}
                >
                  <Plus size={12} /> Adicionar progresso
                </button>
              )}
              {addingOpen && (
                <form
                  onSubmit={handleAddProgress}
                  className="mt-1 flex flex-wrap items-start gap-2"
                >
                  <Input
                    inputMode="decimal"
                    placeholder="Quantidade"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-28"
                    autoFocus
                  />
                  <Input
                    placeholder="Nota (opcional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-40"
                  />
                  <button
                    type="submit"
                    disabled={!amount}
                    className={cn(
                      'bg-primary-600 rounded-lg px-3 py-2 text-xs font-medium text-white disabled:opacity-50',
                      interactiveStates,
                    )}
                  >
                    Salvar
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddingOpen(false)}
                    className={cn(
                      'rounded-lg px-3 py-2 text-xs font-medium text-[var(--color-text-muted)]',
                      interactiveStates,
                    )}
                  >
                    Cancelar
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {isCompleted && (
          <Badge tone="success" className="mt-0.5 shrink-0">
            Concluída
          </Badge>
        )}
        {isArchived && (
          <Badge tone="neutral" className="mt-0.5 shrink-0">
            Arquivada
          </Badge>
        )}

        <ItemMenu
          actions={[
            { label: 'Editar', icon: Pencil, onClick: () => onEdit(goal) },
            ...(isArchived
              ? [
                  {
                    label: 'Reativar',
                    icon: RotateCcw,
                    onClick: () => onSetStatus(goal, 'active'),
                  },
                ]
              : [
                  {
                    label: 'Arquivar',
                    icon: Archive,
                    onClick: () => onSetStatus(goal, 'archived'),
                    tone: 'danger' as const,
                  },
                ]),
          ]}
        />
      </div>
    </motion.div>
  )
}
