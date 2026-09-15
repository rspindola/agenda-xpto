import { createFileRoute } from '@tanstack/react-router'
import { useActiveEstablishment } from '#/modules/establishments/hooks/use-active-establishment'
import { Card } from '#/components/ui/card'
import { ServiceCard } from '#/modules/services/components/service-card'
import { ServiceFormModal } from '#/modules/services/components/service-form-modal'
import { useServices } from '#/modules/services/queries/service-queries'
import { useDeleteService } from '#/modules/services/queries/service-queries'
import { Button } from '#/components/ui/button'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import type { Service } from '#/modules/services/types'

export const Route = createFileRoute(
  '/_authenticated/settings/team-and-services/services',
)({
  component: ServicesTabComponent,
})

function ServicesTabComponent() {
  const { activeEstablishment, isLoading: isEstablishmentLoading } = useActiveEstablishment()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | undefined>(undefined)

  const { data: services, isLoading: isServicesLoading } = useServices(
    activeEstablishment?.id ?? ''
  )
  
  const deleteMutation = useDeleteService(activeEstablishment?.id ?? '')

  if (isEstablishmentLoading || isServicesLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="h-48 border-zinc-800 bg-zinc-900/30 animate-pulse" />
        ))}
      </div>
    )
  }

  if (!activeEstablishment) {
    return (
      <Card className="p-8 border-zinc-800 bg-zinc-900/30 text-center">
        <p className="text-zinc-400 text-sm">Nenhum estabelecimento selecionado.</p>
      </Card>
    )
  }

  const handleEdit = (srv: Service) => {
    setEditingService(srv)
    setIsModalOpen(true)
  }

  const handleDelete = (srv: Service) => {
    if (confirm(`Tem certeza que deseja excluir o serviço ${srv.name}?`)) {
      deleteMutation.mutate(srv.id)
    }
  }

  const handleCreate = () => {
    setEditingService(undefined)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Serviço
        </Button>
      </div>

      {!services || services.length === 0 ? (
        <Card className="p-8 border-dashed border-zinc-800 bg-zinc-900/10 flex flex-col items-center justify-center text-center">
          <p className="text-zinc-400 mb-4">Nenhum serviço cadastrado.</p>
          <Button variant="outline" onClick={handleCreate}>Cadastrar o primeiro</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map(srv => (
            <ServiceCard 
              key={srv.id} 
              service={srv} 
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <ServiceFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          establishmentId={activeEstablishment.id}
          initialData={editingService}
          onSubmit={() => {
            // queries handle invalidation on success
            setIsModalOpen(false)
          }}
        />
      )}
    </div>
  )
}
