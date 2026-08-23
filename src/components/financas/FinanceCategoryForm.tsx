import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import {
  FINANCE_CATEGORY_COLORS,
  FINANCE_CATEGORY_ICONS,
} from '@/lib/financeCategoryIcons'
import {
  financeCategoryFormSchema,
  type FinanceCategoryFormValues,
} from '@/lib/validation/financas/category'
import type { FinanceCategory } from '@/types/database'

interface FinanceCategoryFormProps {
  initialCategory?: FinanceCategory
  onSubmit: (values: FinanceCategoryFormValues) => Promise<void>
  onCancel: () => void
}

export function FinanceCategoryForm({
  initialCategory,
  onSubmit,
  onCancel,
}: FinanceCategoryFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FinanceCategoryFormValues>({
    resolver: zodResolver(financeCategoryFormSchema),
    defaultValues: {
      name: initialCategory?.name ?? '',
      kind: initialCategory?.kind ?? 'expense',
      icon: initialCategory?.icon ?? 'Circle',
      color: initialCategory?.color ?? FINANCE_CATEGORY_COLORS[0],
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
          Tipo
        </span>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
            <input type="radio" value="expense" {...register('kind')} />
            Despesa
          </label>
          <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
            <input type="radio" value="income" {...register('kind')} />
            Receita
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 text-left">
        <span className="text-sm font-medium text-[var(--color-text)]">
          Ícone
        </span>
        <div className="flex flex-wrap gap-2">
          {FINANCE_CATEGORY_ICONS.map(({ name, icon: Icon }) => (
            <button
              key={name}
              type="button"
              onClick={() => setValue('icon', name, { shouldValidate: true })}
              aria-label={name}
              aria-pressed={selectedIcon === name}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg border transition-colors',
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
          {FINANCE_CATEGORY_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setValue('color', color, { shouldValidate: true })}
              aria-label={color}
              aria-pressed={selectedColor === color}
              className={cn(
                'h-8 w-8 rounded-full border-2 transition-transform',
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
