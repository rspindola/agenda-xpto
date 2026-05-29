import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { AuthFormCard } from './auth-form-card'
import { Button } from '#/components/ui/button'
import { useResendVerification } from '../hooks/use-resend-verification'

export type VerifyEmailPanelProps = {
  email: string
}

export function VerifyEmailPanel({ email }: VerifyEmailPanelProps) {
  const { resendAsync, isPending, cooldown } = useResendVerification()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleResend = async () => {
    setSuccessMessage(null)
    setErrorMessage(null)
    try {
      await resendAsync(email)
      setSuccessMessage('E-mail de confirmação reenviado com sucesso!')
    } catch (error: any) {
      setErrorMessage(error.message || 'Não foi possível reenviar. Tente mais tarde.')
    }
  }

  return (
    <AuthFormCard
      title="Confirme seu e-mail"
      subtitle="Enviamos um link de confirmação para o seu endereço de e-mail"
      footer={
        <div className="text-center text-sm text-zinc-400">
          Quer usar outra conta?{' '}
          <Link to="/login" className="hover:underline text-indigo-400 font-medium">
            Voltar para o Login
          </Link>
        </div>
      }
    >
      <div className="space-y-4 text-center select-none">
        <div className="p-4 bg-zinc-900/40 rounded-xl border border-zinc-800/60 flex flex-col gap-2">
          <p className="text-sm text-zinc-400">
            Por favor, clique no link de validação enviado para o endereço abaixo:
          </p>
          <span className="text-base font-semibold text-zinc-200 tracking-wide break-all">
            {email}
          </span>
        </div>

        {successMessage && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 rounded-lg text-sm font-medium">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-destructive/15 border border-destructive/25 text-destructive rounded-lg text-sm font-medium">
            {errorMessage}
          </div>
        )}

        <Button
          type="button"
          onClick={handleResend}
          disabled={isPending || cooldown > 0}
          className="w-full h-10 mt-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-zinc-50 font-semibold shadow-lg shadow-violet-600/25 disabled:opacity-50"
        >
          {isPending
            ? 'Enviando...'
            : cooldown > 0
              ? `Reenviar em ${cooldown}s`
              : 'Reenviar e-mail de confirmação'}
        </Button>
      </div>
    </AuthFormCard>
  )
}
