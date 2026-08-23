import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, id, className, children, ...props }, ref) => {
    const selectId = id ?? props.name
    const errorId = error ? `${selectId}-error` : undefined

    return (
      <div className="flex flex-col gap-1.5 text-left">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-[var(--color-text)]"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'focus:border-primary-500 focus:ring-primary-500/30 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] transition outline-none focus:ring-2',
            error &&
              'border-error-500 focus:border-error-500 focus:ring-error-500/30',
            className,
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p id={errorId} className="text-error-500 text-xs">
            {error}
          </p>
        )}
      </div>
    )
  },
)

Select.displayName = 'Select'
