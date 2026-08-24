import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence } from 'framer-motion'
import { Check, Copy, Share2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/cn'
import { interactiveStates } from '@/lib/interactive-states'
import {
  createSharedRoutineLink,
  fetchSharedRoutineLink,
  revokeSharedRoutineLink,
} from '@/lib/queries/sharedRoutineLinks'

interface ShareRoutineButtonProps {
  routineId: string
  disabled?: boolean
}

export function ShareRoutineButton({
  routineId,
  disabled,
}: ShareRoutineButtonProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const linkQuery = useQuery({
    queryKey: ['sharedRoutineLink', routineId],
    queryFn: () => fetchSharedRoutineLink(routineId),
    enabled: modalOpen,
  })
  const link = linkQuery.data

  const invalidateLink = () =>
    queryClient.invalidateQueries({
      queryKey: ['sharedRoutineLink', routineId],
    })

  const createMutation = useMutation({
    mutationFn: () => createSharedRoutineLink(user!.id, routineId),
    onSuccess: invalidateLink,
  })

  const revokeMutation = useMutation({
    mutationFn: (id: string) => revokeSharedRoutineLink(id),
    onSuccess: invalidateLink,
  })

  const shareUrl = link ? `${window.location.origin}/rotina/${link.token}` : ''

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        disabled={disabled}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] disabled:opacity-50',
          interactiveStates,
        )}
      >
        <Share2 size={16} /> Compartilhar
      </button>

      <AnimatePresence>
        {modalOpen && (
          <Modal
            title="Compartilhar rotina"
            onClose={() => setModalOpen(false)}
          >
            <p className="text-sm text-[var(--color-text-muted)]">
              Gere um link público somente-leitura da sua rotina — quem acessar
              vê só os nomes das etapas, sem precisar entrar na sua conta.
            </p>

            {linkQuery.isLoading && (
              <p
                role="status"
                aria-live="polite"
                className="mt-4 text-sm text-[var(--color-text-muted)]"
              >
                Carregando…
              </p>
            )}

            {!linkQuery.isLoading && !link && (
              <button
                type="button"
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending}
                className={cn(
                  'bg-primary-600 mt-4 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50',
                  interactiveStates,
                )}
              >
                Gerar link público
              </button>
            )}

            {link && (
              <div className="mt-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={shareUrl}
                    className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)]"
                  />
                  <button
                    type="button"
                    onClick={() => void handleCopy()}
                    aria-label="Copiar link"
                    className={cn(
                      'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]',
                      interactiveStates,
                    )}
                  >
                    {copied ? (
                      <Check size={16} className="text-success-600" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => revokeMutation.mutate(link.id)}
                  disabled={revokeMutation.isPending}
                  className={cn(
                    'text-error-500 self-start text-sm font-medium disabled:opacity-50',
                    interactiveStates,
                  )}
                >
                  Revogar link
                </button>
              </div>
            )}
          </Modal>
        )}
      </AnimatePresence>
    </>
  )
}
