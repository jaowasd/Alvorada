import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence } from 'framer-motion'
import { Plus, Tag } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, MotionCard } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { PageFade } from '@/components/ui/PageFade'
import { FinanceCategoryForm } from '@/components/financas/FinanceCategoryForm'
import { FinanceCategoryItem } from '@/components/financas/FinanceCategoryItem'
import { useAuth } from '@/hooks/useAuth'
import { centsToInputValue } from '@/lib/money'
import { staggerContainer } from '@/lib/motion'
import {
  archiveFinanceCategory,
  createFinanceCategory,
  fetchFinanceCategories,
  updateFinanceCategory,
} from '@/lib/queries/financas/categories'
import {
  fetchFinanceSettings,
  updateFinanceSettings,
} from '@/lib/queries/financas/settings'
import {
  toFinanceCategoryInput,
  type FinanceCategoryFormValues,
} from '@/lib/validation/financas/category'
import {
  financeSettingsFormSchema,
  toFinanceSettingsInput,
  type FinanceSettingsFormValues,
} from '@/lib/validation/financas/settings'
import type { FinanceCategory } from '@/types/database'

const EMPTY_CATEGORIES: FinanceCategory[] = []

export function ConfiguracoesPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] =
    useState<FinanceCategory | null>(null)
  const [archiveTarget, setArchiveTarget] = useState<FinanceCategory | null>(
    null,
  )

  const settingsQuery = useQuery({
    queryKey: ['financeSettings', user?.id],
    queryFn: () => fetchFinanceSettings(user!.id),
    enabled: !!user,
  })
  const categoriesQuery = useQuery({
    queryKey: ['financeCategories'],
    queryFn: fetchFinanceCategories,
    enabled: !!user,
  })

  const categories = categoriesQuery.data ?? EMPTY_CATEGORIES
  const customCategories = useMemo(
    () => categories.filter((category) => !category.is_system),
    [categories],
  )

  const {
    register: registerSettings,
    handleSubmit: handleSettingsSubmit,
    reset: resetSettingsForm,
    formState: {
      errors: settingsErrors,
      isSubmitting: isSubmittingSettings,
      isDirty: isSettingsDirty,
    },
  } = useForm<FinanceSettingsFormValues>({
    resolver: zodResolver(financeSettingsFormSchema),
    defaultValues: { monthlyIncome: '' },
    values: settingsQuery.data
      ? {
          monthlyIncome:
            settingsQuery.data.monthly_income_cents != null
              ? centsToInputValue(settingsQuery.data.monthly_income_cents)
              : '',
        }
      : undefined,
  })

  const updateSettingsMutation = useMutation({
    mutationFn: (values: FinanceSettingsFormValues) =>
      updateFinanceSettings(user!.id, toFinanceSettingsInput(values)),
    onSuccess: (data) => {
      queryClient.setQueryData(['financeSettings', user?.id], data)
      resetSettingsForm({
        monthlyIncome:
          data.monthly_income_cents != null
            ? centsToInputValue(data.monthly_income_cents)
            : '',
      })
    },
  })

  const invalidateCategories = () =>
    queryClient.invalidateQueries({ queryKey: ['financeCategories'] })

  const createCategoryMutation = useMutation({
    mutationFn: (values: FinanceCategoryFormValues) =>
      createFinanceCategory(user!.id, toFinanceCategoryInput(values)),
    onSuccess: () => {
      invalidateCategories()
      closeModal()
    },
  })

  const updateCategoryMutation = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string
      values: FinanceCategoryFormValues
    }) => updateFinanceCategory(id, toFinanceCategoryInput(values)),
    onSuccess: () => {
      invalidateCategories()
      closeModal()
    },
  })

  const archiveCategoryMutation = useMutation({
    mutationFn: (category: FinanceCategory) =>
      archiveFinanceCategory(category.id),
    onSuccess: invalidateCategories,
  })

  const closeModal = () => {
    setModalOpen(false)
    setEditingCategory(null)
  }

  const openCreateModal = () => {
    setEditingCategory(null)
    setModalOpen(true)
  }

  const openEditModal = (category: FinanceCategory) => {
    setEditingCategory(category)
    setModalOpen(true)
  }

  const handleArchiveCategory = (category: FinanceCategory) =>
    setArchiveTarget(category)

  const handleConfirmArchiveCategory = () => {
    if (!archiveTarget) return
    archiveCategoryMutation.mutate(archiveTarget, {
      onSuccess: () => setArchiveTarget(null),
    })
  }

  const handleCategoryFormSubmit = async (
    values: FinanceCategoryFormValues,
  ) => {
    if (editingCategory) {
      await updateCategoryMutation.mutateAsync({
        id: editingCategory.id,
        values,
      })
    } else {
      await createCategoryMutation.mutateAsync(values)
    }
  }

  return (
    <PageFade className="mx-auto max-w-3xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-[var(--color-text)]">
          Configurações
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Renda mensal e categorias personalizadas.
        </p>
      </div>

      <Card className="mt-6 p-4">
        <h2 className="text-sm font-semibold text-[var(--color-text)]">
          Renda mensal
        </h2>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          Opcional — usada como referência em orçamentos por percentual da renda
          (em breve).
        </p>
        <form
          onSubmit={handleSettingsSubmit((values) =>
            updateSettingsMutation.mutateAsync(values),
          )}
          noValidate
          className="mt-4 flex flex-wrap items-end gap-3"
        >
          <div className="w-full max-w-[200px]">
            <Input
              label="Valor (R$)"
              inputMode="decimal"
              placeholder="0,00"
              error={settingsErrors.monthlyIncome?.message}
              {...registerSettings('monthlyIncome')}
            />
          </div>
          <Button
            type="submit"
            disabled={isSubmittingSettings || !isSettingsDirty}
          >
            {isSubmittingSettings ? 'Salvando…' : 'Salvar'}
          </Button>
        </form>
      </Card>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--color-text)]">
          Categorias personalizadas
        </h2>
        <Button onClick={openCreateModal} className="gap-1.5">
          <Plus size={16} /> Nova categoria
        </Button>
      </div>

      <div className="mt-3">
        {categoriesQuery.isLoading && (
          <p
            role="status"
            aria-live="polite"
            className="text-sm text-[var(--color-text-muted)]"
          >
            Carregando categorias…
          </p>
        )}
        {categoriesQuery.isError && (
          <p className="text-error-500 text-sm">
            Não foi possível carregar as categorias. Tente novamente.
          </p>
        )}
        {!categoriesQuery.isLoading &&
          !categoriesQuery.isError &&
          customCategories.length === 0 && (
            <EmptyState
              icon={Tag}
              title="Nenhuma categoria personalizada ainda"
              description="As categorias do sistema já cobrem os casos mais comuns."
              action={{ label: 'Nova categoria', onClick: openCreateModal }}
            />
          )}
        {customCategories.length > 0 && (
          <MotionCard
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="divide-y divide-[var(--color-border)] overflow-hidden py-0"
          >
            <AnimatePresence>
              {customCategories.map((category) => (
                <FinanceCategoryItem
                  key={category.id}
                  category={category}
                  onEdit={openEditModal}
                  onArchive={handleArchiveCategory}
                />
              ))}
            </AnimatePresence>
          </MotionCard>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <Modal
            title={editingCategory ? 'Editar categoria' : 'Nova categoria'}
            onClose={closeModal}
          >
            <FinanceCategoryForm
              initialCategory={editingCategory ?? undefined}
              onSubmit={handleCategoryFormSubmit}
              onCancel={closeModal}
            />
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {archiveTarget && (
          <ConfirmDialog
            title="Arquivar categoria"
            message={`Arquivar a categoria "${archiveTarget.name}"?`}
            confirmLabel="Arquivar"
            isPending={archiveCategoryMutation.isPending}
            onConfirm={handleConfirmArchiveCategory}
            onClose={() => setArchiveTarget(null)}
          />
        )}
      </AnimatePresence>
    </PageFade>
  )
}
