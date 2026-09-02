import type { ButtonHTMLAttributes } from 'react'
import {
  buttonVariants,
  type ButtonSize,
  type ButtonVariant,
} from '@/lib/button-variants'
import { cn } from '@/lib/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  pill?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  pill = false,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants(variant, size, pill), className)}
      {...props}
    />
  )
}
