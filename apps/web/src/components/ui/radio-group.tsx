import type { InputHTMLAttributes } from 'react'
import { cn } from '#/lib/utils'

export type RadioGroupProps = {
  className?: string
  children: React.ReactNode
}

export const RadioGroup = ({ className, children }: RadioGroupProps) => {
  return (
    <div className={cn('grid gap-2', className)} role="radiogroup">
      {children}
    </div>
  )
}

export type RadioGroupItemProps = InputHTMLAttributes<HTMLInputElement> & {
  ref?: React.Ref<HTMLInputElement>
}

export const RadioGroupItem = ({
  className,
  ref,
  ...props
}: RadioGroupItemProps) => {
  return (
    <input
      type="radio"
      className={cn(
        'aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
}
