import { useForm } from '@tanstack/react-form'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { OnboardingShell } from './onboarding-shell'
import { Input } from '#/components/ui/input'
import { professionalStepSchema } from '../schemas/onboarding.schema'
import { useCreateProfessional } from '../hooks/use-create-professional'
import { establishmentsQueryOptions } from '#/modules/auth/queries/session-queries'

export type ProfessionalStepFormProps = {
  onSuccess: () => void
  onSkip: () => void
}

export function ProfessionalStepForm({ onSuccess, onSkip }: ProfessionalStepFormProps) {
  const { data: establishments } = useQuery(establishmentsQueryOptions)
  const createMutation = useCreateProfessional()
  const [genericError, setGenericError] = useState<string | null>(null)

  const establishmentId = establishments?.[0]?.id || ''

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
    },
    onSubmit: async ({ value }) => {
      if (!establishmentId) {
        setGenericError('Nenhum estabelecimento encontrado para associar o profissional.')
        return
      }

      setGenericError(null)
      try {
        await createMutation.mutateAsync({
          establishmentId,
          body: {
            name: value.name,
            email: value.email || undefined,
            phone: value.phone || undefined,
          },
        })
        onSuccess()
      } catch (error: any) {
        setGenericError(error.response?.data?.message || 'Não foi possível cadastrar o profissional. Tente novamente.')
      }
    },
  })

  return (
    <OnboardingShell
      currentStep={2}
      title="Quem é você ou sua equipe?"
      subtitle="Cadastre o primeiro profissional (pode ser você mesmo!). Clientes escolherão com quem agendar."
      onNext={() => form.handleSubmit()}
      onSkip={onSkip}
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
              const res = professionalStepSchema.shape.name.safeParse(value)
              return res.success ? undefined : res.error.issues[0].message
            },
          }}
          children={(field) => (
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor={field.name} className="text-sm font-semibold text-zinc-300">
                Nome do Profissional
              </label>
              <Input
                id={field.name}
                type="text"
                placeholder="Ex: Calebe Silva, Robson..."
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
              if (!value) return undefined
              const res = professionalStepSchema.shape.email.safeParse(value)
              return res.success ? undefined : res.error.issues[0].message
            },
          }}
          children={(field) => (
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor={field.name} className="text-sm font-semibold text-zinc-300">
                E-mail (Opcional)
              </label>
              <Input
                id={field.name}
                type="email"
                placeholder="email@profissional.com"
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
          name="phone"
          children={(field) => (
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor={field.name} className="text-sm font-semibold text-zinc-300">
                Telefone (Opcional)
              </label>
              <Input
                id={field.name}
                type="text"
                placeholder="(11) 99999-9999"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="border-zinc-800 bg-zinc-950/40 text-zinc-100"
              />
            </div>
          )}
        />
      </form>
    </OnboardingShell>
  )
}
