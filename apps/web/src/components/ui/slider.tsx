import type { InputHTMLAttributes, Ref } from 'react'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '#/lib/utils'

export const sliderVariants = cva(
  'w-full cursor-pointer appearance-none rounded-lg bg-secondary accent-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      scale: {
        default: 'h-2',
        sm: 'h-1.5',
        lg: 'h-3',
      },
    },
    defaultVariants: {
      scale: 'default',
    },
  },
)

export type SliderProps = InputHTMLAttributes<HTMLInputElement> &
  VariantProps<typeof sliderVariants> & { ref?: Ref<HTMLInputElement> }

export const Slider = ({ className, scale, ref, ...props }: SliderProps) => {
  return (
    <input
      ref={ref}
      type="range"
      className={cn(sliderVariants({ scale, className }))}
      {...props}
    />
  )
}
