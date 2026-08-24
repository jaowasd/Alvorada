import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AchievementsCard } from '@/components/profile/AchievementsCard'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { PageFade } from '@/components/ui/PageFade'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { updateProfile } from '@/lib/queries/profile'
import {
  profileFormSchema,
  toProfileInput,
  type ProfileFormValues,
} from '@/lib/validation/profile'

export function PerfilPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const profileQuery = useProfile()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { displayName: '' },
    values: profileQuery.data
      ? { displayName: profileQuery.data.display_name ?? '' }
      : undefined,
  })

  const updateMutation = useMutation({
    mutationFn: (values: ProfileFormValues) =>
      updateProfile(user!.id, toProfileInput(values)),
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', user?.id], data)
    },
  })

  return (
    <PageFade className="mx-auto max-w-2xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-[var(--color-text)]">
          Perfil
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Escolha como o Alvorada vai te chamar.
        </p>
      </div>

      <Card className="mt-6 p-6">
        {profileQuery.isError ? (
          <p className="text-error-500 text-sm">
            Não foi possível carregar seu perfil. Tente novamente.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit((values) =>
              updateMutation.mutateAsync(values),
            )}
            noValidate
            className="flex flex-col gap-4"
          >
            <Input
              label="Apelido"
              placeholder="Como você quer ser chamado?"
              error={errors.displayName?.message}
              {...register('displayName')}
            />
            <p className="text-xs text-[var(--color-text-muted)]">
              É assim que vamos te chamar em todo o site. Deixe em branco para
              usar o nome derivado do seu e-mail.
            </p>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting || !isDirty}>
                {isSubmitting ? 'Salvando…' : 'Salvar'}
              </Button>
            </div>
          </form>
        )}
      </Card>

      <AchievementsCard />
    </PageFade>
  )
}
