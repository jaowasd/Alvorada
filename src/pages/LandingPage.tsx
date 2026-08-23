import { Link } from 'react-router-dom'
import { BarChart3, Flame, ListChecks, Sunrise } from 'lucide-react'
import { buttonVariants } from '@/lib/button-variants'
import { Card } from '@/components/ui/Card'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { cn } from '@/lib/cn'

const features = [
  {
    icon: Sunrise,
    title: 'Rotina matinal',
    description:
      'Monte sua manhã em etapas ordenáveis, do jeito que funciona para você.',
  },
  {
    icon: ListChecks,
    title: 'Hábitos saudáveis',
    description:
      'Sono, hidratação, exercícios, estudos e meditação — todo dia ou em dias específicos.',
  },
  {
    icon: Flame,
    title: 'Sequências de dias',
    description:
      'Acompanhe sua sequência atual e seu recorde, sem culpa quando um dia foge do combinado.',
  },
  {
    icon: BarChart3,
    title: 'Progresso visual',
    description:
      'Mapa de consistência e estatísticas semanais para ver sua evolução de verdade.',
  },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <span className="font-heading text-lg font-semibold">Alvorada</span>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to="/login" className={buttonVariants('ghost')}>
            Entrar
          </Link>
          <Link to="/cadastro" className={buttonVariants('primary')}>
            Criar conta grátis
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto flex max-w-3xl flex-col items-center px-6 py-20 text-center">
          <h1 className="font-heading text-4xl font-semibold text-balance sm:text-5xl">
            Comece bem,{' '}
            <span className="from-primary-500 to-accent-500 bg-gradient-to-r bg-clip-text text-transparent">
              continue bem
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-[var(--color-text-muted)]">
            Um único lugar calmo e rápido para organizar sua manhã, construir
            hábitos saudáveis e visualizar sua consistência ao longo do tempo.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/cadastro"
              className={cn(buttonVariants('primary'), 'px-6 py-3 text-base')}
            >
              Criar conta grátis
            </Link>
            <Link
              to="/login"
              className={cn(buttonVariants('secondary'), 'px-6 py-3 text-base')}
            >
              Já tenho conta
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-24">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="p-6 text-left">
                <div className="bg-health-100 text-health-600 inline-flex h-10 w-10 items-center justify-center rounded-lg">
                  <Icon size={20} />
                </div>
                <h2 className="mt-4 text-base font-semibold">{title}</h2>
                <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">
                  {description}
                </p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-24 text-center">
          <Card className="px-8 py-12">
            <h2 className="font-heading text-2xl font-semibold">
              Pequenos hábitos, grandes manhãs.
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-text-muted)]">
              Todo dia é uma nova chance de começar. Crie sua rotina em minutos
              e veja sua consistência crescer.
            </p>
            <Link
              to="/cadastro"
              className={cn(
                buttonVariants('primary'),
                'mt-6 px-6 py-3 text-base',
              )}
            >
              Criar minha rotina
            </Link>
          </Card>
        </section>
      </main>

      <footer className="mx-auto max-w-5xl px-6 py-8 text-center text-xs text-[var(--color-text-muted)]">
        © {new Date().getFullYear()} Alvorada. Todos os direitos reservados.
      </footer>
    </div>
  )
}
