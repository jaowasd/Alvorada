import { Link } from 'react-router-dom'
import { useState } from 'react'
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import {
  ArrowRight,
  BarChart3,
  Check,
  Flame,
  ListChecks,
  Sparkles,
  Sunrise,
  Trophy,
} from 'lucide-react'
import { buttonVariants } from '@/lib/button-variants'
import {
  DURATION,
  EASE_GLIDE,
  REVEAL_VIEWPORT,
  SPRING_SOFT,
  fadeUp,
  revealUp,
  staggerSection,
} from '@/lib/motion'
import { Badge } from '@/components/ui/Badge'
import { Bezel } from '@/components/ui/Bezel'
import { Card } from '@/components/ui/Card'
import { DawnScene } from '@/components/ui/DawnScene'
import { DawnWash } from '@/components/ui/DawnWash'
import { Logo } from '@/components/Logo'
import { ConsistencyRibbon } from '@/components/landing/ConsistencyRibbon'
import { PricingTable } from '@/components/premium/PricingTable'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { SectionReveal } from '@/components/ui/SectionReveal'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { TiltCard } from '@/components/ui/TiltCard'
import { useDaypart } from '@/hooks/useDaypart'
import { usePointerScene } from '@/hooks/usePointerScene'
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

/**
 * Ícone dentro do próprio círculo, encostado na borda interna do botão. Na
 * passagem do mouse ele avança — a tensão fica dentro do botão, não no
 * cursor.
 */
function CtaArrow() {
  return (
    <span className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/15 transition-transform duration-[--duration-base] ease-[--ease-glide] group-hover:translate-x-0.5">
      <ArrowRight size={15} />
    </span>
  )
}

/**
 * "Screenshot" do produto. Continua em tema claro fixo mesmo no dark mode:
 * é uma imagem do app dentro de uma moldura, e acompanhar o tema do visitante
 * arruinaria o contraste dentro dela. Mesma exceção de sempre, agora numa
 * moldura de bisel em vez do notebook.
 */
