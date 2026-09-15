import { Edit2, Trash2, Scissors } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { formatCurrency } from '#/lib/format'
import type { Service } from '../types'

export type ServiceCardProps = {
  service: Service
  onEdit: (service: Service) => void
  onDelete: (service: Service) => void
}

export function ServiceCard({ service, onEdit, onDelete }: ServiceCardProps) {
  return (
    <Card className="flex flex-col relative overflow-hidden group">
      {service.catalogCombo && (
        <div className="absolute top-0 right-0 bg-violet-600/90 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-bl-lg z-10">
          Pacote/Combo
        </div>
      )}
      
      <CardHeader className="pb-3 flex-row items-start justify-between">
        <div className="flex gap-3 items-center">
          <div className="h-10 w-10 rounded-lg bg-zinc-900 flex items-center justify-center shrink-0 border border-zinc-800">
            <Scissors className="w-5 h-5 text-zinc-400" />
          </div>
          <div>
            <CardTitle className="text-base text-zinc-100">{service.name}</CardTitle>
            {service.description && (
              <CardDescription className="line-clamp-1 mt-0.5 text-xs text-zinc-400">
                {service.description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col justify-end pt-2">
        <div className="flex items-center justify-between mt-auto">
          <div className="flex gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold">Duração</span>
              <span className="text-sm font-medium text-zinc-300">{service.durationMinutes} min</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold">Preço</span>
              <span className="text-sm font-medium text-zinc-300">{formatCurrency(service.priceCents)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              onClick={() => onEdit(service)}
              aria-label="Editar"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
              onClick={() => onDelete(service)}
              aria-label="Excluir"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
