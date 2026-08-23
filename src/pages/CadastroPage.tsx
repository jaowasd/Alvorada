import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthLayout } from '@/components/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { signUpSchema, type SignUpFormValues } from '@/lib/validation/auth'

export function CadastroPage() {
  const { signUp } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({ resolver: zodResolver(signUpSchema) })

  const onSubmit = async (values: SignUpFormValues) => {
    setFormError(null)
    const { error } = await signUp(values.email, values.password)
    if (error) {
      setFormError(error)
      return
    }
    setEmailSent(true)
  }

  if (emailSent) {
    return (
      <AuthLayout title="Confirme seu e-mail" subtitle="Quase lá">
        <p className="text-sm text-[var(--color-text-muted)]">
          Enviamos um link de confirmação para o seu e-mail. Depois de
          confirmar, você já pode entrar na sua conta.
        </p>
        <Link
          to="/login"
          className="text-primary-600 mt-6 inline-block text-sm font-medium hover:underline"
        >
          Ir para o login
        </Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Comece a organizar sua manhã hoje mesmo."
      footer={
        <>
          Já tem conta?{' '}
          <Link
            to="/login"
            className="text-primary-600 font-medium hover:underline"
          >
            Entrar
          </Link>
        </>
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
        <Input
          label="Senha"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Confirmar senha"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        {formError && <p className="text-error-500 text-sm">{formError}</p>}
        <Button type="submit" disabled={isSubmitting} className="mt-2">
          {isSubmitting ? 'Criando conta…' : 'Criar conta'}
        </Button>
      </form>
    </AuthLayout>
  )
}
