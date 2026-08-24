import { useRef, useState } from 'react'

const FEEDBACK_DURATION_MS = 2000

/**
 * Mensagem de sucesso inline que aparece e some sozinha — mesmo padrão já
 * usado manualmente em JournalCard/FocusLauncherCard/ShareRoutineButton,
 * extraído aqui para reutilização. O consumidor renderiza `message` com
 * `role="status" aria-live="polite"` quando não for `null`.
 */
export function useInlineFeedback() {
  const [message, setMessage] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = (text: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setMessage(text)
    timeoutRef.current = setTimeout(
      () => setMessage(null),
      FEEDBACK_DURATION_MS,
    )
  }

  return { message, show }
}
