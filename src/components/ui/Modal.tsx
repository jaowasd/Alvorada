import { useEffect, type MouseEvent, type ReactNode } from 'react'
import { motion } from 'framer-motion'
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
    <motion.div
      role="presentation"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={stopPropagation}
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <Card className="shadow-card-lg max-h-[85vh] overflow-y-auto p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg)]"
            >
              <X size={18} />
            </button>
          </div>
          <div className="mt-4">{children}</div>
        </Card>
      </motion.div>
    </motion.div>
  )
}
