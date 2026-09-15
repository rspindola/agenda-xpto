import { Scissors, ExternalLink, Clock, Tag } from 'lucide-react'
import { Card } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { useEstablishmentServices } from '../hooks/use-establishment-queries'

export type ServicesReadonlyListProps = {
  establishmentId: string
}

function formatPriceBrl(priceCents: number) {
  return (priceCents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function ServicesReadonlyList({ establishmentId }: ServicesReadonlyListProps) {
  const { data: services = [], isLoading } = useEstablishmentServices(establishmentId)

  if (isLoading) {
    return (
      <Card className="p-8 border-zinc-800 bg-zinc-900/30 text-center animate-pulse">
        <div className="h-6 w-48 bg-zinc-800 rounded mx-auto mb-4" />
        <div className="space-y-3 max-w-lg mx-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-zinc-800/60 rounded-xl" />
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card
      data-testid="services-readonly-list"
      className="border-zinc-800/80 bg-zinc-900/30 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-xl space-y-6"
    >
      <div className="border-b border-zinc-800/60 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            <Scissors className="h-5 w-5 text-violet-400" />
            <span>Catálogo de Serviços</span>
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Serviços oferecidos e disponíveis para agendamento online pelos clientes.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs h-9 gap-1.5 border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300"
          onClick={() => alert('O gerenciamento de serviços será habilitado no módulo de Serviços.')}
        >
          <span>Gerenciar Serviços</span>
          <ExternalLink className="h-3.5 w-3.5 text-zinc-500" />
        </Button>
      </div>

      {services.length === 0 ? (
        <div
          data-testid="services-empty-state"
          className="p-8 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-950/40 space-y-3"
        >
          <div className="h-10 w-10 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mx-auto">
            <Scissors className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-zinc-200">Nenhum serviço cadastrado</p>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Cadastre os procedimentos, durações e valores para disponibilizar na página pública de agendamentos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {services.map((service) => (
            <div
              key={service.id}
              data-testid={`service-card-${service.id}`}
              className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-950/50 flex items-center justify-between gap-3 shadow-sm"
            >
              <div className="flex items-center gap-3 truncate">
                <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 text-violet-400 flex items-center justify-center shrink-0">
                  <Tag className="h-4 w-4" />
                </div>
                <div className="truncate">
                  <h3 className="text-xs font-bold text-zinc-100 truncate">{service.name}</h3>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-zinc-500" />
                      {service.durationMinutes} min
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-emerald-400 font-mono">
                  {formatPriceBrl(service.priceCents)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
