import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
        <p
          role="status"
          aria-live="polite"
          className="text-sm text-[var(--color-text-muted)]"
        >
          Carregando…
        </p>
      </div>
    )
  }
  if (user) return <Navigate to="/app" replace />

  return <>{children}</>
}
