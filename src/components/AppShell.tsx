import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import {
  HeartPulse,
  ListChecks,
  LogOut,
  Sunrise,
  Waypoints,
  type LucideIcon,
} from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/cn'

const navItems = [
  { to: '/app', label: 'Meu dia', icon: Sunrise, end: true },
  { to: '/app/rotina', label: 'Rotina', icon: Waypoints, end: false },
  { to: '/app/habitos', label: 'Hábitos', icon: HeartPulse, end: false },
  { to: '/app/tarefas', label: 'Tarefas', icon: ListChecks, end: false },
]

function RailTooltip({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute top-1/2 left-full z-20 ml-2 -translate-y-1/2 rounded-md bg-[var(--color-text)] px-2 py-1 text-xs font-medium whitespace-nowrap text-[var(--color-bg)] opacity-0 shadow-lg transition group-hover:opacity-100">
      {label}
    </span>
  )
}

function RailLink({
  to,
  end,
  label,
  icon: Icon,
}: {
  to: string
  end?: boolean
  label: string
  icon: LucideIcon
}) {
  return (
    <div className="group relative">
      <NavLink
        to={to}
        end={end}
        aria-label={label}
        className={({ isActive }) =>
          cn(
            'flex h-11 w-11 items-center justify-center rounded-xl transition',
            isActive
              ? 'bg-primary-500/10 text-primary-600'
              : 'text-[var(--color-text-muted)] hover:bg-[var(--color-border)]/40',
          )
        }
      >
        <Icon size={20} />
      </NavLink>
      <RailTooltip label={label} />
    </div>
  )
}

function RailButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void
  label: string
  children: ReactNode
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className="flex h-11 w-11 items-center justify-center rounded-xl text-[var(--color-text-muted)] transition hover:bg-[var(--color-border)]/40"
      >
        {children}
      </button>
      <RailTooltip label={label} />
    </div>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const { signOut, user } = useAuth()

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="mx-auto flex max-w-5xl">
        <aside className="sticky top-0 hidden h-screen w-[72px] shrink-0 flex-col items-center border-r border-[var(--color-border)]/60 py-4 sm:flex">
          <NavLink
            to="/app"
            end
            aria-label="Alvorada"
            className="from-primary-500 to-accent-500 font-heading mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-bold text-white"
          >
            A
          </NavLink>

          <nav className="flex flex-1 flex-col items-center gap-1">
            {navItems.map((item) => (
              <RailLink key={item.to} {...item} />
            ))}
          </nav>

          <div className="flex flex-col items-center gap-2">
            <ThemeToggle />
            <RailButton label="Sair" onClick={() => void signOut()}>
              <LogOut size={18} />
            </RailButton>
          </div>
        </aside>

        <div className="min-w-0 flex-1 pb-20 sm:pb-0">
          <header className="hidden items-center justify-end border-b border-[var(--color-border)]/60 px-8 py-4 sm:flex">
            <div className="flex items-center gap-3">
              <span className="text-sm text-[var(--color-text-muted)]">
                {user?.email}
              </span>
              <div className="from-primary-500 to-accent-500 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold text-white">
                {user?.email?.[0]?.toUpperCase()}
              </div>
            </div>
          </header>

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