function AppPreview() {
  return (
    <div className="w-full bg-[#f5f6fb] p-5 text-left sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-medium tracking-[0.14em] text-slate-400 uppercase">
            Amanhecer
          </p>
          <p className="font-heading mt-1 text-lg font-bold text-slate-900">
            Bom dia, Ana
          </p>
        </div>
        <ProgressRing percent={75} size={58} strokeWidth={6}>
          <span className="numeric-display text-xs text-slate-900">75%</span>
        </ProgressRing>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        {[
          { label: 'Sequência', value: '12', icon: Flame },
          { label: 'Recorde', value: '30', icon: Trophy },
          { label: 'Hoje', value: '75%', icon: Sparkles },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 shadow-[0_1px_2px_rgba(18,22,40,0.04)]"
          >
            <Icon size={13} className="text-primary-600" />
            <p className="numeric-display mt-1.5 text-xl text-slate-900">
              {value}
            </p>
            <p className="mt-0.5 truncate text-[10px] text-slate-400">
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-slate-200/80 bg-white">
        {previewItems.map((item, index) => (
          <div
            key={item.title}
            className={cn(
              'flex items-center gap-2.5 px-3.5 py-3',
              index !== previewItems.length - 1 && 'border-b border-slate-100',
            )}
          >
            <span
              className={cn(
                'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border',
                item.done
                  ? 'border-primary-600 bg-primary-600'
                  : 'border-slate-300 bg-white',
              )}
            >
              {item.done && (
                <Check size={11} strokeWidth={3} className="text-white" />
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

export function LandingPage() {
  // Mantém a fase do dia fresca: o ponto do eyebrow e a cena saem dela.
  useDaypart()
  const { pointerX, pointerY, prefersReducedMotion, sceneHandlers } =
    usePointerScene()

  // A coluna do preview é o objeto mais próximo da câmera, então é a que mais
  // se desloca — é o contraste com as camadas de fundo que vende a profundidade.
  const previewX = useSpring(
    useTransform(pointerX, (v) => v * 0.18),
    SPRING_SOFT,
  )
  const previewY = useSpring(
    useTransform(pointerY, (v) => v * 0.18),
    SPRING_SOFT,
  )

  // A pílula do header encolhe e fecha o vidro assim que a página sai do topo:
  // sinaliza que ela está flutuando sobre o conteúdo, e não colada nele.
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  useMotionValueEvent(scrollY, 'change', (value) => setScrolled(value > 24))

  return (
    <div
      {...sceneHandlers}
      className="isolate min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]"
    >
      <DawnScene
        pointerX={pointerX}
        pointerY={pointerY}
        animate={!prefersReducedMotion}
        anchor="section"
        sunX="66%"
      />

      {/* Nav em pilha flutuante, destacada do topo. */}
      <header className="sticky top-0 z-40 px-4 pt-4 sm:pt-6">
        <div
          className={cn(
            'mx-auto flex max-w-5xl items-center justify-between gap-4 rounded-full border border-[var(--color-hairline)] py-2.5 pr-2.5 pl-5 backdrop-blur-xl',
            'transition-[transform,background-color,box-shadow] duration-[--duration-base] ease-[--ease-glide]',
            scrolled
              ? 'scale-[0.97] bg-[var(--color-surface)]/95 [box-shadow:var(--shadow-lift),var(--surface-highlight)]'
              : 'bg-[var(--color-surface)]/75 [box-shadow:var(--shadow-card),var(--surface-highlight)]',
          )}
        >
          <Logo size={30} />
          <div className="flex items-center gap-2">
            <a
              href="#precos"
              className={cn(
                buttonVariants('ghost', 'sm', true),
                'hidden sm:inline-flex',
              )}
            >
              Preços
            </a>
            <ThemeToggle />
            <Link
              to="/login"
              className={cn(
                buttonVariants('ghost', 'sm', true),
                'hidden sm:inline-flex',
              )}
            >
              Entrar
            </Link>
            <Link
              to="/cadastro"
              className={buttonVariants('primary', 'sm', true)}
            >
              Criar conta
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-6 pt-16 pb-24 sm:pt-24 sm:pb-32">
          <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_1fr]">
            <motion.div
              variants={staggerSection}
              initial={prefersReducedMotion ? false : 'hidden'}
              animate="show"
            >
              <motion.span
                variants={fadeUp}
                transition={{ duration: DURATION.slow, ease: EASE_GLIDE }}
                className="text-2xs inline-flex items-center gap-2 rounded-full border border-[var(--color-hairline)] bg-[var(--color-surface)] px-3 py-1.5 font-medium tracking-[0.14em] text-[var(--color-text-muted)] uppercase [box-shadow:var(--surface-highlight)]"
              >
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: 'var(--dawn-to)' }}
                />
                Rotina, hábitos e estudos em um só lugar
              </motion.span>

              <motion.h1
                variants={fadeUp}
                transition={{ duration: DURATION.slow, ease: EASE_GLIDE }}
                className="font-heading mt-6 text-4xl font-extrabold text-balance sm:text-5xl lg:text-6xl"
              >
                Comece bem,
                <br />
                <span className="text-primary-600">continue bem.</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                transition={{ duration: DURATION.slow, ease: EASE_GLIDE }}
                className="mt-6 max-w-lg text-lg text-[var(--color-text-muted)]"
              >
                Um único lugar calmo e rápido para organizar sua manhã,
                construir hábitos saudáveis e visualizar sua consistência ao
                longo do tempo.
              </motion.p>

              <motion.div
                variants={fadeUp}
                transition={{ duration: DURATION.slow, ease: EASE_GLIDE }}
                className="mt-9 flex flex-col gap-3 sm:flex-row"
              >
                <Link
                  to="/cadastro"
                  className={cn(buttonVariants('primary', 'lg', true), 'pr-2')}
                >
                  Criar conta grátis
                  <CtaArrow />
                </Link>
                <Link
                  to="/login"
                  className={buttonVariants('secondary', 'lg', true)}
                >
                  Já tenho conta
                </Link>
              </motion.div>

              <motion.div
                variants={fadeUp}
                transition={{ duration: DURATION.slow, ease: EASE_GLIDE }}
                className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[var(--color-text-muted)]"
              >
                <span className="flex items-center gap-2">
                  <Check size={15} className="text-success-600" />
                  Grátis para começar
                </span>
                <span className="flex items-center gap-2">
                  <Check size={15} className="text-success-600" />
                  Sem cartão de crédito
                </span>
                <span className="flex items-center gap-2">
                  <Check size={15} className="text-success-600" />
                  Seus dados, exportáveis
                </span>
              </motion.div>
            </motion.div>

            <motion.div
              initial={
                prefersReducedMotion
                  ? false
                  : { opacity: 0, y: 32, filter: 'blur(8px)' }
              }
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{
                duration: DURATION.ambient,
                ease: EASE_GLIDE,
                delay: 0.15,
              }}
              style={{ x: previewX, y: previewY }}
              className="flex flex-col gap-4"
            >
              <TiltCard tiltStrength={7}>
                <Bezel>
                  <AppPreview />
                </Bezel>
              </TiltCard>
              <ConsistencyRibbon />
            </motion.div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-24">
          <SectionReveal className="max-w-2xl">
            <span className="text-2xs text-primary-600 font-semibold tracking-[0.16em] uppercase">
              O que você monta aqui
            </span>
            <h2 className="font-heading mt-3 text-3xl font-bold sm:text-4xl">
              Quatro peças, uma manhã inteira.
            </h2>
          </SectionReveal>

          <motion.div
            variants={staggerSection}
            initial={prefersReducedMotion ? false : 'hidden'}
            whileInView="show"
            viewport={REVEAL_VIEWPORT}
            className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {features.map(({ icon: Icon, title, description }) => (
              <motion.div key={title} variants={revealUp}>
                <Card className="group h-full p-6 transition-[transform,box-shadow] duration-[--duration-base] ease-[--ease-glide] hover:-translate-y-1 hover:[box-shadow:var(--shadow-lift),var(--surface-highlight)]">
                  <div className="bg-primary-500/10 text-primary-600 flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-[--duration-base] ease-[--ease-glide] group-hover:scale-105">
                    <Icon size={19} />
                  </div>
                  <h3 className="font-heading mt-5 text-base font-bold">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                    {description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <section id="precos" className="mx-auto max-w-5xl px-6 py-24">
          <SectionReveal className="text-center">
            <span className="text-2xs text-primary-600 font-semibold tracking-[0.16em] uppercase">
              Preços
            </span>
            <h2 className="font-heading mt-3 text-3xl font-bold sm:text-4xl">
              Comece de graça,{' '}
              <span className="text-primary-600">evolua quando quiser</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-[var(--color-text-muted)]">
              O Alvorada é gratuito para organizar sua rotina, hábitos e
              finanças. O Premium adiciona estatísticas e relatórios avançados
              para quem quer ir mais fundo.
            </p>
          </SectionReveal>

          <SectionReveal delay={0.1} className="mt-12">
            <PricingTable
              freeCta={
                <Link
                  to="/cadastro"
                  className={cn(buttonVariants('secondary'), 'w-full')}
                >
                  Criar conta grátis
                </Link>
              }
              premiumCta={
                <Link
                  to="/cadastro"
                  className={cn(buttonVariants('primary'), 'w-full')}
                >
                  Criar conta e assinar
                </Link>
              }
            />
          </SectionReveal>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-24 text-center">
          <SectionReveal>
            <Card
              elevated
              className="relative isolate overflow-hidden px-8 py-16"
            >
              <DawnWash scale="panel" />
              <Badge
                tone="primary"
                className="text-2xs tracking-[0.14em] uppercase"
              >
                Leva alguns minutos
              </Badge>
              <h2 className="font-heading mt-5 text-3xl font-bold text-balance sm:text-4xl">
                Pequenos hábitos, grandes manhãs.
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm text-[var(--color-text-muted)]">
                Todo dia é uma nova chance de começar. Crie sua rotina em
                minutos e veja sua consistência crescer.
              </p>
              <Link
                to="/cadastro"
                className={cn(
                  buttonVariants('primary', 'lg', true),
                  'mt-8 pr-2',
                )}
              >
                Criar minha rotina
                <CtaArrow />
              </Link>
            </Card>
          </SectionReveal>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl border-t border-[var(--color-hairline)] px-6 py-10">
        <div className="flex flex-col items-center justify-between gap-4 text-xs text-[var(--color-text-muted)] sm:flex-row">
          <Logo size={26} />
          <p>
            © {new Date().getFullYear()} Alvorada. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
