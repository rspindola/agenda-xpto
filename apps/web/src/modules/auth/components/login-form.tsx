import { useForm } from '@tanstack/react-form'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { AuthFormCard } from './auth-form-card'
import { Input } from '#/components/ui/input'
import { PasswordField } from '#/components/ui/password-field'
import { Button } from '#/components/ui/button'
import { useSignIn } from '../hooks/use-sign-in'
import { signInSchema } from '../schemas/auth.schema'

export function LoginForm() {
  const signInMutation = useSignIn()
  const [genericError, setGenericError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setGenericError(null)
      try {
        await signInMutation.mutateAsync(value)
      } catch (error) {
        setGenericError('E-mail ou senha inválidos.')
      }
    },
  })

  return (
    <AuthFormCard
      title="Entrar"
      subtitle="Insira suas credenciais para acessar sua conta"
      footer={
        <div className="flex flex-col gap-2 w-full text-center text-sm text-zinc-400">
          <Link
            to="/forgot-password"
            className="hover:underline text-indigo-400 font-medium"
          >
            Esqueceu sua senha?
          </Link>
          <div>
            Não tem uma conta?{' '}
            <Link to="/signup" className="hover:underline text-indigo-400 font-medium">
              Cadastre-se
            </Link>
          </div>
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
        {genericError && (
          <div className="p-3 bg-destructive/15 border border-destructive/25 text-destructive rounded-lg text-sm font-medium">
            {genericError}
          </div>
        )}

        <form.Field
          name="email"
          validators={{
            onChange: ({ value }) => {
              const res = signInSchema.shape.email.safeParse(value)
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
                className={`bg-zinc-900/50 text-zinc-100 ${field.state.meta.errors.length ? 'border-destructive focus-visible:ring-destructive' : 'border-zinc-800'}`}
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
              const res = signInSchema.shape.password.safeParse(value)
              return res.success ? undefined : res.error.issues[0].message
            },
          }}
          children={(field) => (
            <PasswordField
              id={field.name}
              label="Senha"
              placeholder="Digite sua senha..."
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
          disabled={signInMutation.isPending}
          className="w-full h-10 mt-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-zinc-50 font-semibold shadow-lg shadow-violet-600/25"
        >
          {signInMutation.isPending ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
    </AuthFormCard>
  )
}
