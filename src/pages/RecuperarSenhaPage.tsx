import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthLayout } from '@/components/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '@/lib/validation/auth'

export function RecuperarSenhaPage() {
  const { sendPasswordReset } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setFormError(null)
    const { error } = await sendPasswordReset(values.email)
    if (error) {
      setFormError(error)
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <AuthLayout title="Verifique seu e-mail" subtitle="Link enviado">
        <p className="text-sm text-[var(--color-text-muted)]">
          Se existir uma conta com esse e-mail, enviamos um link para você
          redefinir sua senha.
        </p>
        <Link
          to="/login"
          className="text-primary-600 mt-6 inline-block text-sm font-medium hover:underline"
        >
          Voltar para o login
        </Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Recuperar senha"
      subtitle="Enviaremos um link de redefinição para o seu e-mail."
      footer={
        <Link
          to="/login"
          className="text-primary-600 font-medium hover:underline"
        >
          Voltar para o login
        </Link>
      }
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-4"
      >
        <Input
          label="E-mail"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        {formError && <p className="text-error-500 text-sm">{formError}</p>}
        <Button type="submit" disabled={isSubmitting} className="mt-2">
          {isSubmitting ? 'Enviando…' : 'Enviar link'}
        </Button>
      </form>
    </AuthLayout>
  )
}
