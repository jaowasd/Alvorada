import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { buttonVariants } from '@/lib/button-variants'
import { Card } from '@/components/ui/Card'
import { Logo } from '@/components/Logo'

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--color-bg)] px-6 text-[var(--color-text)]">
      <Link to="/">
        <Logo />
      </Link>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <Card className="shadow-card-lg max-w-sm p-8 text-center">
          <h1 className="font-heading text-3xl font-bold">404</h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Não encontramos essa página. Ela pode ter sido movida ou ainda não
            existe.
          </p>
          <Link
            to="/"
            className={`${buttonVariants('primary')} mt-6 inline-flex`}
          >
            Voltar para o início
          </Link>
        </Card>
      </motion.div>
    </main>
  )
}
