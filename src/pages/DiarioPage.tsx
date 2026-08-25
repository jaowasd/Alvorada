import { useMemo, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { subDays } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen } from 'lucide-react'
import { MotionCard } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { PageFade } from '@/components/ui/PageFade'
import { useAuth } from '@/hooks/useAuth'
import { useInlineFeedback } from '@/hooks/useInlineFeedback'
import { cn } from '@/lib/cn'
import { getLocalDateString } from '@/lib/date'
import { interactiveStates } from '@/lib/interactive-states'
import { MOOD_OPTIONS } from '@/lib/journalMoods'
import { staggerContainer, listItemVariants } from '@/lib/motion'
import {
  fetchJournalEntriesInRange,
  upsertJournalEntry,
} from '@/lib/queries/journal'
import {
  JOURNAL_NOTES_MAX_LENGTH,
  journalNotesSchema,
} from '@/lib/validation/journal'
import type { JournalEntry, JournalMood } from '@/types/database'

const EMPTY_ENTRIES: JournalEntry[] = []
const DAYS_BACK = 365

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-')
  const date = new Date(Number(year), Number(month) - 1, 1)
  const label = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(date)
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function formatEntryDate(dateStr: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: 'numeric',
  }).format(new Date(`${dateStr}T00:00:00`))
}

interface EditFormProps {
  entry: JournalEntry
  onSave: (input: { mood: JournalMood; notes: string | null }) => void
  isSaving: boolean
}

function EditEntryForm({ entry, onSave, isSaving }: EditFormProps) {
  const [mood, setMood] = useState<JournalMood>(entry.mood)
  const [notes, setNotes] = useState(entry.notes ?? '')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const notesResult = journalNotesSchema.safeParse(notes.trim())
    if (!notesResult.success) return
    onSave({ mood, notes: notesResult.data ? notesResult.data : null })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {MOOD_OPTIONS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setMood(value)}
            aria-label={label}
            aria-pressed={mood === value}
            className={cn(
              'flex min-w-[64px] flex-1 flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-xs font-medium',
              interactiveStates,
              mood === value
                ? 'border-primary-600 bg-primary-500/10 text-primary-600'
                : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]',
            )}
          >
            <Icon size={20} />
            {label}
          </button>
        ))}
      </div>
      <Input
        placeholder="Alguma nota sobre esse dia? (opcional)"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        maxLength={JOURNAL_NOTES_MAX_LENGTH}
      />
      <div className="mt-1 flex justify-end gap-2">
        <button
          type="submit"
          disabled={isSaving}
          className={cn(
            'bg-primary-600 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50',
            interactiveStates,
          )}
        >
          {isSaving ? 'Salvando…' : 'Salvar'}
        </button>
      </div>
    </form>
  )
}

export function DiarioPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const today = getLocalDateString()
  const fromDate = getLocalDateString(subDays(new Date(), DAYS_BACK))
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)
  const { message: feedback, show: showFeedback } = useInlineFeedback()

  const entriesQuery = useQuery({
    queryKey: ['journalEntries', user?.id, fromDate, today],
    queryFn: () => fetchJournalEntriesInRange(user!.id, fromDate, today),
    enabled: !!user,
  })
  const entries = entriesQuery.data ?? EMPTY_ENTRIES

  const groupedByMonth = useMemo(() => {
    const groups = new Map<string, JournalEntry[]>()
    for (const entry of entries) {
      const monthKey = entry.entry_date.slice(0, 7)
      const list = groups.get(monthKey) ?? []
      list.push(entry)
      groups.set(monthKey, list)
    }
    return Array.from(groups.entries())
  }, [entries])

  const saveMutation = useMutation({
    mutationFn: (input: { mood: JournalMood; notes: string | null }) =>
      upsertJournalEntry(user!.id, editingEntry!.entry_date, input),
    onSuccess: (data) => {
      queryClient.setQueryData<JournalEntry[]>(
        ['journalEntries', user?.id, fromDate, today],
        (previous) =>
          (previous ?? []).map((entry) =>
            entry.entry_date === data.entry_date ? data : entry,
          ),
      )
      if (data.entry_date === today) {
        queryClient.setQueryData(['journalEntry', user?.id, today], data)
      }
      setEditingEntry(null)
      showFeedback('Entrada atualizada.')
    },
  })

  return (
    <PageFade className="mx-auto max-w-3xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-[var(--color-text)]">
          Diário
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Seu histórico de humor e notas, dia a dia.
        </p>
      </div>

      {feedback && (
        <p
          role="status"
          aria-live="polite"
          className="text-success-600 mt-2 text-xs"
        >
          {feedback}
        </p>
      )}

      <div className="mt-6">
        {entriesQuery.isLoading && (
          <p
            role="status"
            aria-live="polite"
            className="text-sm text-[var(--color-text-muted)]"
          >
            Carregando diário…
          </p>
        )}
        {entriesQuery.isError && (
          <p className="text-error-500 text-sm">
            Não foi possível carregar seu diário. Tente novamente.
          </p>
        )}
        {entriesQuery.data?.length === 0 && (
          <EmptyState
            icon={BookOpen}
            title="Nenhuma entrada ainda"
            description="Registre como foi seu dia direto no Dashboard, em 'Como foi seu dia?'."
          />
        )}

        <div className="flex flex-col gap-6">
          {groupedByMonth.map(([monthKey, monthEntries]) => (
            <section key={monthKey}>
              <h2 className="mb-2 text-sm font-semibold text-[var(--color-text)]">
                {formatMonthLabel(monthKey)}
              </h2>
              <MotionCard
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="divide-y divide-[var(--color-border)] overflow-hidden py-0"
              >
                <AnimatePresence>
                  {monthEntries.map((entry) => {
                    const mood = MOOD_OPTIONS.find(
                      (option) => option.value === entry.mood,
                    )
                    const Icon = mood?.icon
                    return (
                      <motion.button
                        key={entry.id}
                        type="button"
                        variants={listItemVariants}
                        exit="exit"
                        onClick={() => setEditingEntry(entry)}
                        className={cn(
                          'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--color-bg)]',
                          interactiveStates,
                        )}
                      >
                        <span className="w-14 shrink-0 text-xs font-medium text-[var(--color-text-muted)] capitalize">
                          {formatEntryDate(entry.entry_date)}
                        </span>
                        {Icon && (
                          <Icon
                            size={18}
                            className="text-primary-600 shrink-0"
                          />
                        )}
                        <span className="min-w-0 flex-1 truncate text-sm text-[var(--color-text)]">
                          {entry.notes || (
                            <span className="text-[var(--color-text-muted)]">
                              Sem nota
                            </span>
                          )}
                        </span>
                      </motion.button>
                    )
                  })}
                </AnimatePresence>
              </MotionCard>
            </section>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {editingEntry && (
          <Modal
            title={formatEntryDate(editingEntry.entry_date)}
            onClose={() => setEditingEntry(null)}
          >
            <EditEntryForm
              entry={editingEntry}
              isSaving={saveMutation.isPending}
              onSave={(input) => saveMutation.mutate(input)}
            />
          </Modal>
        )}
      </AnimatePresence>
    </PageFade>
  )
}
