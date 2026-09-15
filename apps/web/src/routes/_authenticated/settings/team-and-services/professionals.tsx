import { createFileRoute } from '@tanstack/react-router'
import { useActiveEstablishment } from '#/modules/establishments/hooks/use-active-establishment'
import { Card } from '#/components/ui/card'
import { ProfessionalCard } from '#/modules/professionals/components/professional-card'
import { ProfessionalFormModal } from '#/modules/professionals/components/professional-form-modal'
import { useProfessionals } from '#/modules/professionals/queries/professional-queries'
import { useDeleteProfessional } from '#/modules/professionals/queries/professional-queries'
import { Button } from '#/components/ui/button'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import type { Professional } from '#/modules/professionals/types'

export const Route = createFileRoute(
  '/_authenticated/settings/team-and-services/professionals',
)({
  component: ProfessionalsTabComponent,
})

function ProfessionalsTabComponent() {
  const { activeEstablishment, isLoading: isEstablishmentLoading } = useActiveEstablishment()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProfessional, setEditingProfessional] = useState<Professional | undefined>(undefined)

  const { data: professionals, isLoading: isProfessionalsLoading } = useProfessionals(
    activeEstablishment?.id ?? ''
  )
  
  const deleteMutation = useDeleteProfessional(activeEstablishment?.id ?? '')

  if (isEstablishmentLoading || isProfessionalsLoading) {
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

  const handleEdit = (pro: Professional) => {
    setEditingProfessional(pro)
    setIsModalOpen(true)
  }

  const handleDelete = (pro: Professional) => {
    if (confirm(`Tem certeza que deseja excluir o profissional ${pro.name}?`)) {
      deleteMutation.mutate(pro.id)
    }
  }

  const handleCreate = () => {
    setEditingProfessional(undefined)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Profissional
        </Button>
      </div>

      {!professionals || professionals.length === 0 ? (
        <Card className="p-8 border-dashed border-zinc-800 bg-zinc-900/10 flex flex-col items-center justify-center text-center">
          <p className="text-zinc-400 mb-4">Nenhum profissional cadastrado.</p>
          <Button variant="outline" onClick={handleCreate}>Cadastrar o primeiro</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {professionals.map(pro => (
            <ProfessionalCard 
              key={pro.id} 
              professional={pro} 
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <ProfessionalFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          establishmentId={activeEstablishment.id}
          initialData={editingProfessional}
          onSubmit={() => {
            // queries handle invalidation on success
            setIsModalOpen(false)
          }}
        />
      )}
    </div>
  )
}
