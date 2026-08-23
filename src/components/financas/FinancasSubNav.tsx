import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/cn'

const links = [
  { to: '/app/financas', label: 'Visão geral', end: true },
  { to: '/app/financas/transacoes', label: 'Transações', end: false },
  { to: '/app/financas/contas', label: 'Contas', end: false },
  { to: '/app/financas/contas-da-casa', label: 'Contas da casa', end: false },
]

/** Navegação secundária entre as páginas de Finanças, visível só no mobile (no desktop a sidebar já expande). */
export function FinancasSubNav() {
  return (
    <nav className="sticky top-0 z-10 flex gap-1 overflow-x-auto border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 sm:hidden">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) =>
            cn(
              'shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors',
              isActive
                ? 'bg-primary-500/10 text-primary-600'
                : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]',
            )
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  )
}
