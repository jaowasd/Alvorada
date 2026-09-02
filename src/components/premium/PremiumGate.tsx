import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { buttonVariants } from '@/lib/button-variants'
import { cn } from '@/lib/cn'
import { useIsPremium } from '@/hooks/usePlan'

interface PremiumGateProps {
  title: string
  description: string
  children: ReactNode
  className?: string
}

/**
 * Mostra a feature real (borrada, sem interação) para quem está no Free,
 * com um CTA sobreposto para /app/premium — em vez de esconder a feature,
 * é o padrão comum de conversão em SaaS.
 */
export function PremiumGate({
  title,
  description,
  children,
  className,
}: PremiumGateProps) {
  const isPremium = useIsPremium()

  if (isPremium) return <>{children}</>

  return (
    <div className={cn('relative min-h-[22rem]', className)}>
      <div
        aria-hidden="true"
        className="pointer-events-none max-h-full overflow-hidden opacity-60 blur-sm select-none"
      >
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <Card elevated className="max-w-sm p-6 text-center">
          <div className="bg-primary-500/10 text-primary-600 mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full">
            <Lock size={22} />
          </div>
          <h3 className="mt-4 text-base font-semibold text-[var(--color-text)]">
            {title}
          </h3>
          <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">
            {description}
          </p>
          <Link
            to="/app/premium"
            className={cn(buttonVariants('primary'), 'mt-5')}
          >
            Ver plano Premium
          </Link>
        </Card>
      </div>
    </div>
  )
}
