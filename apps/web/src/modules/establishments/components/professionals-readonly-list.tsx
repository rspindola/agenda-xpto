import { Users, ExternalLink, Mail, Phone, CheckCircle2, XCircle } from 'lucide-react'
import { Card } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { useEstablishmentProfessionals } from '../hooks/use-establishment-queries'

export type ProfessionalsReadonlyListProps = {
  establishmentId: string
}

export function ProfessionalsReadonlyList({ establishmentId }: ProfessionalsReadonlyListProps) {
  const { data: professionals = [], isLoading } = useEstablishmentProfessionals(establishmentId)

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
      data-testid="professionals-readonly-list"
      className="border-zinc-800/80 bg-zinc-900/30 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-xl space-y-6"
    >
      <div className="border-b border-zinc-800/60 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-violet-400" />
            <span>Profissionais Vinculados</span>
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Equipe habilitada para prestar serviços e receber agendamentos nesta unidade.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs h-9 gap-1.5 border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300"
          onClick={() => alert('O gerenciamento de profissionais será habilitado no módulo de Profissionais.')}
        >
          <span>Gerenciar Equipe</span>
          <ExternalLink className="h-3.5 w-3.5 text-zinc-500" />
        </Button>
      </div>

      {professionals.length === 0 ? (
        <div
          data-testid="professionals-empty-state"
          className="p-8 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-950/40 space-y-3"
        >
          <div className="h-10 w-10 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mx-auto">
            <Users className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-zinc-200">Nenhum profissional cadastrado</p>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Adicione membros à equipe para vincular serviços e disponibilizar horários na agenda online.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {professionals.map((prof) => (
            <div
              key={prof.id}
              data-testid={`professional-card-${prof.id}`}
              className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-950/50 flex items-start justify-between gap-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-violet-600/30 to-indigo-600/30 border border-violet-500/20 text-violet-300 flex items-center justify-center font-bold text-sm">
                  {prof.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-zinc-100">{prof.name}</h3>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3 text-zinc-500" />
                      {prof.email}
                    </span>
                    {prof.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-zinc-500" />
                        {prof.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {prof.isActive !== false ? (
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="h-3 w-3" />
                  Ativo
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">
                  <XCircle className="h-3 w-3" />
                  Inativo
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
