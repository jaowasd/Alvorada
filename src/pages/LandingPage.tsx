import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BarChart3,
  Check,
  Flame,
  ListChecks,
  Sparkles,
  Sunrise,
  Trophy,
} from 'lucide-react'
import { buttonVariants } from '@/lib/button-variants'
import { fadeUp, staggerContainer } from '@/lib/motion'
import { Card } from '@/components/ui/Card'
import { Logo } from '@/components/Logo'
import { ProgressRing } from '@/components/ui/ProgressRing'
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

const previewItems = [
  { title: 'Beber água ao acordar', done: true },
  { title: 'Meditar 10 minutos', done: true },
  { title: 'Ler 20 páginas', done: false },
]

function DashboardPreview() {
  return (
    <div className="w-full max-w-md rounded-xl bg-[#f5f6fb] p-4 text-left sm:p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] text-slate-400">Bom dia,</p>
          <p className="font-heading text-base font-bold text-slate-900">Ana</p>
        </div>
        <ProgressRing percent={75} size={52} strokeWidth={6}>
          <span className="text-xs font-bold text-slate-900">75%</span>
        </ProgressRing>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          { label: 'Sequência', value: '12', icon: Flame },
          { label: 'Recorde', value: '30', icon: Trophy },
          { label: 'Hoje', value: '75%', icon: Sparkles },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-2"
          >
            <Icon size={13} className="text-primary-600" />
            <p className="mt-1 text-sm font-bold text-slate-900">{value}</p>
            <p className="truncate text-[10px] text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
        {previewItems.map((item, index) => (
          <div
            key={item.title}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2.5',
              index !== previewItems.length - 1 && 'border-b border-slate-100',
            )}
          >
            <span
              className={cn(
                'flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border',
                item.done
                  ? 'border-primary-600 bg-primary-600'
                  : 'border-slate-300 bg-white',
              )}
            >
              {item.done && (
                <Check size={10} strokeWidth={3} className="text-white" />
              )}
            </span>
            <span
              className={cn(
                'text-xs font-medium text-slate-700',
                item.done && 'text-slate-400 line-through',
              )}
            >
              {item.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function LaptopMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24, rotate: 1 }}
      animate={{ opacity: 1, x: 0, rotate: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      className="w-full max-w-lg"
    >
      <div className="shadow-card-lg rounded-2xl border-[6px] border-slate-900 bg-slate-900 p-1.5 sm:border-[10px] sm:p-2">
        <div className="flex items-center justify-center rounded-lg bg-white py-6 sm:py-8">
          <DashboardPreview />
        </div>
      </div>
      <div className="mx-auto h-3 w-[85%] rounded-b-xl bg-slate-800" />
      <div className="mx-auto h-1.5 w-[95%] rounded-b-md bg-slate-700/70" />
    </motion.div>
  )
}

function Badge({
  tone = 'dark',
  children,
}: {
  tone?: 'dark' | 'light'
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium',
        tone === 'dark'
          ? 'bg-slate-900 text-white'
          : 'border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]',
      )}
    >
      {children}
    </span>
  )
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
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
        <section className="mx-auto max-w-6xl px-6 pt-10 pb-24">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              <motion.span
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="bg-primary-500/10 text-primary-600 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
              >
                <Sparkles size={13} />
                Rotina, hábitos e tarefas em um só lugar
              </motion.span>
              <motion.h1
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="font-heading mt-5 text-4xl leading-[1.05] font-extrabold text-balance sm:text-5xl lg:text-6xl"
              >
                Comece bem,
                <br />
                <span className="text-primary-600">continue bem.</span>
              </motion.h1>
              <motion.p
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="mt-5 max-w-lg text-lg text-[var(--color-text-muted)]"
              >
                Um único lugar calmo e rápido para organizar sua manhã,
                construir hábitos saudáveis e visualizar sua consistência ao
                longo do tempo.
              </motion.p>
              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="mt-8 flex flex-col gap-3 sm:flex-row"
              >
                <Link
                  to="/cadastro"
                  className={cn(
                    buttonVariants('primary'),
                    'px-6 py-3 text-base',
                  )}
                >
                  Criar conta grátis
                </Link>
                <Link
                  to="/login"
                  className={cn(
                    buttonVariants('secondary'),
                    'px-6 py-3 text-base',
                  )}
                >
                  Já tenho conta
                </Link>
              </motion.div>
              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="mt-8 flex flex-wrap items-center gap-3"
              >
                <Badge tone="dark">
                  <strong className="font-bold">100%</strong> grátis
                </Badge>
                <Badge tone="light">
                  <Flame size={14} className="text-primary-600" />
                  Sequências reais, todo dia
                </Badge>
              </motion.div>
            </motion.div>

            <div className="flex justify-center lg:justify-end">
              <LaptopMockup />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <span className="text-primary-600 text-xs font-semibold tracking-wide uppercase">
              Recursos
            </span>
            <h2 className="font-heading mt-2 text-3xl font-bold sm:text-4xl">
              Tudo que você precisa,{' '}
              <span className="text-primary-600">sem complicar</span>
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {features.map(({ icon: Icon, title, description }) => (
              <motion.div key={title} variants={fadeUp}>
                <Card className="shadow-card hover:shadow-card-lg h-full p-6 text-left transition-shadow">
                  <div className="bg-primary-500/10 text-primary-600 inline-flex h-10 w-10 items-center justify-center rounded-lg">
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-4 text-base font-semibold">{title}</h3>
                  <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">
                    {description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
          >
            <Card className="shadow-card-lg px-8 py-12">
              <h2 className="font-heading text-2xl font-bold sm:text-3xl">
                Pequenos hábitos, grandes manhãs.
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-text-muted)]">
                Todo dia é uma nova chance de começar. Crie sua rotina em
                minutos e veja sua consistência crescer.
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
          </motion.div>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-6 py-8 text-center text-xs text-[var(--color-text-muted)]">
        © {new Date().getFullYear()} Alvorada. Todos os direitos reservados.
      </footer>
    </div>
  )
}
