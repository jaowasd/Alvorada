import { useState, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BarChart3,
  BookOpen,
  Calendar,
  Crown,
  GraduationCap,
  HeartPulse,
  ListChecks,
  LogOut,
  MoreHorizontal,
  Settings,
  Sunrise,
  Target,
  UserRound,
  Wallet,
  Waypoints,
  type LucideIcon,
} from 'lucide-react'
import { Logo } from '@/components/Logo'
import { DawnWash } from '@/components/ui/DawnWash'
import { PremiumBadge } from '@/components/premium/PremiumBadge'
import { ReminderBell } from '@/components/reminders/ReminderBell'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useDisplayName } from '@/hooks/useProfile'
import { useAuth } from '@/hooks/useAuth'
import { useDaypart } from '@/hooks/useDaypart'
import { usePlan } from '@/hooks/usePlan'
import { cn } from '@/lib/cn'
import { interactiveStates } from '@/lib/interactive-states'
import { EASE_SMOOTH, SPRING_SNAPPY } from '@/lib/motion'
import { STUDY_SUB_ITEMS } from '@/lib/studyNav'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
  premium?: boolean
}

const navItems: NavItem[] = [
  { to: '/app', label: 'Meu dia', icon: Sunrise, end: true },
  { to: '/app/calendario', label: 'Calendário', icon: Calendar, end: false },
  {
    to: '/app/estatisticas',
    label: 'Estatísticas',
    icon: BarChart3,
    end: false,
    premium: true,
  },
  { to: '/app/rotina', label: 'Rotina', icon: Waypoints, end: false },
  { to: '/app/habitos', label: 'Hábitos', icon: HeartPulse, end: false },
  { to: '/app/metas', label: 'Metas', icon: Target, end: false },
  { to: '/app/tarefas', label: 'Tarefas', icon: ListChecks, end: false },
  { to: '/app/estudos', label: 'Estudos', icon: GraduationCap, end: false },
  { to: '/app/diario', label: 'Diário', icon: BookOpen, end: false },
  { to: '/app/financas', label: 'Finanças', icon: Wallet, end: false },
]

const mobileFixedItems: NavItem[] = [
  { to: '/app', label: 'Meu dia', icon: Sunrise, end: true },
  { to: '/app/calendario', label: 'Calendário', icon: Calendar, end: false },
  { to: '/app/financas', label: 'Finanças', icon: Wallet, end: false },
]

const moreMenuItems: NavItem[] = [
  {
    to: '/app/estatisticas',
    label: 'Estatísticas',
    icon: BarChart3,
    premium: true,
  },
  { to: '/app/rotina', label: 'Rotina', icon: Waypoints },
  { to: '/app/habitos', label: 'Hábitos', icon: HeartPulse },
  { to: '/app/metas', label: 'Metas', icon: Target },
  { to: '/app/tarefas', label: 'Tarefas', icon: ListChecks },
  { to: '/app/estudos', label: 'Estudos', icon: GraduationCap },
  { to: '/app/diario', label: 'Diário', icon: BookOpen },
  { to: '/app/perfil', label: 'Perfil', icon: UserRound },
  { to: '/app/premium', label: 'Meu plano', icon: Crown },
]

interface SubNavItem {
  to: string
  label: string
  end?: boolean
  premium?: boolean
}

const financeSubItems: SubNavItem[] = [
  { to: '/app/financas', label: 'Visão geral', end: true },
  { to: '/app/financas/transacoes', label: 'Transações', end: false },
  { to: '/app/financas/contas', label: 'Contas', end: false },
  { to: '/app/financas/contas-da-casa', label: 'Contas da casa', end: false },
  {
    to: '/app/financas/orcamentos',
    label: 'Orçamentos',
    end: false,
    premium: true,
  },
  {
    to: '/app/financas/relatorios',
    label: 'Relatórios',
    end: false,
    premium: true,
  },
  { to: '/app/financas/configuracoes', label: 'Configurações', end: false },
]

/**
 * Seções que expandem sub-itens na sidebar. Antes isso era um `if` fixo em
 * '/app/financas' espalhado por quatro pontos do arquivo; com o mapa, uma
 * seção nova só precisa de uma entrada aqui.
 */
const subItemsBySection: Record<string, SubNavItem[]> = {
  '/app/financas': financeSubItems,
  '/app/estudos': STUDY_SUB_ITEMS,
}

