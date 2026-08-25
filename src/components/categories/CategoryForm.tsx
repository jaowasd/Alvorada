import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/categoryIcons'
import { interactiveStates } from '@/lib/interactive-states'
import {
  categoryFormSchema,
  type CategoryFormValues,
} from '@/lib/validation/category'
import type { Category } from '@/types/database'

interface CategoryFormProps {
  initialCategory?: Category
  onSubmit: (values: CategoryFormValues) => Promise<void>
  onCancel: () => void
}

export function CategoryForm({
  initialCategory,
  onSubmit,
  onCancel,
}: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: initialCategory?.name ?? '',
      icon: initialCategory?.icon ?? 'Circle',
      color: initialCategory?.color ?? CATEGORY_COLORS[0],
    },
  })

  const selectedIcon = watch('icon')
  const selectedColor = watch('color')

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      <Input label="Nome" error={errors.name?.message} {...register('name')} />

      <div className="flex flex-col gap-1.5 text-left">
        <span className="text-sm font-medium text-[var(--color-text)]">
          Ícone
        </span>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_ICONS.map(({ name, icon: Icon }) => (
            <button
              key={name}
              type="button"
              onClick={() => setValue('icon', name, { shouldValidate: true })}
              aria-label={name}
              aria-pressed={selectedIcon === name}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg border',
                interactiveStates,
                selectedIcon === name
                  ? 'border-primary-600 bg-primary-500/10 text-primary-600'
                  : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]',
              )}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
        {errors.icon && (
          <p className="text-error-500 text-xs">{errors.icon.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5 text-left">
        <span className="text-sm font-medium text-[var(--color-text)]">
          Cor
        </span>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setValue('color', color, { shouldValidate: true })}
              aria-label={color}
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

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Salvando…'
            : initialCategory
              ? 'Salvar alterações'
              : 'Criar categoria'}
        </Button>
      </div>
    </form>
  )
}
