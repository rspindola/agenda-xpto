import type { InputHTMLAttributes } from 'react'
import { cn } from '#/lib/utils'

export type SliderProps = InputHTMLAttributes<HTMLInputElement> & {
  ref?: React.Ref<HTMLInputElement>
}

export const Slider = ({ className, ref, ...props }: SliderProps) => {
  return (
    <input
      type="range"
      className={cn(
        'h-2 w-full cursor-pointer appearance-none rounded-lg bg-secondary accent-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
}