function SidebarLink({
  to,
  end,
  label,
  icon: Icon,
  premium,
  showPremiumLock,
}: {
  to: string
  end?: boolean
  label: string
  icon: LucideIcon
  premium?: boolean
  showPremiumLock?: boolean
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
          <span className="relative z-10 flex-1 truncate">{label}</span>
          {premium && showPremiumLock && (
            <Crown
              size={13}
              className="text-primary-600 relative z-10 shrink-0"
            />
          )}
        </span>
      )}
    </NavLink>
  )
}

function SidebarSubLink({
  to,
  end,
  label,
  premium,
  showPremiumLock,
  layoutId,
}: {
  to: string
  end?: boolean
  label: string
  premium?: boolean
  showPremiumLock?: boolean
  /** Um por seção: duas listas de sub-itens nunca coexistem, e compartilhar
   * o mesmo layoutId faria a pílula animar entre elementos desmontados. */
  layoutId: string
}) {
  return (
    <NavLink to={to} end={end} className="relative block">
      {({ isActive }) => (
        <span
          className={cn(
            'relative flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
            isActive
              ? 'text-primary-600 font-medium'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
          )}
        >
          {isActive && (
            <motion.span
              layoutId={layoutId}
              className="bg-primary-500/10 absolute inset-0 rounded-lg"
              transition={SPRING_SNAPPY}
            />
          )}
          <span className="relative z-10">{label}</span>
          {premium && showPremiumLock && (
            <Crown
              size={12}
              className="text-primary-600 relative z-10 shrink-0"
            />
          )}
        </span>
      )}
    </NavLink>
  )
}

