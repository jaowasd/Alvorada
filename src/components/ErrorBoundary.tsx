import { Component, type ErrorInfo, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Logo } from '@/components/Logo'
import { buttonVariants } from '@/lib/button-variants'
import { EASE_SMOOTH } from '@/lib/motion'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Erro não tratado na interface:', error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--color-bg)] px-6 text-[var(--color-text)]">
        <Logo />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE_SMOOTH }}
        >
          <Card className="shadow-card-lg max-w-sm p-8 text-center">
            <h1 className="font-heading text-2xl font-bold">Algo deu errado</h1>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Encontramos um problema inesperado. Recarregar a página costuma
              resolver.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className={`${buttonVariants('primary')} mt-6`}
            >
              Recarregar página
            </button>
          </Card>
        </motion.div>
      </main>
    )
  }
}
