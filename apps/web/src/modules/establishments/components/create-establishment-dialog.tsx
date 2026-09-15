import { useState, useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { useQuery } from '@tanstack/react-query'
import { Dialog } from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { createEstablishmentSchema } from '../schemas/establishment.schema'
import { useCreateEstablishment } from '../hooks/use-create-establishment'
import { sessionQueryOptions } from '#/modules/auth/queries/session-queries'
import type { EstablishmentPublic } from '../api/establishments-api'

export type CreateEstablishmentDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (created: EstablishmentPublic) => void
}

export function CreateEstablishmentDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateEstablishmentDialogProps) {
  const { data: sessionData } = useQuery(sessionQueryOptions)
  const createMutation = useCreateEstablishment()
  const [genericError, setGenericError] = useState<string | null>(null)

  const ownerEmail = sessionData?.user.email || ''

  const form = useForm({
    defaultValues: {
      name: '',
      email: ownerEmail,
      timezone: 'America/Sao_Paulo',
      phone: '',
      address: '',
      slug: '',
      operationalEmail: '',
    },
    onSubmit: async ({ value }) => {
      setGenericError(null)
      try {
        const created = await createMutation.mutateAsync({
          name: value.name,
          email: value.email,
          timezone: value.timezone,
          phone: value.phone || undefined,
          address: value.address || undefined,
          slug: value.slug || undefined,
          operationalEmail: value.operationalEmail || undefined,
        })
        form.reset()
        onOpenChange(false)
        onSuccess?.(created)
      } catch (error: any) {
        setGenericError(
          error.response?.data?.message || 'Não foi possível cadastrar o estabelecimento. Tente novamente.'
        )
      }
    },
  })

  // Prefill email when session data loads or dialog opens
  useEffect(() => {
    if (ownerEmail && open && !form.state.values.email) {
      form.setFieldValue('email', ownerEmail)
    }
  }, [ownerEmail, open])

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setGenericError(null)
          form.reset()
        }
        onOpenChange(isOpen)
      }}
      title="Novo Estabelecimento"
      description="Cadastre uma nova filial ou unidade de atendimento para sua conta."
      className="border-zinc-800 bg-zinc-950 text-zinc-100 max-w-lg"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="space-y-3.5 mt-3"
      >
        {genericError && (
          <div
            data-testid="create-establishment-error"
            className="p-3 bg-destructive/15 border border-destructive/25 text-destructive rounded-lg text-xs font-medium"
          >
            {genericError}
          </div>
        )}

        <form.Field
          name="name"
          validators={{
            onChange: ({ value }) => {
              const res = createEstablishmentSchema.shape.name.safeParse(value)
              return res.success ? undefined : res.error.issues[0].message
            },
          }}
          children={(field) => (
            <div className="flex flex-col gap-1 w-full">
              <label htmlFor={field.name} className="text-xs font-semibold text-zinc-300">
                Nome do Estabelecimento *
              </label>
              <Input
                id={field.name}
                type="text"
                placeholder="Ex: Barbearia Jardins, Salão Unidade 2..."
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className={
                  field.state.meta.errors.length
                    ? 'border-destructive focus-visible:ring-destructive'
                    : 'border-zinc-800 bg-zinc-900/50 text-zinc-100'
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => {
                const res = createEstablishmentSchema.shape.email.safeParse(value)
                return res.success ? undefined : res.error.issues[0].message
              },
            }}
            children={(field) => (
              <div className="flex flex-col gap-1 w-full">
                <label htmlFor={field.name} className="text-xs font-semibold text-zinc-300">
                  E-mail Comercial *
                </label>
                <Input
                  id={field.name}
                  type="email"
                  placeholder="comercial@empresa.com"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className={
                    field.state.meta.errors.length
                      ? 'border-destructive focus-visible:ring-destructive'
                      : 'border-zinc-800 bg-zinc-900/50 text-zinc-100'
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
            name="timezone"
            validators={{
              onChange: ({ value }) => {
                const res = createEstablishmentSchema.shape.timezone.safeParse(value)
                return res.success ? undefined : res.error.issues[0].message
              },
            }}
            children={(field) => (
              <div className="flex flex-col gap-1 w-full">
                <label htmlFor={field.name} className="text-xs font-semibold text-zinc-300">
                  Fuso Horário *
                </label>
                <select
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-zinc-800 bg-zinc-900/50 text-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 cursor-pointer"
                >
                  <option value="America/Sao_Paulo">Brasília (America/Sao_Paulo)</option>
                  <option value="America/Bahia">Salvador (America/Bahia)</option>
                  <option value="America/Manaus">Manaus (America/Manaus)</option>
                  <option value="America/Recife">Recife (America/Recife)</option>
                  <option value="America/Fortaleza">Fortaleza (America/Fortaleza)</option>
                  <option value="America/Denver">Denver (America/Denver)</option>
                </select>
                {field.state.meta.errors.length > 0 && (
                  <p className="text-[11px] text-destructive font-medium mt-0.5">
                    {field.state.meta.errors.join(', ')}
                  </p>
                )}
              </div>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <form.Field
            name="phone"
            children={(field) => (
              <div className="flex flex-col gap-1 w-full">
                <label htmlFor={field.name} className="text-xs font-semibold text-zinc-400">
                  Telefone (opcional)
                </label>
                <Input
                  id={field.name}
                  type="text"
                  placeholder="(11) 99999-9999"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="border-zinc-800 bg-zinc-900/50 text-zinc-100"
                />
              </div>
            )}
          />

          <form.Field
            name="slug"
            validators={{
              onChange: ({ value }) => {
                if (!value) return undefined
                const res = createEstablishmentSchema.shape.slug.safeParse(value)
                return res.success ? undefined : res.error.issues[0].message
              },
            }}
            children={(field) => (
              <div className="flex flex-col gap-1 w-full">
                <label htmlFor={field.name} className="text-xs font-semibold text-zinc-400">
                  Slug do Link (opcional)
                </label>
                <Input
                  id={field.name}
                  type="text"
                  placeholder="minha-unidade-2"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className={
                    field.state.meta.errors.length
                      ? 'border-destructive focus-visible:ring-destructive'
                      : 'border-zinc-800 bg-zinc-900/50 text-zinc-100'
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

        <form.Field
          name="address"
          children={(field) => (
            <div className="flex flex-col gap-1 w-full">
              <label htmlFor={field.name} className="text-xs font-semibold text-zinc-400">
                Endereço Completo (opcional)
              </label>
              <Input
                id={field.name}
                type="text"
                placeholder="Rua Exemplo, 123 - Centro"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="border-zinc-800 bg-zinc-900/50 text-zinc-100"
              />
            </div>
          )}
        />

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-800/80">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={createMutation.isPending}
            className="text-xs h-9 text-zinc-400 hover:text-zinc-200"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="text-xs h-9 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-zinc-50 font-semibold shadow-md shadow-violet-600/20"
          >
            {createMutation.isPending ? 'Criando...' : 'Criar Estabelecimento'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
