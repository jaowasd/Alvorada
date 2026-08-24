import type { ReactNode } from 'react'
import { Check, Crown } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { TiltCard } from '@/components/ui/TiltCard'
import { cn } from '@/lib/cn'

const FREE_FEATURES = [
  'Rotina matinal com etapas ilimitadas e arraste para reordenar',
  'Hábitos diários ou em dias específicos, com sequências (streaks)',
  'Tarefas, metas pessoais e diário rápido',
  'Lembretes e modo foco (sessões cronometradas)',
  'Calendário unificado de rotina, hábitos, tarefas e finanças',
  'Módulo financeiro completo — contas, transações e contas da casa',
  'Rotina compartilhável por link público',
  'Exportar seus dados e assinar seu calendário (.ics)',
]

const PREMIUM_FEATURES = [
  'Tudo do plano Free',
  'Estatísticas avançadas — evolução de hábitos, rotina e tarefas ao longo do tempo',
  'Relatórios financeiros avançados — tendência mensal, comparação entre categorias e exportação em CSV',
  'Orçamentos por categoria com alerta visual de limite',
]

interface PricingTableProps {
  freeCta: ReactNode
  premiumCta: ReactNode
  className?: string
}

export function PricingTable({
  freeCta,
  premiumCta,
  className,
}: PricingTableProps) {
  return (
    <div className={cn('grid gap-6 sm:grid-cols-2', className)}>
      <TiltCard tiltStrength={4} className="h-full">
        <Card className="shadow-card flex h-full flex-col p-8 text-left">
          <h3 className="text-lg font-semibold text-[var(--color-text)]">
            Free
          </h3>
          <p className="mt-2">
            <span className="font-heading text-4xl font-bold text-[var(--color-text)]">
              R$ 0
            </span>
            <span className="text-sm text-[var(--color-text-muted)]">/mês</span>
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Tudo que você precisa para organizar sua rotina, seus hábitos e suas
            finanças. Para sempre.
          </p>
          <ul className="mt-6 flex-1 space-y-3 text-sm">
            {FREE_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <Check size={16} className="text-success-600 mt-0.5 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6">{freeCta}</div>
        </Card>
      </TiltCard>

      <TiltCard tiltStrength={4} className="h-full">
        <Card className="shadow-card-lg border-primary-600 relative flex h-full flex-col border-2 p-8 text-left">
          <span className="bg-primary-600 absolute -top-3 left-8 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-white">
            <Crown size={12} />
            Recomendado
          </span>
          <h3 className="text-lg font-semibold text-[var(--color-text)]">
            Premium
          </h3>
          <p className="mt-2">
            <span className="font-heading text-4xl font-bold text-[var(--color-text)]">
              R$ 10,90
            </span>
            <span className="text-sm text-[var(--color-text-muted)]">/mês</span>
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Tudo do Free, mais recursos avançados de análise e planejamento.
          </p>
          <ul className="mt-6 flex-1 space-y-3 text-sm">
            {PREMIUM_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <Check size={16} className="text-success-600 mt-0.5 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6">{premiumCta}</div>
        </Card>
      </TiltCard>
    </div>
  )
}
