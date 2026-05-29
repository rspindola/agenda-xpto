import { useForm } from '@tanstack/react-form'
import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { OnboardingShell } from './onboarding-shell'
import { Input } from '#/components/ui/input'
import { businessStepSchema } from '../schemas/onboarding.schema'
import { useCreateEstablishment } from '../hooks/use-create-establishment'
import { sessionQueryOptions } from '#/modules/auth/queries/session-queries'

export type BusinessStepFormProps = {
  onSuccess: () => void
}

export function BusinessStepForm({ onSuccess }: BusinessStepFormProps) {
  const { data: sessionData } = useQuery(sessionQueryOptions)
  const createMutation = useCreateEstablishment()
  const [genericError, setGenericError] = useState<string | null>(null)

  const ownerEmail = sessionData?.user.email || ''

  const form = useForm({
    defaultValues: {
      name: '',
      email: ownerEmail,
      timezone: 'America/Sao_Paulo',
    },
    onSubmit: async ({ value }) => {
      setGenericError(null)
      try {
        await createMutation.mutateAsync({
          name: value.name,
          email: value.email,
          timezone: value.timezone,
        })
        onSuccess()
      } catch (error: any) {
        setGenericError(error.response?.data?.message || 'Não foi possível cadastrar seu negócio. Tente novamente.')
      }
    },
  })

  // Prefill email when session data loads
  useEffect(() => {
    if (ownerEmail) {
      form.setFieldValue('email', ownerEmail)
    }
  }, [ownerEmail])

  return (
    <OnboardingShell
      currentStep={1}
      title="Cadastre seu Negócio"
      subtitle="Conte-nos um pouco sobre a sua empresa para começarmos a configurar sua agenda."
      onNext={() => form.handleSubmit()}
      isPending={createMutation.isPending}
      nextLabel="Próximo"
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
          name="name"
          validators={{
            onChange: ({ value }) => {
              const res = businessStepSchema.shape.name.safeParse(value)
              return res.success ? undefined : res.error.issues[0].message
            },
          }}
          children={(field) => (
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor={field.name} className="text-sm font-semibold text-zinc-300">
                Nome da Empresa
              </label>
              <Input
                id={field.name}
                type="text"
                placeholder="Ex: Barbearia Vip, Salão de Beleza..."
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className={
                  field.state.meta.errors.length
                    ? 'border-destructive focus-visible:ring-destructive'
                    : 'border-zinc-800 bg-zinc-950/40 text-zinc-100'
                }
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-xs text-destructive font-semibold mt-0.5">
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
              const res = businessStepSchema.shape.email.safeParse(value)
              return res.success ? undefined : res.error.issues[0].message
            },
          }}
          children={(field) => (
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor={field.name} className="text-sm font-semibold text-zinc-300">
                E-mail Comercial
              </label>
              <Input
                id={field.name}
                type="email"
                placeholder="contato@empresa.com"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className={
                  field.state.meta.errors.length
                    ? 'border-destructive focus-visible:ring-destructive'
                    : 'border-zinc-800 bg-zinc-950/40 text-zinc-100'
                }
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-xs text-destructive font-semibold mt-0.5">
                  {field.state.meta.errors.join(', ')}
                </p>
              )}
            </div>
          )}
        />

        <form.Field
          name="timezone"
          validators={{
            onChange: ({ value }) => {
              const res = businessStepSchema.shape.timezone.safeParse(value)
              return res.success ? undefined : res.error.issues[0].message
            },
          }}
          children={(field) => (
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor={field.name} className="text-sm font-semibold text-zinc-300">
                Fuso Horário
              </label>
              <div className="relative">
                <select
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-zinc-800 bg-zinc-950/40 text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 cursor-pointer appearance-none"
                >
                  <option value="America/Sao_Paulo">Horário de Brasília (America/Sao_Paulo)</option>
                  <option value="America/Bahia">Salvador (America/Bahia)</option>
                  <option value="America/Manaus">Manaus (America/Manaus)</option>
                  <option value="America/Recife">Recife (America/Recife)</option>
                  <option value="America/Fortaleza">Fortaleza (America/Fortaleza)</option>
                  <option value="America/Denver">Denver (America/Denver)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
              {field.state.meta.errors.length > 0 && (
                <p className="text-xs text-destructive font-semibold mt-0.5">
                  {field.state.meta.errors.join(', ')}
                </p>
              )}
            </div>
          )}
        />
      </form>
    </OnboardingShell>
  )
}
