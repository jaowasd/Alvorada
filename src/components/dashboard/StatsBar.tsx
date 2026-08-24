import type { ReactNode } from 'react'
import { Card } from '@/components/ui/Card'

export function StatsBar({ children }: { children: ReactNode }) {
  return (
    <Card className="flex flex-col divide-y divide-[var(--color-border)] overflow-hidden py-0 sm:flex-row sm:divide-x sm:divide-y-0">
      {children}
    </Card>
  )
}
