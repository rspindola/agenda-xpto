import type { InputHTMLAttributes, Ref } from 'react'
import { cn } from '#/lib/utils'

export type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  ref?: Ref<HTMLInputElement>
}

export const Checkbox = ({ className, ref, ...props }: CheckboxProps) => {
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
}
