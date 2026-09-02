import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence } from 'framer-motion'
import { BookOpen, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { MotionCard } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { PageFade } from '@/components/ui/PageFade'
import { StudySubjectForm } from '@/components/estudos/StudySubjectForm'
import { StudySubjectItem } from '@/components/estudos/StudySubjectItem'
import { useAuth } from '@/hooks/useAuth'
import { useInlineFeedback } from '@/hooks/useInlineFeedback'
import { cn } from '@/lib/cn'
import { getLocalDateString } from '@/lib/date'
import { interactiveStates } from '@/lib/interactive-states'
import { staggerContainer } from '@/lib/motion'
import { fetchFocusSessions } from '@/lib/queries/focusSessions'
import { fetchStudyExamRecords } from '@/lib/queries/studyExamRecords'
import {
  archiveStudySubject,
  createStudySubject,
  deleteStudySubject,
  fetchAllStudySubjects,
  unarchiveStudySubject,
  updateStudySubject,
} from '@/lib/queries/studySubjects'
import { computeMinutesBySubject, getWeekRange } from '@/lib/studies'
import {
  toStudySubjectInput,
  type StudySubjectFormValues,
} from '@/lib/validation/studySubject'
import type {
  FocusSession,
  StudyExamRecord,
  StudySubject,
} from '@/types/database'

const EMPTY_SUBJECTS: StudySubject[] = []
const EMPTY_SESSIONS: FocusSession[] = []
const EMPTY_RECORDS: StudyExamRecord[] = []

type SubjectTab = 'active' | 'archived'

const SUBJECT_TABS: { value: SubjectTab; label: string }[] = [
  { value: 'active', label: 'Ativas' },
  { value: 'archived', label: 'Arquivadas' },
]

export function MateriasPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const today = getLocalDateString()
  const week = useMemo(() => getWeekRange(today), [today])
  const { message: feedback, show: showFeedback } = useInlineFeedback()

  const [tab, setTab] = useState<SubjectTab>('active')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<StudySubject | null>(
    null,
  )
  const [archivingSubject, setArchivingSubject] = useState<StudySubject | null>(
    null,
  )
  const [deletingSubject, setDeletingSubject] = useState<StudySubject | null>(
    null,
  )

  const subjectsQuery = useQuery({
    queryKey: ['studySubjects', user?.id, 'all'],
    queryFn: () => fetchAllStudySubjects(user!.id),
    enabled: !!user,
  })
  const subjects = subjectsQuery.data ?? EMPTY_SUBJECTS

  const sessionsQuery = useQuery({
    queryKey: ['focusSessions', user?.id],
    queryFn: () => fetchFocusSessions(user!.id),
    enabled: !!user,
  })
  const sessions = sessionsQuery.data ?? EMPTY_SESSIONS

  const recordsQuery = useQuery({
    queryKey: ['studyExamRecords', user?.id],
    queryFn: () => fetchStudyExamRecords(user!.id),
    enabled: !!user,
  })
  const records = recordsQuery.data ?? EMPTY_RECORDS

  // Invalidação casa por prefixo, então esta chave já alcança
  // ['studySubjects', userId, 'all'].
  const invalidateSubjects = () => {
    void queryClient.invalidateQueries({
      queryKey: ['studySubjects', user?.id],
    })
  }

  const createMutation = useMutation({
    mutationFn: (values: StudySubjectFormValues) =>
      createStudySubject(user!.id, toStudySubjectInput(values)),
    onSuccess: () => {
      invalidateSubjects()
      closeModal()
      showFeedback('Matéria criada.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string
      values: StudySubjectFormValues
    }) => updateStudySubject(id, toStudySubjectInput(values)),
    onSuccess: () => {
      invalidateSubjects()
      closeModal()
      showFeedback('Matéria atualizada.')
    },
  })

  const archiveMutation = useMutation({
    mutationFn: (id: string) => archiveStudySubject(id),
    onSuccess: () => {
      invalidateSubjects()
      setArchivingSubject(null)
      showFeedback('Matéria arquivada.')
    },
  })

  const unarchiveMutation = useMutation({
    mutationFn: (id: string) => unarchiveStudySubject(id),
    onSuccess: () => {
      invalidateSubjects()
      showFeedback('Matéria reativada.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteStudySubject(id),
    onSuccess: () => {
      invalidateSubjects()
      setDeletingSubject(null)
      showFeedback('Matéria excluída.')
    },
  })

  const closeModal = () => {
    setModalOpen(false)
    setEditingSubject(null)
  }

  const openCreateModal = () => {
    setEditingSubject(null)
    setModalOpen(true)
  }

  const handleFormSubmit = async (values: StudySubjectFormValues) => {
    if (editingSubject) {
      await updateMutation.mutateAsync({ id: editingSubject.id, values })
    } else {
      await createMutation.mutateAsync(values)
    }
  }

  const weekMinutesBySubject = useMemo(
    () => computeMinutesBySubject(sessions, week.start, week.end),
    [sessions, week.start, week.end],
  )

  /** Quantos registros apontam pra cada matéria — decide arquivar vs excluir. */
  const historyCountBySubject = useMemo(() => {
    const counts = new Map<string, number>()
    for (const session of sessions) {
      if (!session.subject_id) continue
      counts.set(session.subject_id, (counts.get(session.subject_id) ?? 0) + 1)
    }
    for (const record of records) {
      if (!record.subject_id) continue
      counts.set(record.subject_id, (counts.get(record.subject_id) ?? 0) + 1)
    }
    return counts
  }, [sessions, records])

  const visibleSubjects = useMemo(
    () =>
      subjects.filter((subject) =>
        tab === 'active' ? !subject.archived_at : !!subject.archived_at,
      ),
    [subjects, tab],
  )

  const activeNames = useMemo(
    () => subjects.filter((s) => !s.archived_at).map((s) => s.name),
    [subjects],
  )

  const archivingCount = archivingSubject
    ? (historyCountBySubject.get(archivingSubject.id) ?? 0)
    : 0

  return (
    <PageFade className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--color-text)]">
            Matérias
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            As disciplinas do seu edital, com meta de horas por semana.
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-1.5">
          <Plus size={16} /> Nova matéria
        </Button>
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

      <div className="mt-6 flex gap-1">
        {SUBJECT_TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setTab(item.value)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium',
              interactiveStates,
              tab === item.value
                ? 'bg-primary-500/10 text-primary-600'
                : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {subjectsQuery.isLoading && (
          <p
            role="status"
            aria-live="polite"
            className="text-sm text-[var(--color-text-muted)]"
          >
            Carregando matérias…
          </p>
        )}
        {subjectsQuery.isError && (
          <p className="text-error-500 text-sm">
            Não foi possível carregar suas matérias. Tente novamente.
          </p>
        )}
        {!subjectsQuery.isLoading &&
          !subjectsQuery.isError &&
          visibleSubjects.length === 0 && (
            <EmptyState
              icon={BookOpen}
              title={
                tab === 'active'
                  ? 'Nenhuma matéria ainda'
                  : 'Nenhuma matéria arquivada'
              }
              description={
                tab === 'active'
                  ? 'Cadastre as disciplinas do seu edital para dividir o tempo de estudo entre elas.'
                  : undefined
              }
              action={
                tab === 'active'
                  ? { label: 'Criar matéria', onClick: openCreateModal }
                  : undefined
              }
            />
          )}
        {visibleSubjects.length > 0 && (
          <MotionCard
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="divide-y divide-[var(--color-border)] overflow-hidden py-0"
          >
            <AnimatePresence>
              {visibleSubjects.map((subject) => (
                <StudySubjectItem
                  key={subject.id}
                  subject={subject}
                  weekMinutes={weekMinutesBySubject.get(subject.id) ?? 0}
                  historyCount={historyCountBySubject.get(subject.id) ?? 0}
                  onEdit={(item) => {
                    setEditingSubject(item)
                    setModalOpen(true)
                  }}
                  onArchive={setArchivingSubject}
                  onUnarchive={(item) => unarchiveMutation.mutate(item.id)}
                  onDelete={setDeletingSubject}
                />
              ))}
            </AnimatePresence>
          </MotionCard>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <Modal
            title={editingSubject ? 'Editar matéria' : 'Nova matéria'}
            onClose={closeModal}
          >
            <StudySubjectForm
              initialSubject={editingSubject ?? undefined}
              existingNames={activeNames}
              onSubmit={handleFormSubmit}
              onCancel={closeModal}
            />
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {archivingSubject && (
          <ConfirmDialog
            title="Arquivar matéria"
            tone="neutral"
            confirmLabel="Arquivar"
            isPending={archiveMutation.isPending}
            message={
              archivingCount > 0
                ? `Arquivar "${archivingSubject.name}"? Os ${archivingCount} registros já feitos continuam no histórico.`
                : `Arquivar "${archivingSubject.name}"? Ela sai da lista ativa e pode ser reativada depois.`
            }
            onConfirm={() => archiveMutation.mutate(archivingSubject.id)}
            onClose={() => setArchivingSubject(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deletingSubject && (
          <ConfirmDialog
            title="Excluir matéria"
            confirmLabel="Excluir"
            isPending={deleteMutation.isPending}
            message={`Excluir "${deletingSubject.name}"? Essa ação não pode ser desfeita.`}
            onConfirm={() => deleteMutation.mutate(deletingSubject.id)}
            onClose={() => setDeletingSubject(null)}
          />
        )}
      </AnimatePresence>
    </PageFade>
  )
}
