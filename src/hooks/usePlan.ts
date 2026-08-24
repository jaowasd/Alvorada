import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { setOwnPlan } from '@/lib/queries/profile'
import type { PlanTier } from '@/types/database'

export function usePlan(): PlanTier {
  const { data: profile } = useProfile()
  return profile?.plan ?? 'free'
}

export function useIsPremium(): boolean {
  return usePlan() === 'premium'
}

export function useSetPlan() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (plan: PlanTier) => setOwnPlan(plan),
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', user?.id], data)
    },
  })
}
