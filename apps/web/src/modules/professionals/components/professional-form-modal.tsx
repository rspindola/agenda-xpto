import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog } from '#/components/ui/dialog'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import type { Professional } from '../types'

const professionalSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  services: z.array(z.object({
    serviceId: z.string(),
    priceOverrideCents: z.number().nullable()
  }))
})

type ProfessionalFormData = z.infer<typeof professionalSchema>

export type ProfessionalFormModalProps = {
  establishmentId: string
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ProfessionalFormData) => void
  initialData?: Professional | null
}

export function ProfessionalFormModal({ establishmentId, isOpen, onClose, onSubmit, initialData }: ProfessionalFormModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfessionalFormData>({
    resolver: zodResolver(professionalSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      services: []
    }
  })

  useEffect(() => {
    if (isOpen && initialData) {
      reset({
        name: initialData.name,
        email: initialData.email || '',
        phone: initialData.phone || '',
        services: initialData.services || []
      })
    } else if (isOpen) {
      reset({
        name: '',
        email: '',
        phone: '',
        services: []
      })
    }
  }, [isOpen, initialData, reset])

  const onFormSubmit = (data: ProfessionalFormData) => {
    onSubmit(data)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose} title={initialData ? 'Editar Profissional' : 'Novo Profissional'}>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm font-medium">Nome</label>
            <Input id="name" {...register('name')} placeholder="Ex: João Silva" />
            {errors.name && <span className="text-xs text-rose-500">{errors.name.message}</span>}
          </div>
          <div className="grid gap-2">
            <label htmlFor="email" className="text-sm font-medium">E-mail (opcional)</label>
            <Input id="email" type="email" {...register('email')} placeholder="Ex: joao@example.com" />
            {errors.email && <span className="text-xs text-rose-500">{errors.email.message}</span>}
          </div>
          <div className="grid gap-2">
            <label htmlFor="phone" className="text-sm font-medium">Celular (opcional)</label>
            <Input id="phone" {...register('phone')} placeholder="Ex: 11999999999" />
            {errors.phone && <span className="text-xs text-rose-500">{errors.phone.message}</span>}
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
