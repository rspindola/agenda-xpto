import { useForm } from '@tanstack/react-form'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { AuthFormCard } from './auth-form-card'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { useForgotPassword } from '../hooks/use-forgot-password'
import { forgotPasswordSchema } from '../schemas/auth.schema'

export function ForgotPasswordForm() {
  const forgotPasswordMutation = useForgotPassword()
  const [submitted, setSubmitted] = useState(false)

  const form = useForm({
    defaultValues: {
      email: '',
    },
    onSubmit: async ({ value }) => {
      try {
        await forgotPasswordMutation.mutateAsync(value.email)
      } catch (error) {
        // Suppress errors to ensure a completely neutral success copy (security standard)
      } finally {
        setSubmitted(true)
      }
    },
  })

  if (submitted) {
    return (
      <AuthFormCard
        title="Verifique seu e-mail"
        subtitle="Instruções de redefinição de senha foram enviadas"
        footer={
          <div className="text-center text-sm text-zinc-400">
            <Link to="/login" className="hover:underline text-indigo-400 font-medium">
              Voltar para o Login
            </Link>
          </div>
        }
      >
        <div className="p-4 bg-zinc-900/40 rounded-xl border border-zinc-800/60 text-center select-none text-zinc-300 space-y-2">
          <p className="text-sm">
            Se o endereço de e-mail inserido estiver associado a uma conta, enviamos um link para redefinir sua senha.
          </p>
          <p className="text-xs text-zinc-500">
            Verifique também sua caixa de spam se não receber em instantes.
          </p>
        </div>
      </AuthFormCard>
    )
  }

  return (
    <AuthFormCard
      title="Esqueci minha senha"
      subtitle="Insira seu endereço de e-mail e enviaremos um link de recuperação"
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
        <form.Field
          name="email"
          validators={{
            onChange: ({ value }) => {
              const res = forgotPasswordSchema.shape.email.safeParse(value)
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

        <Button
          type="submit"
          disabled={forgotPasswordMutation.isPending}
          className="w-full h-10 mt-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-zinc-50 font-semibold shadow-lg shadow-violet-600/25"
        >
          {forgotPasswordMutation.isPending ? 'Enviando...' : 'Recuperar senha'}
        </Button>
      </form>
    </AuthFormCard>
  )
}
