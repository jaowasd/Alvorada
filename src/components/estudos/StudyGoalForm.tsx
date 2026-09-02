import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  studySettingsFormSchema,
  type StudySettingsFormValues,
} from '@/lib/validation/studySettings'
import type { StudySettings } from '@/types/database'

interface StudyGoalFormProps {
  initialSettings?: StudySettings
  onSubmit: (values: StudySettingsFormValues) => Promise<void>
  onCancel: () => void
}

export function StudyGoalForm({
  initialSettings,
  onSubmit,
  onCancel,
}: StudyGoalFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StudySettingsFormValues>({
    resolver: zodResolver(studySettingsFormSchema),
    defaultValues: {
      weeklyGoalHours: initialSettings?.weekly_goal_minutes
        ? String(
            Math.round((initialSettings.weekly_goal_minutes / 60) * 10) / 10,
          )
        : '',
      examDate: initialSettings?.exam_date ?? '',
    },
  })

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      <div>
        <Input
          label="Meta semanal (horas)"
          inputMode="decimal"
          placeholder="ex: 20"
          error={errors.weeklyGoalHours?.message}
          {...register('weeklyGoalHours')}
        />
        <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">
          Total somando todas as matérias. Deixe em branco para não acompanhar.
        </p>
      </div>

      <div>
        <Input
          label="Data da prova"
          type="date"
          error={errors.examDate?.message}
          {...register('examDate')}
        />
        <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">
          Usada só para a contagem regressiva.
        </p>
      </div>

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando…' : 'Salvar'}
        </Button>
      </div>
    </form>
  )
}
