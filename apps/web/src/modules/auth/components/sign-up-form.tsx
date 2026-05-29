import { useForm } from '@tanstack/react-form'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { AuthFormCard } from './auth-form-card'
import { Input } from '#/components/ui/input'
import { PasswordField } from '#/components/ui/password-field'
import { Button } from '#/components/ui/button'
import { useSignUp } from '../hooks/use-sign-up'
import { signUpSchema } from '../schemas/auth.schema'
import { mapSignUpError } from '../lib/map-auth-error'
import type { BetterAuthErrorBody } from '../types/auth-types'

export function SignUpForm() {
  const signUpMutation = useSignUp()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null)
      try {
        await signUpMutation.mutateAsync(value)
      } catch (error: any) {
        // Map the backend error response to user-friendly message
        const responseData = error?.response?.data as BetterAuthErrorBody | undefined
        setErrorMessage(mapSignUpError(responseData || { message: error.message }))
      }
    },
  })

  return (
    <AuthFormCard
      title="Criar conta"
      subtitle="Cadastre-se para gerenciar seus agendamentos de forma premium"
      footer={
        <div className="text-center text-sm text-zinc-400">
          Já tem uma conta?{' '}
          <Link to="/login" className="hover:underline text-indigo-400 font-medium">
            Entrar
          </Link>
        </div>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="space-y-4"
      >
        {errorMessage && (
          <div className="p-3 bg-destructive/15 border border-destructive/25 text-destructive rounded-lg text-sm font-medium">
            {errorMessage}
          </div>
        )}

        <form.Field
          name="name"
          validators={{
            onChange: ({ value }) => {
              const res = signUpSchema.shape.name.safeParse(value)
              return res.success ? undefined : res.error.issues[0].message
            },
          }}
          children={(field) => (
            <div className="flex flex-col gap-1.5 w-full">
              <label
                htmlFor={field.name}
                className="text-sm font-medium text-zinc-300"
              >
                Nome completo
              </label>
              <Input
                id={field.name}
                type="text"
                placeholder="Ex: Calebe Silva"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className={field.state.meta.errors.length ? 'border-destructive focus-visible:ring-destructive' : 'border-zinc-800 bg-zinc-900/50 text-zinc-100'}
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-xs text-destructive font-medium mt-0.5">
                  {field.state.meta.errors.join(', ')}
                </p>
              )}
            </div>
          )}
        />

        <form.Field
          name="email"
          validators={{
            onChange: ({ value }) => {
              const res = signUpSchema.shape.email.safeParse(value)
              return res.success ? undefined : res.error.issues[0].message
            },
          }}
          children={(field) => (
            <div className="flex flex-col gap-1.5 w-full">
              <label
                htmlFor={field.name}
                className="text-sm font-medium text-zinc-300"
              >
                E-mail
              </label>
              <Input
                id={field.name}
                type="email"
                placeholder="exemplo@gmail.com"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className={field.state.meta.errors.length ? 'border-destructive focus-visible:ring-destructive' : 'border-zinc-800 bg-zinc-900/50 text-zinc-100'}
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-xs text-destructive font-medium mt-0.5">
                  {field.state.meta.errors.join(', ')}
                </p>
              )}
            </div>
          )}
        />

        <form.Field
          name="password"
          validators={{
            onChange: ({ value }) => {
              const res = signUpSchema.shape.password.safeParse(value)
              return res.success ? undefined : res.error.issues[0].message
            },
          }}
          children={(field) => (
            <PasswordField
              id={field.name}
              label="Senha"
              placeholder="Crie uma senha forte..."
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={field.state.meta.errors.length ? field.state.meta.errors.join(', ') : undefined}
              className="border-zinc-800 bg-zinc-900/50 text-zinc-100"
            />
          )}
        />

        <form.Field
          name="confirmPassword"
          validators={{
            onChange: ({ value }) => {
              const res = signUpSchema.shape.confirmPassword.safeParse(value)
              return res.success ? undefined : res.error.issues[0].message
            },
          }}
          children={(field) => (
            <PasswordField
              id={field.name}
              label="Confirmar senha"
              placeholder="Confirme sua senha..."
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={field.state.meta.errors.length ? field.state.meta.errors.join(', ') : undefined}
              className="border-zinc-800 bg-zinc-900/50 text-zinc-100"
            />
          )}
        />

        <Button
          type="submit"
          disabled={signUpMutation.isPending}
          className="w-full h-10 mt-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-zinc-50 font-semibold shadow-lg shadow-violet-600/25"
        >
          {signUpMutation.isPending ? 'Cadastrando...' : 'Cadastrar'}
        </Button>
      </form>
    </AuthFormCard>
  )
}
