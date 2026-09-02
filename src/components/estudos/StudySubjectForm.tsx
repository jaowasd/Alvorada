import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/cn'
import { interactiveStates } from '@/lib/interactive-states'
import {
  DEFAULT_STUDY_SUBJECT_COLOR,
  STUDY_SUBJECT_COLORS,
} from '@/lib/studySubjectColors'
import {
  STUDY_SUBJECT_NAME_MAX_LENGTH,
  studySubjectFormSchema,
  type StudySubjectFormValues,
} from '@/lib/validation/studySubject'
import type { StudySubject } from '@/types/database'

interface StudySubjectFormProps {
  initialSubject?: StudySubject
  /**
   * Nomes já usados pelas outras matérias ativas. O banco tem um índice único
   * case-insensitive (0024), mas nada no projeto traduz o erro 23505 do
   * Postgres — então a checagem acontece aqui, com a lista que a página já
   * carregou, e o índice fica só como última linha de defesa.
   */
  existingNames: string[]
  onSubmit: (values: StudySubjectFormValues) => Promise<void>
  onCancel: () => void
}

export function StudySubjectForm({
  initialSubject,
  existingNames,
  onSubmit,
  onCancel,
}: StudySubjectFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<StudySubjectFormValues>({
    resolver: zodResolver(studySubjectFormSchema),
    defaultValues: {
      name: initialSubject?.name ?? '',
      color: initialSubject?.color ?? DEFAULT_STUDY_SUBJECT_COLOR,
      weeklyGoalHours: initialSubject?.weekly_goal_minutes
        ? String(
            Math.round((initialSubject.weekly_goal_minutes / 60) * 10) / 10,
          )
        : '',
    },
  })

  const selectedColor = watch('color')

  const handleValidSubmit = async (values: StudySubjectFormValues) => {
    const normalized = values.name.trim().toLocaleLowerCase('pt-BR')
    const isDuplicate = existingNames.some(
      (name) =>
        name.trim().toLocaleLowerCase('pt-BR') === normalized &&
        name !== initialSubject?.name,
    )
    if (isDuplicate) {
      setError('name', { message: 'Já existe uma matéria com esse nome' })
      return
    }
    await onSubmit(values)
  }

  return (
    <form
      onSubmit={handleSubmit(handleValidSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      <Input
        label="Nome"
        placeholder="ex: Direito Constitucional"
        maxLength={STUDY_SUBJECT_NAME_MAX_LENGTH}
        error={errors.name?.message}
        {...register('name')}
      />

      <div className="flex flex-col gap-1.5 text-left">
        <span className="text-sm font-medium text-[var(--color-text)]">
          Cor
        </span>
        <div className="flex flex-wrap gap-2">
          {STUDY_SUBJECT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setValue('color', color, { shouldValidate: true })}
              aria-label={`Cor ${color}`}
              aria-pressed={selectedColor === color}
              className={cn(
                'h-8 w-8 rounded-full border-2 transition-transform',
                interactiveStates,
                selectedColor === color
                  ? 'scale-110 border-[var(--color-text)]'
                  : 'border-transparent',
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        {errors.color && (
          <p className="text-error-500 text-xs">{errors.color.message}</p>
        )}
      </div>

      <div>
        <Input
          label="Meta semanal (horas)"
          inputMode="decimal"
          placeholder="ex: 6"
          error={errors.weeklyGoalHours?.message}
          {...register('weeklyGoalHours')}
        />
        <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">
          Opcional. Deixe em branco se não quiser meta para esta matéria.
        </p>
      </div>

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Salvando…'
            : initialSubject
              ? 'Salvar alterações'
              : 'Criar matéria'}
        </Button>
      </div>
    </form>
  )
}
