import { Crown } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/cn'

interface PremiumBadgeProps {
  className?: string
}

export function PremiumBadge({ className }: PremiumBadgeProps) {
  return (
    <Badge
      tone="primary"
      className={cn('inline-flex items-center gap-1', className)}
    >
      <Crown size={11} />
      Premium
    </Badge>
  )
}
