import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { fetchProfile } from '@/lib/queries/profile'
import type { Profile } from '@/types/database'

export function useProfile(): UseQueryResult<Profile> {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => fetchProfile(user!.id),
    enabled: !!user,
  })
}

/**
 * Nome usado para se referir ao usuário no site: o apelido escolhido por
 * ele (profiles.display_name), ou o nome derivado do e-mail enquanto
 * nenhum apelido tiver sido definido.
 */
export function useDisplayName(): string {
  const { user } = useAuth()
  const { data: profile } = useProfile()
  const nickname = profile?.display_name?.trim()
  if (nickname) return nickname
  return user?.email?.split('@')[0] ?? ''
}
