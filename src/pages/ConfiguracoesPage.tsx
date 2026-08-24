import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, Download, Laptop, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { PageFade } from '@/components/ui/PageFade'
import { Select } from '@/components/ui/Select'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { useSyncedTheme } from '@/hooks/useSyncedTheme'
import { cn } from '@/lib/cn'
import { buildUserDataExport, downloadJson } from '@/lib/exportUserData'
import { getLocalDateString } from '@/lib/date'
import { interactiveStates } from '@/lib/interactive-states'
import { deleteOwnAccount, updateProfile } from '@/lib/queries/profile'
import { BRAZIL_TIMEZONES } from '@/lib/timezones'
import type { Theme } from '@/hooks/useTheme'
import {
  timezoneFormSchema,
  toTimezoneInput,
  type TimezoneFormValues,
} from '@/lib/validation/profile'

const THEME_OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Escuro', icon: Moon },
  { value: 'system', label: 'Sistema', icon: Laptop },
]

export function ConfiguracoesPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const profileQuery = useProfile()
  const { theme, setTheme } = useSyncedTheme()

  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [confirmEmail, setConfirmEmail] = useState('')
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const {
    register: registerTimezone,
    handleSubmit: handleTimezoneSubmit,
    formState: {
      errors: timezoneErrors,
      isSubmitting: isSubmittingTimezone,
      isDirty: isTimezoneDirty,
    },
  } = useForm<TimezoneFormValues>({
    resolver: zodResolver(timezoneFormSchema),
    defaultValues: { timezone: 'America/Sao_Paulo' },
    values: profileQuery.data
      ? { timezone: profileQuery.data.timezone }
      : undefined,
  })

  const updateTimezoneMutation = useMutation({
    mutationFn: (values: TimezoneFormValues) =>
      updateProfile(user!.id, toTimezoneInput(values)),
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', user?.id], data)
    },
  })

  const deleteAccountMutation = useMutation({
    mutationFn: deleteOwnAccount,
    onSuccess: async () => {
      await signOut()
      navigate('/', { replace: true })
    },
    onError: () => {
      setDeleteError('Não foi possível excluir a conta. Tente novamente.')
    },
  })

  const handleExport = async () => {
    if (!user) return
    setIsExporting(true)
    setExportError(null)
    try {
      const data = await buildUserDataExport(user.id)
      downloadJson(data, `alvorada-dados-${getLocalDateString()}.json`)
    } catch {
      setExportError('Não foi possível exportar seus dados. Tente novamente.')
    } finally {
      setIsExporting(false)
    }
  }

  const canDelete = confirmEmail.trim() === user?.email

  const handleDelete = () => {
    if (!canDelete) return
    if (
      window.confirm(
        'Isso vai apagar permanentemente sua conta e todos os seus dados (rotina, hábitos, tarefas, finanças). Não é possível desfazer. Continuar?',
      )
    ) {
      setDeleteError(null)
      deleteAccountMutation.mutate()
    }
  }

  return (
    <PageFade className="mx-auto max-w-2xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-[var(--color-text)]">
          Configurações
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Tema, fuso horário e dados da sua conta.
        </p>
      </div>

      <Card className="mt-6 p-6">
        <h2 className="text-sm font-semibold text-[var(--color-text)]">Tema</h2>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          Sincroniza com sua conta — muda em qualquer dispositivo que você
          entrar.
        </p>
        <div className="mt-4 flex gap-2">
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              className={cn(
                'flex flex-1 flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-sm font-medium',
                interactiveStates,
                theme === value
                  ? 'border-primary-600 bg-primary-500/10 text-primary-600'
                  : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]',
              )}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>
      </Card>

      <Card className="mt-6 p-6">
        <h2 className="text-sm font-semibold text-[var(--color-text)]">
          Fuso horário
        </h2>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          Ainda não muda o cálculo de "hoje" no app (isso continua usando o
          horário do seu navegador) — guardado para uso futuro em lembretes.
        </p>
        <form
          onSubmit={handleTimezoneSubmit((values) =>
            updateTimezoneMutation.mutateAsync(values),
          )}
          noValidate
          className="mt-4 flex flex-wrap items-end gap-3"
        >
          <div className="min-w-[240px] flex-1">
            <Select
              label="Região"
              error={timezoneErrors.timezone?.message}
              {...registerTimezone('timezone')}
            >
              {BRAZIL_TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </Select>
          </div>
          <Button
            type="submit"
            disabled={isSubmittingTimezone || !isTimezoneDirty}
          >
            {isSubmittingTimezone ? 'Salvando…' : 'Salvar'}
          </Button>
        </form>
      </Card>

      <Card className="mt-6 p-6">
        <h2 className="text-sm font-semibold text-[var(--color-text)]">
          Exportar meus dados
        </h2>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          Baixa um arquivo .json com tudo: rotina, hábitos, tarefas e finanças.
        </p>
        {exportError && (
          <p className="text-error-500 mt-2 text-sm">{exportError}</p>
        )}
        <Button
          variant="secondary"
          onClick={handleExport}
          disabled={isExporting}
          className="mt-4 gap-1.5"
        >
          <Download size={16} />
          {isExporting ? 'Exportando…' : 'Exportar dados'}
        </Button>
      </Card>

      <Card className="border-error-500/30 mt-6 p-6">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-error-500" />
          <h2 className="text-error-500 text-sm font-semibold">
            Zona de perigo
          </h2>
        </div>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          Excluir sua conta apaga permanentemente todos os seus dados. Essa ação
          não pode ser desfeita.
        </p>
        <div className="mt-4 flex flex-col gap-3">
          <Input
            label={`Digite "${user?.email}" para confirmar`}
            value={confirmEmail}
            onChange={(event) => setConfirmEmail(event.target.value)}
            autoComplete="off"
          />
          {deleteError && (
            <p className="text-error-500 text-sm">{deleteError}</p>
          )}
          <Button
            variant="secondary"
            onClick={handleDelete}
            disabled={!canDelete || deleteAccountMutation.isPending}
            className="border-error-500 text-error-500 hover:bg-error-50 w-fit"
          >
            {deleteAccountMutation.isPending
              ? 'Excluindo…'
              : 'Excluir minha conta'}
          </Button>
        </div>
      </Card>
    </PageFade>
  )
}
