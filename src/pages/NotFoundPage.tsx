import { Link } from 'react-router-dom'
import { buttonVariants } from '@/lib/button-variants'
import { Card } from '@/components/ui/Card'

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-6 text-[var(--color-text)]">
      <Card className="max-w-sm p-8 text-center">
        <h1 className="text-3xl font-semibold">404</h1>
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
    </main>
  )
}
