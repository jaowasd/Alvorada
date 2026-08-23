import type { ButtonHTMLAttributes } from 'react'
import { buttonVariants, type ButtonVariant } from '@/lib/button-variants'
import { cn } from '@/lib/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

export function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonProps) {
  return (
    <button className={cn(buttonVariants(variant), className)} {...props} />
  )
}
