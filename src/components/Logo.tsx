import { Sunrise } from 'lucide-react'
import { cn } from '@/lib/cn'

interface LogoProps {
  withWordmark?: boolean
  size?: number
  className?: string
}

export function Logo({ withWordmark = true, size = 36, className }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        className="bg-primary-600 flex shrink-0 items-center justify-center rounded-xl text-white"
        style={{ width: size, height: size }}
      >
        <Sunrise size={Math.round(size * 0.52)} strokeWidth={2.25} />
      </span>
      {withWordmark && (
        <span className="font-heading text-lg font-bold text-[var(--color-text)]">
          Alvorada
        </span>
      )}
    </span>
  )
}
