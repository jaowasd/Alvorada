import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { getLocalDateString } from '@/lib/date'
import { FOCUS_SESSION_LABEL_MAX_LENGTH } from '@/lib/validation/focusSession'
import {
  studySessionFormSchema,
  type StudySessionFormValues,
} from '@/lib/validation/studySession'
import type { FocusSession, StudySubject } from '@/types/database'

interface StudySessionFormProps {
  initialSession?: FocusSession
  subjects: StudySubject[]
  onSubmit: (values: StudySessionFormValues) => Promise<void>
  onCancel: () => void
}

function toTimeInput(isoDate: string): string {
  const date = new Date(isoDate)
  return `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`
}

export function StudySessionForm({
  initialSession,
  subjects,
  onSubmit,
  onCancel,
}: StudySessionFormProps) {
  const today = getLocalDateString()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StudySessionFormValues>({
    resolver: zodResolver(studySessionFormSchema),
    defaultValues: {
      subjectId: initialSession?.subject_id ?? '',
      taskId: initialSession?.task_id ?? '',
      label: initialSession?.label ?? '',
      date: initialSession
        ? getLocalDateString(new Date(initialSession.started_at))
        : today,
      startTime: initialSession
        ? toTimeInput(initialSession.started_at)
        : '08:00',
      durationMinutes: initialSession
        ? String(initialSession.duration_minutes)
        : '60',
    },
  })

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
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
        label="Assunto"
        placeholder="O que você estudou?"
        maxLength={FOCUS_SESSION_LABEL_MAX_LENGTH}
        error={errors.label?.message}
        {...register('label')}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Data"
          type="date"
          max={today}
          error={errors.date?.message}
          {...register('date')}
        />
        <Input
          label="Início"
          type="time"
          error={errors.startTime?.message}
          {...register('startTime')}
        />
      </div>

      <Input
        label="Duração (minutos)"
        inputMode="numeric"
        error={errors.durationMinutes?.message}
        {...register('durationMinutes')}
      />

      {/*
        Sem campo visível: vincular a uma tarefa é coisa do cronômetro, não do
        registro manual. Registrado explicitamente para que editar uma sessão
        cronometrada não apague o vínculo que ela já tinha.
      */}
      <input type="hidden" {...register('taskId')} />

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Salvando…'
            : initialSession
              ? 'Salvar alterações'
              : 'Registrar sessão'}
        </Button>
      </div>
    </form>
  )
}
