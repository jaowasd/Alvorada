import { useEffect, type MouseEvent, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { Card } from '@/components/ui/Card'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
}

export function Modal({ title, onClose, children }: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const stopPropagation = (event: MouseEvent) => event.stopPropagation()

  return (
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <Card
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={stopPropagation}
        className="w-full max-w-md p-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-border)]/30"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </Card>
    </div>
  )
}
