import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence } from 'framer-motion'
import { ClipboardCheck, Plus, Target } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, MotionCard } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { PageFade } from '@/components/ui/PageFade'
import { StatTile } from '@/components/dashboard/StatTile'
import { StatsBar } from '@/components/dashboard/StatsBar'
import { StudyExamRecordForm } from '@/components/estudos/StudyExamRecordForm'
import { StudyExamRecordItem } from '@/components/estudos/StudyExamRecordItem'
import { useAuth } from '@/hooks/useAuth'
import { useInlineFeedback } from '@/hooks/useInlineFeedback'
import { cn } from '@/lib/cn'
import { interactiveStates } from '@/lib/interactive-states'
import { staggerContainer } from '@/lib/motion'
import {
  createStudyExamRecord,
  deleteStudyExamRecord,
  fetchStudyExamRecords,
  updateStudyExamRecord,
} from '@/lib/queries/studyExamRecords'
import { fetchAllStudySubjects } from '@/lib/queries/studySubjects'
import { computeAccuracyBySubject, computeExamAccuracy } from '@/lib/studies'
import {
  toStudyExamRecordInput,
  type StudyExamRecordFormValues,
} from '@/lib/validation/studyExamRecord'
import type {
  StudyExamKind,
  StudyExamRecord,
  StudySubject,
} from '@/types/database'

const EMPTY_RECORDS: StudyExamRecord[] = []
const EMPTY_SUBJECTS: StudySubject[] = []

type KindFilter = StudyExamKind | 'all'

const KIND_TABS: { value: KindFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'simulado', label: 'Simulados' },
  { value: 'prova', label: 'Provas' },
  { value: 'exercicios', label: 'Exercícios' },
]

