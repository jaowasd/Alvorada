import { useEffect, useRef } from 'react'
import { Outlet } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { FinancasSubNav } from '@/components/financas/FinancasSubNav'
import { useAuth } from '@/hooks/useAuth'
import { generateMissingRecurringInstances } from '@/lib/queries/financas/recurring'

/**
 * Layout compartilhado por todas as rotas /app/financas/*. Gera as
 * instâncias de recorrência faltantes uma vez por visita à seção (sem
 * cron) e invalida as queries afetadas para que qualquer página filha já
 * montada reflita os novos lançamentos automaticamente.
 */
export function FinancasLayout() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const generatedForUserId = useRef<string | null>(null)

  useEffect(() => {
    if (!user || generatedForUserId.current === user.id) return
    generatedForUserId.current = user.id
    generateMissingRecurringInstances(user.id)
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: ['financeTransactions', user.id],
        })
        queryClient.invalidateQueries({
          queryKey: ['financeRecurring', user.id],
        })
      })
      .catch(() => {})
  }, [user, queryClient])

  return (
    <div>
      <FinancasSubNav />
      <Outlet />
    </div>
  )
}
