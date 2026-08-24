import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CircleCheck } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { Card } from '@/components/ui/Card'
import { fetchSharedRoutine } from '@/lib/queries/sharedRoutineLinks'

export function SharedRoutinePage() {
  const { token } = useParams<{ token: string }>()

  const query = useQuery({
    queryKey: ['sharedRoutine', token],
    queryFn: () => fetchSharedRoutine(token!),
    enabled: !!token,
  })

  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-4 py-10">
      <div className="mx-auto max-w-lg">
        <Logo />

        {query.isLoading && (
          <p
            role="status"
            aria-live="polite"
            className="mt-8 text-sm text-[var(--color-text-muted)]"
          >
            Carregando…
          </p>
        )}

        {!query.isLoading && !query.data && (
          <Card className="mt-8 p-8 text-center text-sm text-[var(--color-text-muted)]">
            Este link não existe mais ou foi revogado.
          </Card>
        )}

        {query.data && (
          <Card className="mt-8 p-6">
            <h1 className="font-heading text-xl font-bold text-[var(--color-text)]">
              {query.data.routineName}
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Rotina compartilhada — somente leitura.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {query.data.steps.map((step) => (
                <div
                  key={step.orderIndex}
                  className="flex items-center gap-2 text-sm text-[var(--color-text)]"
                >
                  <CircleCheck
                    size={16}
                    className="shrink-0 text-[var(--color-text-muted)]"
                  />
                  {step.title}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
