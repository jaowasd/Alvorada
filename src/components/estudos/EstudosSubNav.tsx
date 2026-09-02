import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { STUDY_SUB_ITEMS } from '@/lib/studyNav'

/** Navegação secundária de Estudos, só no mobile (no desktop a sidebar expande). */
export function EstudosSubNav() {
  return (
    <nav className="sticky top-0 z-10 flex gap-1 overflow-x-auto border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 sm:hidden">
      {STUDY_SUB_ITEMS.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) =>
            cn(
              'flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors',
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
