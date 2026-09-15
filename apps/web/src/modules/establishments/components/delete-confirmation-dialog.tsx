import { useState, useEffect } from 'react'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { Dialog } from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { useDeleteEstablishment } from '../hooks/use-delete-establishment'
import type { EstablishmentPublic } from '../api/establishments-api'

export type DeleteConfirmationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  establishment: EstablishmentPublic
  totalEstablishments: number
  onSuccess?: () => void
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  establishment,
  totalEstablishments,
  onSuccess,
}: DeleteConfirmationDialogProps) {
  const [typedName, setTypedName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const deleteMutation = useDeleteEstablishment()

  useEffect(() => {
    if (!open) {
      setTypedName('')
      setError(null)
    }
  }, [open])

  const targetName = establishment.name.trim()
  const isMatch = typedName.trim().toLowerCase() === targetName.toLowerCase()
  const isOnlyOne = totalEstablishments <= 1

  const handleDelete = async () => {
    if (!isMatch) return
    setError(null)

    try {
      await deleteMutation.mutateAsync(establishment.id)
      onOpenChange(false)
      onSuccess?.()
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Não foi possível excluir o estabelecimento. Tente novamente.'
      )
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Excluir Estabelecimento"
      description="Esta ação removerá o estabelecimento e todos os seus vínculos operacionais."
      className="border-destructive/30 bg-zinc-950 text-zinc-100 max-w-lg"
    >
      <div className="space-y-4 mt-3">
        {/* Irreversible Action Warning */}
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/25 text-destructive text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Atenção: Ação Irreversível</span>
          </div>
          <p className="text-zinc-300 text-[11px] leading-relaxed">
            Ao excluir este estabelecimento, a página pública de agendamento será desativada e a agenda
            deixará de aceitar novos clientes.
          </p>
        </div>

        {/* Single Establishment Extra Warning */}
        {isOnlyOne && (
          <div
            data-testid="single-establishment-warning"
            className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs flex items-start gap-2"
          >
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
            <span>
              Este é seu <strong>único estabelecimento</strong>. Ao excluí-lo, você será redirecionado
              ao processo de configuração inicial (onboarding).
            </span>
          </div>
        )}

        {error && (
          <div
            data-testid="delete-error-message"
            className="p-3 bg-destructive/15 border border-destructive/25 text-destructive rounded-lg text-xs font-medium"
          >
            {error}
          </div>
        )}

        {/* Confirmation prompt */}
        <div className="space-y-2 pt-1">
          <label htmlFor="confirm-name-input" className="text-xs text-zinc-300 block">
            Para confirmar, digite <strong className="text-zinc-100 font-mono">"{targetName}"</strong> abaixo:
          </label>
          <Input
            id="confirm-name-input"
            data-testid="confirm-name-input"
            type="text"
            placeholder={targetName}
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            className="border-zinc-800 bg-zinc-900/60 text-zinc-100 text-sm focus-visible:ring-destructive"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-800/80">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
            className="text-xs h-9 text-zinc-400 hover:text-zinc-200"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            data-testid="confirm-delete-button"
            disabled={!isMatch || deleteMutation.isPending}
            onClick={handleDelete}
            className="text-xs h-9 px-4 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold shadow-md shadow-destructive/20 gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>{deleteMutation.isPending ? 'Excluindo...' : 'Confirmar Exclusão'}</span>
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
