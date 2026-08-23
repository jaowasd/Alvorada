import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'

interface AuthLayoutProps {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Link
            to="/"
            className="font-heading text-lg font-semibold text-[var(--color-text)]"
          >
            Alvorada
          </Link>
        </div>
        <Card className="p-8">
          <h1 className="text-xl font-semibold text-[var(--color-text)]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {subtitle}
            </p>
          )}
          <div className="mt-6">{children}</div>
        </Card>
        {footer && (
          <div className="mt-4 text-center text-sm text-[var(--color-text-muted)]">
            {footer}
          </div>
        )}
      </div>
    </main>
  )
}