function PlanChip({ isPremium }: { isPremium: boolean }) {
  return (
    <NavLink
      to="/app/premium"
      className={cn(
        'flex items-center justify-between rounded-lg px-2 py-1.5 text-xs',
        interactiveStates,
        'hover:bg-[var(--color-bg)]',
      )}
    >
      {isPremium ? (
        <PremiumBadge />
      ) : (
        <>
          <span className="text-[var(--color-text-muted)]">Plano Free</span>
          <span className="text-primary-600 font-medium">Upgrade</span>
        </>
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
  const plan = usePlan()
  const isPremium = plan === 'premium'
  // Mantém data-daypart no <html> fresco enquanto a aba fica aberta.
  useDaypart()
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)

  const isInMoreSection = moreMenuItems.some((item) =>
    location.pathname.startsWith(item.to),
  )

  const currentItem =
    navItems.find((item) =>
      item.end
        ? location.pathname === item.to
        : location.pathname.startsWith(item.to),
    ) ?? navItems[0]

  const activeSubItems = subItemsBySection[currentItem.to] ?? null
  const currentSubItem = activeSubItems
    ? (activeSubItems.find((item) =>
        item.end
          ? location.pathname === item.to
          : location.pathname.startsWith(item.to),
      ) ?? activeSubItems[0])
    : null
  const isInPerfil = location.pathname.startsWith('/app/perfil')
  const isInConfiguracoes = location.pathname.startsWith('/app/configuracoes')
  const isInPremium = location.pathname.startsWith('/app/premium')
  const headerTitle = isInPerfil
    ? 'Perfil'
    : isInConfiguracoes
      ? 'Configurações'
      : isInPremium
        ? 'Meu plano'
        : (currentSubItem?.label ?? currentItem.label)

  return (
    <div className="isolate min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <DawnWash />
      <div className="relative mx-auto flex max-w-[1400px]">
        <aside className="sticky top-0 isolate hidden h-screen w-64 shrink-0 flex-col border-r border-[var(--color-hairline)] bg-[var(--color-sidebar)] px-4 py-5 sm:flex">
          <DawnWash scale="panel" />
          <NavLink to="/app" end className="px-2">
            <Logo />
          </NavLink>

          <nav className="mt-8 flex flex-1 flex-col gap-1">
            <p className="text-2xs px-3 pb-2 font-semibold tracking-[0.14em] text-[var(--color-text-muted)] uppercase">
              Menu
            </p>
            {navItems.map((item) => (
              <div key={item.to}>
                <SidebarLink {...item} showPremiumLock={!isPremium} />
                {subItemsBySection[item.to] && (
                  <AnimatePresence initial={false}>
                    {currentItem.to === item.to && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-col gap-0.5 py-1 pl-8">
                          {subItemsBySection[item.to].map((subItem) => (
                            <SidebarSubLink
                              key={subItem.to}
                              {...subItem}
                              layoutId={`sub-active-pill-${item.to}`}
                              showPremiumLock={!isPremium}
                            />
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
            <PlanChip isPremium={plan === 'premium'} />
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

        <div className="min-w-0 flex-1 pb-28 sm:pb-0">
          <header className="hidden items-center justify-between border-b border-[var(--color-hairline)] px-8 py-5 sm:flex">
            <div>
              <p className="text-2xs font-medium tracking-[0.12em] text-[var(--color-text-muted)] uppercase">
                Alvorada{activeSubItems ? ` · ${currentItem.label}` : ''}
              </p>
              <h2 className="font-heading mt-0.5 text-lg font-bold text-[var(--color-text)]">
                {headerTitle}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <ReminderBell />
              <NavLink
                to="/app/perfil"
                className="flex items-center gap-3 rounded-xl px-2 py-1 transition-colors hover:bg-[var(--color-bg)]"
              >
                <span className="text-sm text-[var(--color-text-muted)]">
                  {displayName}
                </span>
                <UserAvatar name={displayName} />
              </NavLink>
            </div>
          </header>

          <header className="flex items-center justify-between border-b border-[var(--color-hairline)] px-4 py-3 sm:hidden">
            <Logo size={30} />
            <div className="flex items-center gap-2">
              <ReminderBell />
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

        <AnimatePresence>
          {moreMenuOpen && (
            <>
              <motion.div
                role="presentation"
                onClick={() => setMoreMenuOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-20 bg-black/20 sm:hidden"
              />
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.18, ease: EASE_SMOOTH }}
                className="fixed inset-x-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-30 rounded-3xl border border-[var(--color-hairline)] bg-[var(--color-surface)]/95 p-2 [box-shadow:var(--shadow-card-lg)] backdrop-blur-xl sm:hidden"
              >
                {moreMenuItems.map(({ to, label, icon: Icon, premium }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMoreMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                        interactiveStates,
                        isActive
                          ? 'text-primary-600 bg-primary-500/10'
                          : 'text-[var(--color-text)] hover:bg-[var(--color-bg)]',
                      )
                    }
                  >
                    <Icon size={18} />
                    <span className="flex-1">{label}</span>
                    {premium && !isPremium && (
                      <Crown size={13} className="text-primary-600" />
                    )}
                  </NavLink>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/*
          Ilha flutuante em vez da barra colada de ponta a ponta. `pb-[env(...)]`
          respeita a home indicator do iPhone; o blur só existe aqui, num
          elemento fixo e pequeno, nunca sobre conteúdo em rolagem.
        */}
        <div className="fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:hidden">
          <nav className="flex w-full max-w-sm items-center gap-1 rounded-full border border-[var(--color-hairline)] bg-[var(--color-surface)]/85 p-1.5 [box-shadow:var(--shadow-card-lg),var(--surface-highlight)] backdrop-blur-xl">
            {mobileFixedItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMoreMenuOpen(false)}
                className="relative flex-1"
              >
                {({ isActive }) => (
                  <span
                    className={cn(
                      'text-2xs relative flex flex-col items-center gap-0.5 rounded-full px-2 py-2 font-medium transition-colors',
                      isActive
                        ? 'text-primary-600'
                        : 'text-[var(--color-text-muted)]',
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="mobile-nav-pill"
                        className="bg-primary-500/10 absolute inset-0 rounded-full"
                        transition={SPRING_SNAPPY}
                      />
                    )}
                    <Icon size={19} className="relative z-10" />
                    <span className="relative z-10">{label}</span>
                  </span>
                )}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={() => setMoreMenuOpen((open) => !open)}
              aria-haspopup="true"
              aria-expanded={moreMenuOpen}
              className={cn(
                'text-2xs relative flex flex-1 flex-col items-center gap-0.5 rounded-full px-2 py-2 font-medium',
                interactiveStates,
                isInMoreSection || moreMenuOpen
                  ? 'text-primary-600'
                  : 'text-[var(--color-text-muted)]',
              )}
            >
              <MoreHorizontal size={19} />
              Mais
            </button>
          </nav>
        </div>
      </div>
    </div>
  )
}
