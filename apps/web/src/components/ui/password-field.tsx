import { useState } from 'react'
import type { Ref } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from './input'
import type { InputProps } from './input'
import { cn } from '#/lib/utils'

export type PasswordFieldProps = InputProps & {
  label?: string
  error?: string
  ref?: Ref<HTMLInputElement>
}

export const PasswordField = ({ label, error, className, id, ref, ...props }: PasswordFieldProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const inputId = id || 'password-field-input'

  const toggleVisibility = () => {
    setShowPassword((prev) => !prev)
  }

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-foreground select-none"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center w-full">
        <Input
          id={inputId}
          type={showPassword ? 'text' : 'password'}
          className={cn('pr-10', error && 'border-destructive focus-visible:ring-destructive', className)}
          ref={ref}
          {...props}
        />

        <button
          type="button"
          onClick={toggleVisibility}
          className="absolute right-3 flex items-center justify-center p-0.5 rounded-sm hover:bg-muted text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 select-none"
          aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {error && (
        <p className="text-xs text-destructive font-medium mt-0.5" id={`${inputId}-error`}>
          {error}
        </p>
      )}
    </div>
  )
}
