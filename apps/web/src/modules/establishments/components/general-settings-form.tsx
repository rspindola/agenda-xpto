import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Globe, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Card } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { updateEstablishmentSchema } from '../schemas/establishment.schema'
import { useUpdateEstablishment } from '../hooks/use-update-establishment'
import type { EstablishmentPublic } from '../api/establishments-api'

export type GeneralSettingsFormProps = {
  establishment: EstablishmentPublic
}

export function GeneralSettingsForm({ establishment }: GeneralSettingsFormProps) {
  const updateMutation = useUpdateEstablishment()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      name: establishment.name,
      slug: establishment.slug || '',
      email: establishment.email,
      phone: establishment.phone || '',
      address: establishment.address || '',
      timezone: establishment.timezone,
      minAdvanceMinutes: establishment.minAdvanceMinutes,
      operationalEmail: establishment.operationalEmail || '',
      isActive: establishment.isActive,
    },
    onSubmit: async ({ value }) => {
      setSuccessMessage(null)
      setErrorMessage(null)
      try {
        await updateMutation.mutateAsync({
          id: establishment.id,
          body: {
            name: value.name,
            slug: value.slug || undefined,
            email: value.email,
            phone: value.phone || undefined,
            address: value.address || undefined,
            timezone: value.timezone,
            minAdvanceMinutes: Number(value.minAdvanceMinutes),
            operationalEmail: value.operationalEmail || undefined,
            isActive: value.isActive,
          },
        })
        setSuccessMessage('Informações do estabelecimento atualizadas com sucesso!')
      } catch (error: any) {
        setErrorMessage(
          error.response?.data?.message || 'Ocorreu um erro ao salvar as alterações. Tente novamente.'
        )
      }
    },
  })

  return (
    <Card className="border-zinc-800/80 bg-zinc-900/30 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-xl">
      <div className="border-b border-zinc-800/60 pb-5 mb-6">
        <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Informações Gerais</h2>
        <p className="text-sm text-zinc-400 mt-1">
          Atualize as informações públicas e de contato da sua empresa.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="space-y-6"
      >
        {successMessage && (
          <div
            data-testid="general-settings-success"
            className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs font-medium flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div
            data-testid="general-settings-error"
            className="p-3.5 bg-destructive/15 border border-destructive/25 text-destructive rounded-xl text-xs font-medium flex items-center gap-2"
          >
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Name & Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) => {
                const res = updateEstablishmentSchema.shape.name.safeParse(value)
                return res.success ? undefined : res.error.issues[0].message
              },
            }}
            children={(field) => (
              <div className="flex flex-col gap-1.5 w-full">
                <label htmlFor={field.name} className="text-xs font-semibold text-zinc-300">
                  Nome do Estabelecimento *
                </label>
                <Input
                  id={field.name}
                  type="text"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className={
                    field.state.meta.errors.length
                      ? 'border-destructive focus-visible:ring-destructive'
                      : 'border-zinc-800 bg-zinc-950/50 text-zinc-100'
                  }
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-[11px] text-destructive font-medium mt-0.5">
                    {field.state.meta.errors.join(', ')}
                  </p>
                )}
              </div>
            )}
          />

          <form.Field
            name="slug"
            validators={{
              onChange: ({ value }) => {
                if (!value) return undefined
                const res = updateEstablishmentSchema.shape.slug.safeParse(value)
                return res.success ? undefined : res.error.issues[0].message
              },
            }}
            children={(field) => (
              <div className="flex flex-col gap-1.5 w-full">
                <label htmlFor={field.name} className="text-xs font-semibold text-zinc-300">
                  Slug (Link Público)
                </label>
                <Input
                  id={field.name}
                  type="text"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className={
                    field.state.meta.errors.length
                      ? 'border-destructive focus-visible:ring-destructive'
                      : 'border-zinc-800 bg-zinc-950/50 text-zinc-100'
                  }
                />
                {field.state.value && (
                  <div
                    data-testid="slug-preview"
                    className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-1"
                  >
                    <Globe className="h-3.5 w-3.5 text-violet-400" />
                    <span>
                      Preview:{' '}
                      <span className="text-violet-300 font-mono">
                        agenda.xpto.com/{field.state.value}
                      </span>
                    </span>
                  </div>
                )}
                {field.state.meta.errors.length > 0 && (
                  <p className="text-[11px] text-destructive font-medium mt-0.5">
                    {field.state.meta.errors.join(', ')}
                  </p>
                )}
              </div>
            )}
          />
        </div>

        {/* Contact Emails & Phone */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => {
                const res = updateEstablishmentSchema.shape.email.safeParse(value)
                return res.success ? undefined : res.error.issues[0].message
              },
            }}
            children={(field) => (
              <div className="flex flex-col gap-1.5 w-full">
                <label htmlFor={field.name} className="text-xs font-semibold text-zinc-300">
                  E-mail Comercial *
                </label>
                <Input
                  id={field.name}
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className={
                    field.state.meta.errors.length
                      ? 'border-destructive focus-visible:ring-destructive'
                      : 'border-zinc-800 bg-zinc-950/50 text-zinc-100'
                  }
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-[11px] text-destructive font-medium mt-0.5">
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
                <label htmlFor={field.name} className="text-xs font-semibold text-zinc-400">
                  Telefone de Contato
                </label>
                <Input
                  id={field.name}
                  type="text"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="border-zinc-800 bg-zinc-950/50 text-zinc-100"
                />
              </div>
            )}
          />

          <form.Field
            name="operationalEmail"
            validators={{
              onChange: ({ value }) => {
                if (!value) return undefined
                const res = updateEstablishmentSchema.shape.operationalEmail.safeParse(value)
                return res.success ? undefined : res.error.issues[0].message
              },
            }}
            children={(field) => (
              <div className="flex flex-col gap-1.5 w-full">
                <label htmlFor={field.name} className="text-xs font-semibold text-zinc-400">
                  E-mail Operacional (Avisos)
                </label>
                <Input
                  id={field.name}
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className={
                    field.state.meta.errors.length
                      ? 'border-destructive focus-visible:ring-destructive'
                      : 'border-zinc-800 bg-zinc-950/50 text-zinc-100'
                  }
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-[11px] text-destructive font-medium mt-0.5">
                    {field.state.meta.errors.join(', ')}
                  </p>
                )}
              </div>
            )}
          />
        </div>

        {/* Address */}
        <form.Field
          name="address"
          children={(field) => (
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor={field.name} className="text-xs font-semibold text-zinc-400">
                Endereço Físico
              </label>
              <Input
                id={field.name}
                type="text"
                placeholder="Rua, Número, Bairro, Cidade - UF"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="border-zinc-800 bg-zinc-950/50 text-zinc-100"
              />
            </div>
          )}
        />

        {/* Timezone & Advance Minutes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <form.Field
            name="timezone"
            children={(field) => (
              <div className="flex flex-col gap-1.5 w-full">
                <label htmlFor={field.name} className="text-xs font-semibold text-zinc-300">
                  Fuso Horário
                </label>
                <select
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-zinc-800 bg-zinc-950/50 text-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 cursor-pointer"
                >
                  <option value="America/Sao_Paulo">Horário de Brasília (America/Sao_Paulo)</option>
                  <option value="America/Bahia">Salvador (America/Bahia)</option>
                  <option value="America/Manaus">Manaus (America/Manaus)</option>
                  <option value="America/Recife">Recife (America/Recife)</option>
                  <option value="America/Fortaleza">Fortaleza (America/Fortaleza)</option>
                  <option value="America/Denver">Denver (America/Denver)</option>
                </select>
              </div>
            )}
          />

          <form.Field
            name="minAdvanceMinutes"
            children={(field) => (
              <div className="flex flex-col gap-1.5 w-full">
                <label htmlFor={field.name} className="text-xs font-semibold text-zinc-300">
                  Antecedência Mínima para Agendamento
                </label>
                <select
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-lg border border-zinc-800 bg-zinc-950/50 text-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 cursor-pointer"
                >
                  <option value={0}>Sem antecedência (imediato)</option>
                  <option value={15}>15 minutos antes</option>
                  <option value={30}>30 minutos antes</option>
                  <option value={60}>1 hora antes</option>
                  <option value={120}>2 horas antes</option>
                  <option value={1440}>24 horas antes (1 dia)</option>
                </select>
              </div>
            )}
          />
        </div>

        {/* Active Toggle & Warning */}
        <div className="pt-2 border-t border-zinc-800/60">
          <form.Field
            name="isActive"
            children={(field) => (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <input
                    id={field.name}
                    type="checkbox"
                    checked={field.state.value}
                    onChange={(e) => field.handleChange(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-800 bg-zinc-950 text-violet-600 focus:ring-violet-500 cursor-pointer"
                  />
                  <label htmlFor={field.name} className="text-xs font-semibold text-zinc-200 cursor-pointer">
                    Estabelecimento Ativo (recebendo agendamentos online)
                  </label>
                </div>
                {!field.state.value && (
                  <div
                    data-testid="inactive-warning"
                    className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2"
                  >
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                    <span>Desativar o estabelecimento oculta a página pública de agendamentos.</span>
                  </div>
                )}
              </div>
            )}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t border-zinc-800/60">
          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="text-xs h-10 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-zinc-50 font-semibold shadow-md shadow-violet-600/20"
          >
            {updateMutation.isPending ? 'Salvando alterações...' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
