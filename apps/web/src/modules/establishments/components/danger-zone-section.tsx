import { useState } from 'react'
import { Trash2, AlertTriangle } from 'lucide-react'
import { Card } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { DeleteConfirmationDialog } from './delete-confirmation-dialog'
import type { EstablishmentPublic } from '../api/establishments-api'

export type DangerZoneSectionProps = {
  establishment: EstablishmentPublic
  totalEstablishments: number
  onDeleted?: () => void
}

export function DangerZoneSection({
  establishment,
  totalEstablishments,
  onDeleted,
}: DangerZoneSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <>
      <Card
        data-testid="danger-zone-section"
        className="border-destructive/30 bg-destructive/5 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-xl space-y-5"
      >
        <div className="flex items-start gap-3.5 border-b border-destructive/20 pb-5">
          <div className="p-2.5 rounded-xl bg-destructive/15 text-destructive border border-destructive/20 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-destructive tracking-tight">Zona de Perigo</h2>
            <p className="text-sm text-zinc-400 mt-0.5">
              Ações críticas e irreversíveis associadas a este estabelecimento.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-destructive/20 bg-zinc-950/40">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-zinc-100">Excluir este estabelecimento</h3>
            <p className="text-xs text-zinc-400 max-w-md">
              Uma vez excluído, todos os dados relacionados deixarão de estar acessíveis e a agenda
              pública será desativada.
            </p>
          </div>

          <Button
            type="button"
            data-testid="open-delete-dialog-button"
            onClick={() => setIsDialogOpen(true)}
            className="shrink-0 bg-destructive/15 hover:bg-destructive text-destructive hover:text-destructive-foreground border border-destructive/30 text-xs font-semibold h-9 px-4 transition-colors gap-2"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Excluir Estabelecimento</span>
          </Button>
        </div>
      </Card>

      <DeleteConfirmationDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        establishment={establishment}
        totalEstablishments={totalEstablishments}
        onSuccess={onDeleted}
      />
    </>
  )
}
