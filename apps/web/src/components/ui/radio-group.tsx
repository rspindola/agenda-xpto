import type { HTMLAttributes, InputHTMLAttributes, Ref } from 'react'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '#/lib/utils'

export const radioGroupVariants = cva('grid', {
  variants: {
    size: {
      default: 'gap-2',
      sm: 'gap-1.5',
      lg: 'gap-3',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

export const radioGroupItemVariants = cva(
  'aspect-square rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      scale: {
        default: 'h-4 w-4',
        sm: 'h-3.5 w-3.5',
        lg: 'h-5 w-5',
      },
    },
    defaultVariants: {
      scale: 'default',
    },
  },
)

export type RadioGroupProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof radioGroupVariants> & { ref?: Ref<HTMLDivElement> }

export const RadioGroup = ({
  className,
  children,
  size,
  ref,
  ...props
}: RadioGroupProps) => {
  return (
    <div
      ref={ref}
      className={cn(radioGroupVariants({ size, className }))}
      role="radiogroup"
      {...props}
    >
      {children}
    </div>
  )
}

export type RadioGroupItemProps = InputHTMLAttributes<HTMLInputElement> &
  VariantProps<typeof radioGroupItemVariants> & { ref?: Ref<HTMLInputElement> }

export const RadioGroupItem = ({
  className,
  scale,
  ref,
  ...props
}: RadioGroupItemProps) => {
  return (
    <input
      ref={ref}
      type="radio"
      className={cn(radioGroupItemVariants({ scale, className }))}
      {...props}
    />
  )
}
