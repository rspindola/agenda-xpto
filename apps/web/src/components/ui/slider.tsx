import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '#/lib/utils'

export const sliderVariants = cva(
  'h-2 w-full cursor-pointer appearance-none rounded-lg bg-secondary accent-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
)

export type SliderProps = InputHTMLAttributes<HTMLInputElement> &
  VariantProps<typeof sliderVariants>

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="range"
        className={cn(sliderVariants({ className }))}
        {...props}
      />
    )
  },
)

Slider.displayName = 'Slider'
