import { Card } from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'

export function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-semibold">Bem-vindo, {user?.email}</h1>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Seu painel "Meu dia" completo chega nas próximas fases — por enquanto,
        organize suas tarefas avulsas.
      </p>
      <Card className="mt-6 p-8 text-center text-sm text-[var(--color-text-muted)]">
        Em breve: rotina matinal, hábitos e sequência de dias, tudo aqui.
      </Card>
    </div>
  )
}
