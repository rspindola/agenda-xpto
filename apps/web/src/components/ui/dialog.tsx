'use client'

import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import { cn } from '#/lib/utils'
import { X } from 'lucide-react'

export type DialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  children: ReactNode
  className?: string
}

export const Dialog = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: DialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      if (!dialog.open) {
        dialog.showModal()
      }
    } else {
      if (dialog.open) {
        dialog.close()
      }
    }
  }, [open])

  const handleClose = () => {
    onOpenChange(false)
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      handleClose()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        'fixed inset-0 m-auto hidden h-fit w-full max-w-lg gap-4 rounded-lg border bg-background p-6 shadow-lg open:grid backdrop:bg-black/80 backdrop:backdrop-blur-sm',
        className,
      )}
      onClose={handleClose}
      onClick={handleBackdropClick}
    >
      <div className="flex flex-col space-y-1.5 text-center sm:text-left">
        <div className="flex items-center justify-between">
          {title && (
            <h2 className="text-lg font-semibold leading-none tracking-tight">
              {title}
            </h2>
          )}
          <button
            onClick={handleClose}
            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="relative">{children}</div>
    </dialog>
  )
}
