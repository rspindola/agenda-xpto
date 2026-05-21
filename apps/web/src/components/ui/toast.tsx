'use client'

import type { ReactNode } from 'react'
import { cn } from '#/lib/utils'
import { X } from 'lucide-react'

export type ToastProps = {
  title?: string
  description?: string
  action?: ReactNode
  onClose?: () => void
  variant?: 'default' | 'destructive'
  className?: string
}

export const Toast = ({
  title,
  description,
  action,
  onClose,
  variant = 'default',
  className,
}: ToastProps) => {
  return (
    <div
      className={cn(
        'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all',
        variant === 'default' && 'bg-background text-foreground',
        variant === 'destructive' &&
          'destructive group border-destructive bg-destructive text-destructive-foreground',
        className,
      )}
    >
      <div className="grid gap-1">
        {title && <div className="text-sm font-semibold">{title}</div>}
        {description && <div className="text-sm opacity-90">{description}</div>}
      </div>
      {action}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  )
}
