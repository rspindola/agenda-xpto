import type { HTMLAttributes } from 'react'
import { cn } from '#/lib/utils'

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  ref?: React.Ref<HTMLDivElement>
}

export const Card = ({ className, ref, ...props }: CardProps) => {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border bg-card text-card-foreground shadow-sm',
        className,
      )}
      {...props}
    />
  )
}

export const CardHeader = ({
  className,
  ref,
  ...props
}: HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
)

export const CardTitle = ({
  className,
  ref,
  ...props
}: HTMLAttributes<HTMLHeadingElement> & {
  ref?: React.Ref<HTMLHeadingElement>
}) => (
  <h3
    ref={ref}
    className={cn('font-semibold leading-none tracking-tight', className)}
    {...props}
  />
)

export const CardDescription = ({
  className,
  ref,
  ...props
}: HTMLAttributes<HTMLParagraphElement> & {
  ref?: React.Ref<HTMLParagraphElement>
}) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
)

export const CardContent = ({
  className,
  ref,
  ...props
}: HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
)

export const CardFooter = ({
  className,
  ref,
  ...props
}: HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
)
