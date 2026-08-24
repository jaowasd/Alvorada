import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  HeartPulse,
  ListChecks,
  LogOut,
  Settings,
  Sunrise,
  Wallet,
  Waypoints,
  type LucideIcon,
} from 'lucide-react'
import { Logo } from '@/components/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useDisplayName } from '@/hooks/useProfile'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/cn'
import { interactiveStates } from '@/lib/interactive-states'
import { SPRING_SNAPPY } from '@/lib/motion'

const navItems = [
  { to: '/app', label: 'Meu dia', icon: Sunrise, end: true },
  { to: '/app/rotina', label: 'Rotina', icon: Waypoints, end: false },
  { to: '/app/habitos', label: 'Hábitos', icon: HeartPulse, end: false },
  { to: '/app/tarefas', label: 'Tarefas', icon: ListChecks, end: false },
  { to: '/app/financas', label: 'Finanças', icon: Wallet, end: false },
]

const financeSubItems = [
  { to: '/app/financas', label: 'Visão geral', end: true },
  { to: '/app/financas/transacoes', label: 'Transações', end: false },
  { to: '/app/financas/contas', label: 'Contas', end: false },
  { to: '/app/financas/contas-da-casa', label: 'Contas da casa', end: false },
  { to: '/app/financas/configuracoes', label: 'Configurações', end: false },
]

function SidebarLink({
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
    <NavLink to={to} end={end} className="relative">
      {({ isActive }) => (
        <span
          className={cn(
            'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
            isActive
              ? 'text-primary-600'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
          )}
        >
          {isActive && (
            <motion.span
              layoutId="sidebar-active-pill"
              className="bg-primary-500/10 absolute inset-0 rounded-xl"
              transition={SPRING_SNAPPY}
            />
          )}
          <Icon size={18} className="relative z-10 shrink-0" />
          <span className="relative z-10 truncate">{label}</span>
        </span>
      )}
    </NavLink>
  )
}

function SidebarSubLink({
  to,
  end,
  label,
}: {
  to: string
  end?: boolean
  label: string
}) {
  return (
    <NavLink to={to} end={end} className="relative block">
      {({ isActive }) => (
        <span
          className={cn(
            'relative block rounded-lg px-3 py-2 text-sm transition-colors',
            isActive
              ? 'text-primary-600 font-medium'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
          )}
        >
          {isActive && (
            <motion.span
              layoutId="financas-sub-active-pill"
              className="bg-primary-500/10 absolute inset-0 rounded-lg"
              transition={SPRING_SNAPPY}
            />
          )}
          <span className="relative z-10">{label}</span>
        </span>
      )}
    </NavLink>
  )
}

function UserAvatar({ name }: { name: string }) {
  return (
    <div className="from-primary-500 to-primary-700 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold text-white">
      {name?.[0]?.toUpperCase() ?? '?'}
    </div>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const { signOut } = useAuth()
  const location = useLocation()
  const displayName = useDisplayName()

  const currentItem =
    navItems.find((item) =>
      item.end
        ? location.pathname === item.to
        : location.pathname.startsWith(item.to),
    ) ?? navItems[0]

  const isInFinancas = currentItem.to === '/app/financas'
  const currentFinanceSubItem = isInFinancas
    ? (financeSubItems.find((item) =>
        item.end
          ? location.pathname === item.to
          : location.pathname.startsWith(item.to),
      ) ?? financeSubItems[0])
    : null
  const isInPerfil = location.pathname.startsWith('/app/perfil')
  const isInConfiguracoes = location.pathname.startsWith('/app/configuracoes')
  const headerTitle = isInPerfil
    ? 'Perfil'
    : isInConfiguracoes
      ? 'Configurações'
      : (currentFinanceSubItem?.label ?? currentItem.label)

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="mx-auto flex max-w-[1400px]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-sidebar)] px-4 py-5 sm:flex">
          <NavLink to="/app" end className="px-2">
            <Logo />
          </NavLink>

          <nav className="mt-8 flex flex-1 flex-col gap-1">
            <p className="px-3 pb-1 text-xs font-semibold tracking-wide text-[var(--color-text-muted)] uppercase">
              Menu
            </p>
            {navItems.map((item) => (
              <div key={item.to}>
                <SidebarLink {...item} />
                {item.to === '/app/financas' && (
                  <AnimatePresence initial={false}>
                    {isInFinancas && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-col gap-0.5 py-1 pl-8">
                          {financeSubItems.map((subItem) => (
                            <SidebarSubLink key={subItem.to} {...subItem} />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </nav>

          <div className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-4">
            <NavLink
              to="/app/perfil"
              className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-[var(--color-bg)]"
            >
              <UserAvatar name={displayName} />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--color-text)]">
                {displayName}
              </span>
            </NavLink>
            <div className="flex items-center gap-2 px-1">
              <NavLink
                to="/app/configuracoes"
                aria-label="Configurações"
                className={({ isActive }) =>
                  cn(
                    'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg hover:bg-[var(--color-bg)]',
                    interactiveStates,
                    isActive
                      ? 'text-primary-600'
                      : 'text-[var(--color-text-muted)]',
                  )
                }
              >
                <Settings size={16} />
              </NavLink>
              <ThemeToggle />
              <button
                type="button"
                onClick={() => void signOut()}
                className={cn(
                  'flex flex-1 items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]',
                  interactiveStates,
                )}
              >
                <LogOut size={16} />
                Sair
              </button>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 pb-20 sm:pb-0">
          <header className="hidden items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-8 py-4 sm:flex">
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">
                Alvorada{isInFinancas ? ' / Finanças' : ''}
              </p>
              <h2 className="font-heading text-sm font-semibold text-[var(--color-text)]">
                {headerTitle}
              </h2>
            </div>
            <NavLink
              to="/app/perfil"
              className="flex items-center gap-3 rounded-xl px-2 py-1 transition-colors hover:bg-[var(--color-bg)]"
            >
              <span className="text-sm text-[var(--color-text-muted)]">
                {displayName}
              </span>
              <UserAvatar name={displayName} />
            </NavLink>
          </header>

          <header className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 sm:hidden">
            <Logo size={30} />
            <div className="flex items-center gap-2">
              <NavLink to="/app/perfil" aria-label="Perfil">
                <UserAvatar name={displayName} />
              </NavLink>
              <NavLink
                to="/app/configuracoes"
                aria-label="Configurações"
                className={cn(
                  'inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]',
                  interactiveStates,
                )}
              >
                <Settings size={18} />
              </NavLink>
              <ThemeToggle />
              <button
                type="button"
                onClick={() => void signOut()}
                aria-label="Sair"
                className={cn(
                  'inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]',
                  interactiveStates,
                )}
              >
                <LogOut size={18} />
              </button>
            </div>
          </header>

          <main className="p-4 sm:p-8">{children}</main>
        </div>

        <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-[var(--color-border)] bg-[var(--color-surface)] sm:hidden">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium transition-colors',
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
