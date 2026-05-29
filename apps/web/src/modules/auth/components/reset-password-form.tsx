import { useForm } from '@tanstack/react-form'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { AuthFormCard } from './auth-form-card'
import { PasswordField } from '#/components/ui/password-field'
import { Button } from '#/components/ui/button'
import { useResetPassword } from '../hooks/use-reset-password'
import { resetPasswordSchema } from '../schemas/auth.schema'

export type ResetPasswordFormProps = {
  token?: string | null
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const resetPasswordMutation = useResetPassword()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    onSubmit: async ({ value }) => {
      if (!token) {
        setErrorMessage('Token de recuperação ausente ou inválido.')
        return
      }

      setErrorMessage(null)
      try {
        await resetPasswordMutation.mutateAsync({
          newPassword: value.password,
          token,
        })
      } catch (error: any) {
        setErrorMessage(error?.response?.data?.message || 'Link inválido ou expirado.')
      }
    },
  })

  // Render invalid-link UI if token is missing
  if (!token) {
    return (
      <AuthFormCard
        title="Link inválido ou expirado"
        subtitle="Não encontramos um token de redefinição de senha válido"
        footer={
          <div className="flex flex-col gap-2 w-full text-center text-sm text-zinc-400">
            <Link
              to="/forgot-password"
              className="hover:underline text-indigo-400 font-medium"
            >
              Solicitar nova recuperação
            </Link>
            <div>
              <Link to="/login" className="hover:underline text-indigo-400 font-medium">
                Voltar para o Login
              </Link>
            </div>
          </div>
        }
      >
        <div className="p-4 bg-destructive/10 border border-destructive/25 text-destructive rounded-xl text-center select-none text-sm font-medium">
          O link utilizado para redefinir sua senha está incompleto, expirado ou já foi utilizado anteriormente.
        </div>
      </AuthFormCard>
    )
  }

  return (
    <AuthFormCard
      title="Nova senha"
      subtitle="Defina sua nova senha de acesso premium"
      footer={
        <div className="text-center text-sm text-zinc-400">
          Lembrou da senha?{' '}
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
          name="password"
          validators={{
            onChange: ({ value }) => {
              const res = resetPasswordSchema.shape.password.safeParse(value)
              return res.success ? undefined : res.error.issues[0].message
            },
          }}
          children={(field) => (
            <PasswordField
              id={field.name}
              label="Nova senha"
              placeholder="Digite sua nova senha..."
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
              const res = resetPasswordSchema.shape.confirmPassword.safeParse(value)
              return res.success ? undefined : res.error.issues[0].message
            },
          }}
          children={(field) => (
            <PasswordField
              id={field.name}
              label="Confirmar nova senha"
              placeholder="Confirme sua nova senha..."
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
          disabled={resetPasswordMutation.isPending}
          className="w-full h-10 mt-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-zinc-50 font-semibold shadow-lg shadow-violet-600/25"
        >
          {resetPasswordMutation.isPending ? 'Redefinindo...' : 'Alterar senha'}
        </Button>
      </form>
    </AuthFormCard>
  )
}
