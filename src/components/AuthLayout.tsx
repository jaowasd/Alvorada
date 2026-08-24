import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Logo } from '@/components/Logo'
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
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        <div className="mb-6 flex justify-center">
          <Link to="/">
            <Logo />
          </Link>
        </div>
        <Card className="shadow-card-lg p-8">
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
      </motion.div>
    </main>
  )
}
