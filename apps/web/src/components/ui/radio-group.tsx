import { forwardRef } from 'react'
import type { HTMLAttributes, InputHTMLAttributes } from 'react'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '#/lib/utils'

export const radioGroupVariants = cva('grid gap-2')

export const radioGroupItemVariants = cva(
  'aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
)

export type RadioGroupProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof radioGroupVariants>

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(radioGroupVariants({ className }))}
        role="radiogroup"
        {...props}
      >
        {children}
      </div>
    )
  },
)

RadioGroup.displayName = 'RadioGroup'

export type RadioGroupItemProps = InputHTMLAttributes<HTMLInputElement> &
  VariantProps<typeof radioGroupItemVariants>

export const RadioGroupItem = forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="radio"
        className={cn(radioGroupItemVariants({ className }))}
        {...props}
      />
    )
  },
)

RadioGroupItem.displayName = 'RadioGroupItem'
