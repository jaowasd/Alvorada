import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, HeartPulse, ListChecks, Plus, Waypoints, X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/cn'
import { getLocalDateString } from '@/lib/date'
import { fetchHabits } from '@/lib/queries/habits'
import { interactiveStates } from '@/lib/interactive-states'
import { EASE_SMOOTH } from '@/lib/motion'
import {
  createReminder,
  dismissReminder,
  fetchActiveReminders,
} from '@/lib/queries/reminders'
import {
  fetchOrCreateActiveRoutine,
  fetchRoutineSteps,
} from '@/lib/queries/routines'
import { fetchTasks } from '@/lib/queries/tasks'
import {
  customReminderFormSchema,
  REMINDER_LABEL_MAX_LENGTH,
  REMINDER_MESSAGE_MAX_LENGTH,
  type ReminderLinkType,
} from '@/lib/validation/reminder'

const LINK_TYPE_ICONS: Record<Exclude<ReminderLinkType, 'none'>, typeof ListChecks> = {
  task: ListChecks,
  habit: HeartPulse,
  routine_step: Waypoints,
}

function formatReminderDate(date: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(`${date}T00:00:00`))
}

export function ReminderBell() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const today = getLocalDateString()
  const [open, setOpen] = useState(false)
  const [addingOpen, setAddingOpen] = useState(false)
  const [linkType, setLinkType] = useState<ReminderLinkType>('none')
  const [linkedId, setLinkedId] = useState('')
  const [label, setLabel] = useState('')
  const [remindAt, setRemindAt] = useState(today)
  const [message, setMessage] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const remindersQuery = useQuery({
    queryKey: ['reminders', user?.id],
    queryFn: () => fetchActiveReminders(user!.id),
    enabled: !!user,
  })
  const reminders = remindersQuery.data ?? []
  const dueCount = reminders.filter((r) => r.remind_at <= today).length

  const tasksQuery = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: () => fetchTasks(user!.id),
    enabled: !!user && addingOpen && linkType === 'task',
  })
  const openTasks = (tasksQuery.data ?? []).filter((t) => !t.is_completed)

  const habitsQuery = useQuery({
    queryKey: ['habits', user?.id],
    queryFn: () => fetchHabits(user!.id),
    enabled: !!user && addingOpen && linkType === 'habit',
  })

  const routineQuery = useQuery({
    queryKey: ['routine', user?.id],
    queryFn: () => fetchOrCreateActiveRoutine(user!.id),
    enabled: !!user && addingOpen && linkType === 'routine_step',
  })
  const stepsQuery = useQuery({
    queryKey: ['routineSteps', routineQuery.data?.id],
    queryFn: () => fetchRoutineSteps(routineQuery.data!.id),
    enabled: !!routineQuery.data && addingOpen && linkType === 'routine_step',
  })

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
        setAddingOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const resolveLinkedLabel = (): string => {
    if (linkType === 'task') {
      return openTasks.find((t) => t.id === linkedId)?.title ?? ''
    }
    if (linkType === 'habit') {
      return (habitsQuery.data ?? []).find((h) => h.id === linkedId)?.name ?? ''
    }
    if (linkType === 'routine_step') {
      return (stepsQuery.data ?? []).find((s) => s.id === linkedId)?.title ?? ''
    }
    return label.trim()
  }

  const createMutation = useMutation({
    mutationFn: () =>
      createReminder(user!.id, {
        custom_label: resolveLinkedLabel(),
        remind_at: remindAt,
        message: message.trim() ? message.trim() : null,
        task_id: linkType === 'task' ? linkedId : null,
        habit_id: linkType === 'habit' ? linkedId : null,
        routine_step_id: linkType === 'routine_step' ? linkedId : null,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['reminders', user?.id],
      })
      setLinkType('none')
      setLinkedId('')
      setLabel('')
      setMessage('')
      setRemindAt(today)
      setAddingOpen(false)
    },
  })

  const dismissMutation = useMutation({
    mutationFn: (id: string) => dismissReminder(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['reminders', user?.id],
      })
    },
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const result = customReminderFormSchema.safeParse({
      linkType,
      linkedId,
      label,
      remindAt,
      message,
    })
    if (!result.success) return
    createMutation.mutate()
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Lembretes"
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          'relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]',
          interactiveStates,
        )}
      >
        <Bell size={18} />
        {dueCount > 0 && (
          <span className="bg-error-500 absolute top-1.5 right-1.5 h-2 w-2 rounded-full" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15, ease: EASE_SMOOTH }}
            role="menu"
            className="shadow-popover fixed inset-x-4 top-16 z-20 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-2 sm:w-80"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[var(--color-text)]">
                Lembretes
              </h3>
              <button
                type="button"
                onClick={() => setAddingOpen((value) => !value)}
                aria-label="Novo lembrete"
                className={cn(
                  'inline-flex h-7 w-7 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]',
                  interactiveStates,
                )}
              >
                <Plus size={16} />
              </button>
            </div>

            <AnimatePresence initial={false}>
              {addingOpen && (
                <motion.form
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  onSubmit={handleSubmit}
                  className="overflow-hidden"
                >
                  <div className="mt-3 flex flex-col gap-2">
                    <Select
                      value={linkType}
                      onChange={(e) => {
                        setLinkType(e.target.value as ReminderLinkType)
                        setLinkedId('')
                      }}
                    >
                      <option value="none">Lembrete livre</option>
                      <option value="task">Vincular a uma tarefa</option>
                      <option value="habit">Vincular a um hábito</option>
                      <option value="routine_step">
                        Vincular a uma etapa da rotina
                      </option>
                    </Select>

                    {linkType === 'none' ? (
                      <Input
                        placeholder="Ex.: revisão financeira semanal"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        maxLength={REMINDER_LABEL_MAX_LENGTH}
                        autoFocus
                      />
                    ) : (
                      <Select
                        value={linkedId}
                        onChange={(e) => setLinkedId(e.target.value)}
                      >
                        <option value="">Selecione</option>
                        {linkType === 'task' &&
                          openTasks.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.title}
                            </option>
                          ))}
                        {linkType === 'habit' &&
                          (habitsQuery.data ?? []).map((h) => (
                            <option key={h.id} value={h.id}>
                              {h.name}
                            </option>
                          ))}
                        {linkType === 'routine_step' &&
                          (stepsQuery.data ?? []).map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.title}
                            </option>
                          ))}
                      </Select>
                    )}

                    <Input
                      type="date"
                      value={remindAt}
                      onChange={(e) => setRemindAt(e.target.value)}
                    />
                    <Input
                      placeholder="Mensagem (opcional)"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      maxLength={REMINDER_MESSAGE_MAX_LENGTH}
                    />
                    <button
                      type="submit"
                      disabled={
                        (linkType === 'none' ? !label.trim() : !linkedId) ||
                        createMutation.isPending
                      }
                      className={cn(
                        'bg-primary-600 rounded-lg px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50',
                        interactiveStates,
                      )}
                    >
                      Salvar lembrete
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="mt-3 flex max-h-72 flex-col gap-1 overflow-y-auto">
              {remindersQuery.isLoading && (
                <p className="py-2 text-sm text-[var(--color-text-muted)]">
                  Carregando…
                </p>
              )}
              {!remindersQuery.isLoading && reminders.length === 0 && (
                <p className="py-2 text-sm text-[var(--color-text-muted)]">
                  Nenhum lembrete pendente.
                </p>
              )}
              {reminders.map((reminder) => {
                const isDue = reminder.remind_at <= today
                const LinkIcon = reminder.task_id
                  ? LINK_TYPE_ICONS.task
                  : reminder.habit_id
                    ? LINK_TYPE_ICONS.habit
                    : reminder.routine_step_id
                      ? LINK_TYPE_ICONS.routine_step
                      : null
                return (
                  <div
                    key={reminder.id}
                    className="flex items-start justify-between gap-2 rounded-lg px-2 py-2 hover:bg-[var(--color-bg)]"
                  >
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 truncate text-sm font-medium text-[var(--color-text)]">
                        {LinkIcon && (
                          <LinkIcon
                            size={13}
                            className="text-primary-600 shrink-0"
                          />
                        )}
                        {reminder.custom_label}
                      </p>
                      {reminder.message && (
                        <p className="truncate text-xs text-[var(--color-text-muted)]">
                          {reminder.message}
                        </p>
                      )}
                      <p
                        className={cn(
                          'text-xs',
                          isDue
                            ? 'text-error-500 font-medium'
                            : 'text-[var(--color-text-muted)]',
                        )}
                      >
                        {formatReminderDate(reminder.remind_at)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => dismissMutation.mutate(reminder.id)}
                      aria-label="Dispensar lembrete"
                      className={cn(
                        'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-border)]/40',
                        interactiveStates,
                      )}
                    >
                      <X size={14} />
                    </button>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
