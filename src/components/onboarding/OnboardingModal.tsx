import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Flame, Sunrise, Timer, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { EASE_SMOOTH } from '@/lib/motion'

interface Slide {
  icon: LucideIcon
  title: string
  description: string
}

const SLIDES: Slide[] = [
  {
    icon: Sunrise,
    title: 'Bem-vindo ao Alvorada',
    description:
      'Organize sua rotina matinal, seus hábitos e suas tarefas em um só lugar, com um jeito calmo e rápido de ver seu progresso.',
  },
  {
    icon: Flame,
    title: 'Rotina e hábitos',
    description:
      'Monte sua rotina matinal em etapas e acompanhe hábitos diários ou em dias específicos. Suas sequências mostram sua consistência ao longo do tempo.',
  },
  {
    icon: Timer,
    title: 'Modo foco',
    description:
      'Quando precisar de concentração, inicie uma sessão cronometrada direto do seu "Meu dia".',
  },
]

interface OnboardingModalProps {
  onFinish: () => void
}

export function OnboardingModal({ onFinish }: OnboardingModalProps) {
  const [index, setIndex] = useState(0)
  const slide = SLIDES[index]
  const isLast = index === SLIDES.length - 1

  return (
    <Modal title="Começando" onClose={onFinish}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.2, ease: EASE_SMOOTH }}
          className="flex flex-col items-center text-center"
        >
          <div className="bg-primary-500/10 text-primary-600 flex h-14 w-14 items-center justify-center rounded-full">
            <slide.icon size={26} />
          </div>
          <h3 className="mt-4 text-base font-semibold text-[var(--color-text)]">
            {slide.title}
          </h3>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            {slide.description}
          </p>
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex gap-1.5">
          {SLIDES.map((_, dotIndex) => (
            <span
              key={dotIndex}
              className={
                dotIndex === index
                  ? 'bg-primary-600 h-1.5 w-4 rounded-full'
                  : 'h-1.5 w-1.5 rounded-full bg-[var(--color-border)]'
              }
            />
          ))}
        </div>
        <div className="flex gap-2">
          {index > 0 && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIndex((value) => value - 1)}
            >
              Voltar
            </Button>
          )}
          <Button
            type="button"
            onClick={() =>
              isLast ? onFinish() : setIndex((value) => value + 1)
            }
          >
            {isLast ? 'Começar' : 'Próximo'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
