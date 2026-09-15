import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog } from '#/components/ui/dialog'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Checkbox } from '#/components/ui/checkbox'
import type { Service, ProfessionalServiceLink } from '../types'

const serviceSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  durationMinutes: z.coerce.number().min(1, 'Duração deve ser maior que 0'),
  priceCents: z.coerce.number().min(0, 'Preço inválido'),
  catalogCombo: z.boolean(),
  professionals: z.array(z.object({
    professionalId: z.string(),
    priceOverrideCents: z.number().nullable()
  }))
})

type ServiceFormData = z.infer<typeof serviceSchema>

export type ServiceFormModalProps = {
  establishmentId: string
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ServiceFormData) => void
  initialData?: Service | null
}

export function ServiceFormModal({ establishmentId, isOpen, onClose, onSubmit, initialData }: ServiceFormModalProps) {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      description: '',
      durationMinutes: 30,
      priceCents: 0,
      catalogCombo: false,
      professionals: []
    }
  })

  useEffect(() => {
    if (isOpen && initialData) {
      reset({
        name: initialData.name,
        description: initialData.description || '',
        durationMinutes: initialData.durationMinutes,
        priceCents: initialData.priceCents / 100, // Handle UI in Reais
        catalogCombo: initialData.catalogCombo,
        professionals: initialData.professionals || []
      })
    } else if (isOpen) {
      reset({
        name: '',
        description: '',
        durationMinutes: 30,
        priceCents: 0,
        catalogCombo: false,
        professionals: []
      })
    }
  }, [isOpen, initialData, reset])

  const onFormSubmit = (data: ServiceFormData) => {
    onSubmit({
      ...data,
      priceCents: Math.round(data.priceCents * 100) // Convert back to cents
    })
  }

  const catalogCombo = watch('catalogCombo')

  return (
    <Dialog open={isOpen} onOpenChange={onClose} title={initialData ? 'Editar Serviço' : 'Novo Serviço'}>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm font-medium">Nome</label>
            <Input id="name" {...register('name')} placeholder="Ex: Corte de cabelo" />
            {errors.name && <span className="text-xs text-rose-500">{errors.name.message}</span>}
          </div>
          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium">Descrição (opcional)</label>
            <Input id="description" {...register('description')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="durationMinutes" className="text-sm font-medium">Duração (min)</label>
              <Input id="durationMinutes" type="number" {...register('durationMinutes')} />
              {errors.durationMinutes && <span className="text-xs text-rose-500">{errors.durationMinutes.message}</span>}
            </div>
            <div className="grid gap-2">
              <label htmlFor="priceCents" className="text-sm font-medium">Preço (R$)</label>
              <Input id="priceCents" type="number" step="0.01" {...register('priceCents')} />
              {errors.priceCents && <span className="text-xs text-rose-500">{errors.priceCents.message}</span>}
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox 
              id="catalogCombo" 
              checked={catalogCombo}
              onCheckedChange={(checked) => setValue('catalogCombo', checked === true)}
            />
            <label
              htmlFor="catalogCombo"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              É um pacote/combo?
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    </Dialog>
  )
}
