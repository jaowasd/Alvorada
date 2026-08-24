import { useEffect, useRef, useState } from 'react'
import { MoreVertical, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { interactiveStates } from '@/lib/interactive-states'

export interface ItemMenuAction {
  label: string
  icon: LucideIcon
  onClick: () => void
  tone?: 'default' | 'danger'
}

interface ItemMenuProps {
  actions: ItemMenuAction[]
  triggerLabel?: string
  triggerClassName?: string
}

export function ItemMenu({
  actions,
  triggerLabel = 'Mais ações',
  triggerClassName,
}: ItemMenuProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={triggerLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          'inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-border)]/40',
          interactiveStates,
          triggerClassName,
        )}
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <div
          role="menu"
          className="shadow-popover absolute right-0 z-10 mt-1 w-40 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-1"
        >
          {actions.map(({ label, icon: Icon, onClick, tone = 'default' }) => (
            <button
              key={label}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                onClick()
              }}
              className={cn(
                'flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--color-bg)]',
                tone === 'danger'
                  ? 'text-error-500'
                  : 'text-[var(--color-text)]',
                interactiveStates,
              )}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
