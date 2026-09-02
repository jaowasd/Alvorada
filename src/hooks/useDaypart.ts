import { useEffect, useState } from 'react'
import { DAYPART_ATTRIBUTE, resolveDaypart, type Daypart } from '@/lib/daypart'

/**
 * Mantém `data-daypart` no <html> em dia com o relógio. O valor inicial já
 * foi escrito por public/theme-init.js antes da primeira pintura; aqui só
 * cuidamos da virada de fase enquanto a aba fica aberta — quem estuda de
 * madrugada não deveria ver o "amanhecer" chegar só depois de recarregar.
 */
export function useDaypart(): Daypart {
  const [daypart, setDaypart] = useState<Daypart>(() => resolveDaypart())

  useEffect(() => {
    const sync = () => {
      const next = resolveDaypart()
      setDaypart(next)
      document.documentElement.setAttribute(DAYPART_ATTRIBUTE, next)
    }

    sync()
    const interval = setInterval(sync, 15 * 60 * 1000)
    window.addEventListener('focus', sync)
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', sync)
    }
  }, [])

  return daypart
}
