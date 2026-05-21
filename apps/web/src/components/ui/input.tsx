import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '#/lib/utils'

export const inputVariants = cva(
  'w-full rounded-md border border-input bg-background ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
  {
    variants: {
      size: {
        default: 'h-10 px-3 py-2 text-base',
        sm: 'h-9 px-2 text-sm',
        lg: 'h-11 px-4 text-base',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)

export type InputProps = InputHTMLAttributes<HTMLInputElement> &
  VariantProps<typeof inputVariants>

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, size, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn('flex', inputVariants({ size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)

Input.displayName = 'Input'
