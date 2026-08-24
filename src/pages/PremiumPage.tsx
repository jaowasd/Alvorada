import { useState } from 'react'
import { Info } from 'lucide-react'
import { PricingTable } from '@/components/premium/PricingTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageFade } from '@/components/ui/PageFade'
import { usePlan, useSetPlan } from '@/hooks/usePlan'

export function PremiumPage() {
  const plan = usePlan()
  const setPlanMutation = useSetPlan()
  const [justChanged, setJustChanged] = useState(false)

  const handleSetPlan = (nextPlan: 'free' | 'premium') => {
    setPlanMutation.mutate(nextPlan, {
      onSuccess: () => {
        setJustChanged(true)
        setTimeout(() => setJustChanged(false), 2500)
      },
    })
  }

  return (
    <PageFade className="mx-auto max-w-4xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-[var(--color-text)]">
          Meu plano
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Você está no plano{' '}
          <strong className="text-[var(--color-text)]">
            {plan === 'premium' ? 'Premium' : 'Free'}
          </strong>
          .
        </p>
      </div>

      <Card className="border-primary-600/30 bg-primary-500/5 mt-6 flex gap-3 p-4">
        <Info size={18} className="text-primary-600 mt-0.5 shrink-0" />
        <p className="text-sm text-[var(--color-text-muted)]">
          Ainda não processamos pagamentos — este botão apenas marca sua conta
          como Premium para você testar os recursos. Quando a cobrança real
          existir, este fluxo muda para um checkout.
        </p>
      </Card>

      {justChanged && (
        <p
          role="status"
          aria-live="polite"
          className="text-success-600 mt-3 text-sm"
        >
          Plano atualizado.
        </p>
      )}

      <div className="mt-6">
        <PricingTable
          freeCta={
            plan === 'free' ? (
              <Badge tone="primary" className="w-full py-2 text-center">
                Seu plano atual
              </Badge>
            ) : (
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => handleSetPlan('free')}
                disabled={setPlanMutation.isPending}
              >
                Voltar para o plano Free
              </Button>
            )
          }
          premiumCta={
            plan === 'premium' ? (
              <Badge tone="primary" className="w-full py-2 text-center">
                Seu plano atual
              </Badge>
            ) : (
              <Button
                className="w-full"
                onClick={() => handleSetPlan('premium')}
                disabled={setPlanMutation.isPending}
              >
                {setPlanMutation.isPending ? 'Atualizando…' : 'Virar Premium'}
              </Button>
            )
          }
        />
      </div>
    </PageFade>
  )
}
