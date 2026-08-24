import { AnimatePresence, motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { useSyncedTheme } from '@/hooks/useSyncedTheme'
import { cn } from '@/lib/cn'
import { interactiveStates } from '@/lib/interactive-states'

export function ThemeToggle() {
  const { theme, setTheme } = useSyncedTheme()

  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      className={cn(
        'relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg)]',
        interactiveStates,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? 'sun' : 'moon'}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-center"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
