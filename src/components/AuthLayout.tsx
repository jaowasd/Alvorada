import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion, useSpring, useTransform } from 'framer-motion'
import { DawnScene } from '@/components/ui/DawnScene'
import { Logo } from '@/components/Logo'
import { Card } from '@/components/ui/Card'
import { useDaypart } from '@/hooks/useDaypart'
import { POINTER_RANGE, usePointerScene } from '@/hooks/usePointerScene'
import { DAYPART_LABELS } from '@/lib/daypart'
import { DURATION, EASE_GLIDE, SPRING_SOFT } from '@/lib/motion'

interface AuthLayoutProps {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}

/** Inclinação máxima do cartão, em graus. Acima disso o formulário incomoda. */
const MAX_TILT = 5

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  const daypart = useDaypart()
  const {
    pointerX,
    pointerY,
    interactive,
    prefersReducedMotion,
    sceneHandlers,
  } = usePointerScene()

  /**
   * Enquanto o usuário está preenchendo o formulário, o cartão volta ao plano.
   * A decoração cede à tarefa: mirar um campo que inclina junto com o mouse é
   * exatamente o tipo de charme que atrapalha.
   */
  const [engaged, setEngaged] = useState(false)
  const tiltAmount = useSpring(engaged ? 0 : 1, SPRING_SOFT)

  const rotateY = useSpring(
    useTransform(
      [pointerX, tiltAmount],
      ([x, amount]: number[]) => (x / POINTER_RANGE) * MAX_TILT * amount,
    ),
    SPRING_SOFT,
  )
  const rotateX = useSpring(
    useTransform(
      [pointerY, tiltAmount],
      ([y, amount]: number[]) => (-y / POINTER_RANGE) * MAX_TILT * amount,
    ),
    SPRING_SOFT,
  )

  return (
    <main
      {...sceneHandlers}
      className="isolate flex min-h-screen items-center justify-center overflow-hidden bg-[var(--color-bg)] px-6 py-12"
    >
      <DawnScene
        pointerX={pointerX}
        pointerY={pointerY}
        animate={!prefersReducedMotion}
        anchor="viewport"
      />

      <div
        className="relative w-full max-w-sm"
        style={{ perspective: '1200px' }}
      >
        <motion.div
          initial={
            prefersReducedMotion
              ? false
              : { opacity: 0, y: 28, rotateX: 10, filter: 'blur(8px)' }
          }
          animate={{ opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)' }}
          transition={{ duration: DURATION.ambient, ease: EASE_GLIDE }}
          style={
            interactive
              ? { rotateX, rotateY, transformStyle: 'preserve-3d' }
              : undefined
          }
        >
          <div className="mb-8 flex flex-col items-center gap-3">
            <Link to="/" className="rounded-xl">
              <Logo size={44} />
            </Link>
            <p className="text-2xs inline-flex items-center gap-1.5 font-medium tracking-[0.14em] text-[var(--color-text-muted)] uppercase">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: 'var(--dawn-to)' }}
              />
              {DAYPART_LABELS[daypart]}
            </p>
          </div>

          <Card
            elevated
            onFocusCapture={() => setEngaged(true)}
            onBlurCapture={() => setEngaged(false)}
            className="bg-[var(--color-surface)]/88 p-8 backdrop-blur-xl"
          >
            <h1 className="font-heading text-2xl font-bold text-[var(--color-text)]">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                {subtitle}
              </p>
            )}
            <div className="mt-7">{children}</div>
          </Card>

          {footer && (
            <div className="mt-5 text-center text-sm text-[var(--color-text-muted)]">
              {footer}
            </div>
          )}
        </motion.div>
      </div>
    </main>
  )
}
