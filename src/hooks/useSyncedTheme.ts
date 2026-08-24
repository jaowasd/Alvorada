import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { useTheme, type Theme } from '@/hooks/useTheme'
import { updateProfile } from '@/lib/queries/profile'

/**
 * Tema com sincronização de conta: aplica profiles.theme_preference assim
 * que o perfil carrega (uma vez por sessão) e grava de volta no perfil
 * sempre que o usuário troca o tema, para refletir em outros dispositivos.
 * O localStorage (via useTheme) continua sendo a fonte rápida usada antes
 * do React montar, evitando flash — este hook só mantém as duas em sync.
 */
export function useSyncedTheme(): {
  theme: Theme
  setTheme: (next: Theme) => void
} {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const { data: profile } = useProfile()
  const queryClient = useQueryClient()
  const syncedRef = useRef(false)

  useEffect(() => {
    if (!profile || syncedRef.current) return
    syncedRef.current = true
    if (profile.theme_preference !== theme) {
      setTheme(profile.theme_preference)
    }
  }, [profile, theme, setTheme])

  const setSyncedTheme = (next: Theme) => {
    setTheme(next)
    if (!user) return
    updateProfile(user.id, { theme_preference: next })
      .then((data) => {
        queryClient.setQueryData(['profile', user.id], data)
      })
      .catch(() => {})
  }

  return { theme, setTheme: setSyncedTheme }
}
