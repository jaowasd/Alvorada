import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useAuth } from '@/hooks/useAuth'

export function DashboardPage() {
  const { user, signOut } = useAuth()

  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-6 py-10 text-[var(--color-text)]">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <header className="flex items-center justify-between">
          <span className="font-heading text-lg font-semibold">Alvorada</span>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="secondary" onClick={() => void signOut()}>
              Sair
            </Button>
          </div>
        </header>
        <Card className="p-8 text-center">
          <h1 className="text-xl font-semibold">Bem-vindo, {user?.email}</h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Seu painel "Meu dia" ainda está em construção — chega nas próximas
            fases.
          </p>
        </Card>
      </div>
    </main>
  )
}
