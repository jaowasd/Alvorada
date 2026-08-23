import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { ListChecks, LogOut, Sunrise, Waypoints } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/cn'

const navItems = [
  { to: '/app', label: 'Meu dia', icon: Sunrise, end: true },
  { to: '/app/rotina', label: 'Rotina', icon: Waypoints, end: false },
  { to: '/app/tarefas', label: 'Tarefas', icon: ListChecks, end: false },
]

export function AppShell({ children }: { children: ReactNode }) {
  const { signOut } = useAuth()

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="mx-auto flex max-w-5xl">
        <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-[var(--color-border)] p-4 sm:flex">
          <span className="font-heading px-2 text-lg font-semibold">
            Alvorada
          </span>
          <nav className="mt-6 flex flex-col gap-1">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
                    isActive
                      ? 'bg-primary-500/10 text-primary-600'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-border)]/30',
                  )
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto flex items-center justify-between px-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => void signOut()}
              aria-label="Sair"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-border)]/30"
            >
              <LogOut size={18} />
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1 pb-20 sm:pb-0">
          <header className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3 sm:hidden">
            <span className="font-heading text-lg font-semibold">Alvorada</span>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                type="button"
                onClick={() => void signOut()}
                aria-label="Sair"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-border)]/30"
              >
                <LogOut size={18} />
              </button>
            </div>
          </header>

          <main className="p-4 sm:p-8">{children}</main>
        </div>

        <nav className="fixed inset-x-0 bottom-0 flex border-t border-[var(--color-border)] bg-[var(--color-surface)] sm:hidden">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium',
                  isActive
                    ? 'text-primary-600'
                    : 'text-[var(--color-text-muted)]',
                )
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
