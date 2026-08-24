import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Angry, Frown, Laugh, Meh, Smile, type LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/cn'
import { getLocalDateString } from '@/lib/date'
import { interactiveStates } from '@/lib/interactive-states'
import {
  fetchJournalEntryForDate,
  upsertJournalEntry,
} from '@/lib/queries/journal'
import type { JournalMood } from '@/types/database'

const MOOD_OPTIONS: {
  value: JournalMood
  label: string
  icon: LucideIcon
}[] = [
  { value: 'otimo', label: 'Ótimo', icon: Laugh },
  { value: 'bom', label: 'Bom', icon: Smile },
  { value: 'neutro', label: 'Neutro', icon: Meh },
  { value: 'dificil', label: 'Difícil', icon: Frown },
  { value: 'pesado', label: 'Pesado', icon: Angry },
]

export function JournalCard() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const today = getLocalDateString()

  const entryQuery = useQuery({
    queryKey: ['journalEntry', user?.id, today],
    queryFn: () => fetchJournalEntryForDate(user!.id, today),
    enabled: !!user,
  })

  const [mood, setMood] = useState<JournalMood | null>(null)
  const [notes, setNotes] = useState('')
  const [justSaved, setJustSaved] = useState(false)
  const syncedRef = useRef(false)

  useEffect(() => {
    if (!entryQuery.data || syncedRef.current) return
    syncedRef.current = true
    setMood(entryQuery.data.mood)
    setNotes(entryQuery.data.notes ?? '')
  }, [entryQuery.data])

  const saveMutation = useMutation({
    mutationFn: (input: { mood: JournalMood; notes: string | null }) =>
      upsertJournalEntry(user!.id, today, input),
    onSuccess: (data) => {
      queryClient.setQueryData(['journalEntry', user?.id, today], data)
      setJustSaved(true)
      setTimeout(() => setJustSaved(false), 2000)
    },
  })

  const handleMoodClick = (nextMood: JournalMood) => {
    setMood(nextMood)
    saveMutation.mutate({
      mood: nextMood,
      notes: notes.trim() ? notes.trim() : null,
    })
  }

  const handleNotesBlur = () => {
    if (!mood) return
    saveMutation.mutate({ mood, notes: notes.trim() ? notes.trim() : null })
  }

  return (
    <Card className="p-6">
      <h2 className="text-sm font-semibold text-[var(--color-text)]">
        Como foi seu dia?
      </h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {MOOD_OPTIONS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => handleMoodClick(value)}
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
      {mood && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3"
        >
          <Input
            placeholder="Alguma nota sobre hoje? (opcional)"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            onBlur={handleNotesBlur}
          />
        </motion.div>
      )}
      {justSaved && (
        <p
          role="status"
          aria-live="polite"
          className="text-success-600 mt-2 text-xs"
        >
          Salvo.
        </p>
      )}
    </Card>
  )
}
