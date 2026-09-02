import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { getLocalDateString } from '@/lib/date'
import {
  STUDY_EXAM_NOTES_MAX_LENGTH,
  STUDY_EXAM_TITLE_MAX_LENGTH,
  studyExamRecordFormSchema,
  type StudyExamRecordFormValues,
} from '@/lib/validation/studyExamRecord'
import type { StudyExamRecord, StudySubject } from '@/types/database'

interface StudyExamRecordFormProps {
  initialRecord?: StudyExamRecord
  subjects: StudySubject[]
  onSubmit: (values: StudyExamRecordFormValues) => Promise<void>
  onCancel: () => void
}

const KIND_OPTIONS: { value: StudyExamRecord['kind']; label: string }[] = [
  { value: 'simulado', label: 'Simulado' },
  { value: 'prova', label: 'Prova' },
  { value: 'exercicios', label: 'Exercícios' },
]

export function StudyExamRecordForm({
  initialRecord,
  subjects,
  onSubmit,
  onCancel,
}: StudyExamRecordFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StudyExamRecordFormValues>({
    resolver: zodResolver(studyExamRecordFormSchema),
    defaultValues: {
      title: initialRecord?.title ?? '',
      kind: initialRecord?.kind ?? 'simulado',
      subjectId: initialRecord?.subject_id ?? '',
      examDate: initialRecord?.exam_date ?? getLocalDateString(),
      correctCount: initialRecord ? String(initialRecord.correct_count) : '',
      totalQuestions: initialRecord
        ? String(initialRecord.total_questions)
        : '',
      notes: initialRecord?.notes ?? '',
    },
  })

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      <Input
        label="Título"
        placeholder="ex: Simulado TJ-SP 01"
        maxLength={STUDY_EXAM_TITLE_MAX_LENGTH}
        error={errors.title?.message}
        {...register('title')}
      />

      <div className="flex flex-col gap-1.5 text-left">
        <span className="text-sm font-medium text-[var(--color-text)]">
          Tipo
        </span>
        <div className="flex flex-wrap gap-4">
          {KIND_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 text-sm text-[var(--color-text)]"
            >
              <input type="radio" value={option.value} {...register('kind')} />
              {option.label}
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Matéria"
          error={errors.subjectId?.message}
          {...register('subjectId')}
        >
          <option value="">Sem matéria</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </Select>
        <Input
          label="Data"
          type="date"
          error={errors.examDate?.message}
          {...register('examDate')}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Acertos"
          inputMode="numeric"
          placeholder="42"
          error={errors.correctCount?.message}
          {...register('correctCount')}
        />
        <Input
          label="Total de questões"
          inputMode="numeric"
          placeholder="60"
          error={errors.totalQuestions?.message}
          {...register('totalQuestions')}
        />
      </div>
      <p className="-mt-2 text-xs text-[var(--color-text-muted)]">
        Para nota de discursiva, registre como acertos sobre o total (ex: 8 de
        10) — o aproveitamento é o mesmo.
      </p>

      <div className="flex flex-col gap-1.5 text-left">
        <label
          htmlFor="notes"
          className="text-sm font-medium text-[var(--color-text)]"
        >
          Anotações
        </label>
        <textarea
          id="notes"
          rows={3}
          maxLength={STUDY_EXAM_NOTES_MAX_LENGTH}
          placeholder="Onde você errou mais?"
          className="focus:border-primary-500 focus:ring-primary-500/30 resize-none rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] transition outline-none focus:ring-2"
          {...register('notes')}
        />
        {errors.notes && (
          <p className="text-error-500 text-xs">{errors.notes.message}</p>
        )}
      </div>

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Salvando…'
            : initialRecord
              ? 'Salvar alterações'
              : 'Registrar'}
        </Button>
      </div>
    </form>
  )
}