export function ProvasPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { message: feedback, show: showFeedback } = useInlineFeedback()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<StudyExamRecord | null>(
    null,
  )
  const [deletingRecord, setDeletingRecord] = useState<StudyExamRecord | null>(
    null,
  )
  const [kindFilter, setKindFilter] = useState<KindFilter>('all')

  const recordsQuery = useQuery({
    queryKey: ['studyExamRecords', user?.id],
    queryFn: () => fetchStudyExamRecords(user!.id),
    enabled: !!user,
  })
  const records = recordsQuery.data ?? EMPTY_RECORDS

  const subjectsQuery = useQuery({
    queryKey: ['studySubjects', user?.id, 'all'],
    queryFn: () => fetchAllStudySubjects(user!.id),
    enabled: !!user,
  })
  const subjects = subjectsQuery.data ?? EMPTY_SUBJECTS

  const subjectsById = useMemo(
    () => new Map(subjects.map((subject) => [subject.id, subject])),
    [subjects],
  )
  const activeSubjects = useMemo(
    () => subjects.filter((subject) => !subject.archived_at),
    [subjects],
  )

  const invalidateRecords = () =>
    queryClient.invalidateQueries({ queryKey: ['studyExamRecords', user?.id] })

  const createMutation = useMutation({
    mutationFn: (values: StudyExamRecordFormValues) =>
      createStudyExamRecord(user!.id, toStudyExamRecordInput(values)),
    onSuccess: () => {
      void invalidateRecords()
      closeModal()
      showFeedback('Registro salvo.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string
      values: StudyExamRecordFormValues
    }) => updateStudyExamRecord(id, toStudyExamRecordInput(values)),
    onSuccess: () => {
      void invalidateRecords()
      closeModal()
      showFeedback('Registro atualizado.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteStudyExamRecord(id),
    onSuccess: () => {
      void invalidateRecords()
      setDeletingRecord(null)
      showFeedback('Registro excluído.')
    },
  })

  const closeModal = () => {
    setModalOpen(false)
    setEditingRecord(null)
  }

  const openCreateModal = () => {
    setEditingRecord(null)
    setModalOpen(true)
  }

  const handleFormSubmit = async (values: StudyExamRecordFormValues) => {
    if (editingRecord) {
      await updateMutation.mutateAsync({ id: editingRecord.id, values })
    } else {
      await createMutation.mutateAsync(values)
    }
  }

  const overallAccuracy = computeExamAccuracy(records)
  const accuracyBySubject = useMemo(
    () => computeAccuracyBySubject(records),
    [records],
  )

  const subjectBreakdown = useMemo(
    () =>
      [...accuracyBySubject.entries()]
        .map(([subjectId, accuracy]) => ({
          subjectId,
          subject: subjectId ? subjectsById.get(subjectId) : undefined,
          accuracy,
        }))
        .sort((a, b) => (a.accuracy.percent ?? 0) - (b.accuracy.percent ?? 0)),
    [accuracyBySubject, subjectsById],
  )

  const filteredRecords = useMemo(
    () =>
      kindFilter === 'all'
        ? records
        : records.filter((record) => record.kind === kindFilter),
    [records, kindFilter],
  )

  return (
    <PageFade className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--color-text)]">
            Provas
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Simulados e listas de exercícios — para saber onde você mais erra.
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-1.5">
          <Plus size={16} /> Registrar prova
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

      {records.length > 0 && (
        <div className="mt-6">
          <StatsBar>
            <StatTile
              label="Registros"
              value={records.length}
              icon={ClipboardCheck}
            />
            <StatTile
              label="Questões respondidas"
              value={overallAccuracy.total}
              icon={ClipboardCheck}
            />
            <StatTile
              label="Aproveitamento"
              value={overallAccuracy.percent ?? 0}
              suffix="%"
              icon={Target}
            />
          </StatsBar>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-1">
        {KIND_TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setKindFilter(item.value)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium',
              interactiveStates,
              kindFilter === item.value
                ? 'bg-primary-500/10 text-primary-600'
                : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {recordsQuery.isLoading && (
          <p
            role="status"
            aria-live="polite"
            className="text-sm text-[var(--color-text-muted)]"
          >
            Carregando registros…
          </p>
        )}
        {recordsQuery.isError && (
          <p className="text-error-500 text-sm">
            Não foi possível carregar seus registros. Tente novamente.
          </p>
        )}
        {!recordsQuery.isLoading &&
          !recordsQuery.isError &&
          records.length === 0 && (
            <EmptyState
              icon={ClipboardCheck}
              title="Nenhuma prova registrada"
              description="Anote o resultado dos seus simulados para ver onde você mais erra."
              action={{ label: 'Registrar prova', onClick: openCreateModal }}
            />
          )}
        {records.length > 0 && filteredRecords.length === 0 && (
          <p className="text-sm text-[var(--color-text-muted)]">
            Nenhum registro desse tipo.
          </p>
        )}
        {filteredRecords.length > 0 && (
          <MotionCard
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="divide-y divide-[var(--color-border)] overflow-hidden py-0"
          >
            <AnimatePresence>
              {filteredRecords.map((record) => (
                <StudyExamRecordItem
                  key={record.id}
                  record={record}
                  subject={
                    record.subject_id
                      ? subjectsById.get(record.subject_id)
                      : undefined
                  }
                  onEdit={(item) => {
                    setEditingRecord(item)
                    setModalOpen(true)
                  }}
                  onDelete={setDeletingRecord}
                />
              ))}
            </AnimatePresence>
          </MotionCard>
        )}
      </div>

      {subjectBreakdown.length > 0 && (
        <Card className="mt-6 p-6">
          <h2 className="text-sm font-semibold text-[var(--color-text)]">
            Aproveitamento por matéria
          </h2>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Da matéria com pior desempenho para a melhor.
          </p>
          <ul className="mt-4 flex flex-col gap-3">
            {subjectBreakdown.map(({ subjectId, subject, accuracy }) => (
              <li key={subjectId ?? 'sem-materia'}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="inline-flex min-w-0 items-center gap-1.5 text-sm text-[var(--color-text)]">
                    <span
                      aria-hidden="true"
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          subject?.color ?? 'var(--color-text-muted)',
                      }}
                    />
                    <span className="truncate">
                      {subject?.name ?? 'Sem matéria'}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-[var(--color-text-muted)] tabular-nums">
                    {accuracy.correct}/{accuracy.total} ·{' '}
                    <span className="font-semibold text-[var(--color-text)]">
                      {accuracy.percent ?? 0}%
                    </span>
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--color-bg)]">
                  <div
                    className="bg-primary-600 h-full origin-left rounded-full"
                    style={{ width: `${accuracy.percent ?? 0}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <AnimatePresence>
        {modalOpen && (
          <Modal
            title={editingRecord ? 'Editar registro' : 'Registrar prova'}
            onClose={closeModal}
          >
            <StudyExamRecordForm
              initialRecord={editingRecord ?? undefined}
              subjects={activeSubjects}
              onSubmit={handleFormSubmit}
              onCancel={closeModal}
            />
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deletingRecord && (
          <ConfirmDialog
            title="Excluir registro"
            confirmLabel="Excluir"
            isPending={deleteMutation.isPending}
            message={`Excluir "${deletingRecord.title}"? Essa ação não pode ser desfeita.`}
            onConfirm={() => deleteMutation.mutate(deletingRecord.id)}
            onClose={() => setDeletingRecord(null)}
          />
        )}
      </AnimatePresence>
    </PageFade>
  )
}
