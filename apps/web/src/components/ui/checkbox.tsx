import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cn } from '#/lib/utils'

export type CheckboxProps = InputHTMLAttributes<HTMLInputElement>

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="checkbox"
        className={cn(
          'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 accent-primary',
          className,
        )}
        {...props}
      />
    )
  },
)

Checkbox.displayName = 'Checkbox'
