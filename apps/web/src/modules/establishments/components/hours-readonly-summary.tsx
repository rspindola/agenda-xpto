import { Clock, Calendar, ExternalLink } from 'lucide-react'
import { Card } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { useEstablishmentHours } from '../hooks/use-establishment-queries'

export type HoursReadonlySummaryProps = {
  establishmentId: string
}

const WEEKDAY_NAMES = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
]

export function HoursReadonlySummary({ establishmentId }: HoursReadonlySummaryProps) {
  const { data: hours = [], isLoading } = useEstablishmentHours(establishmentId)

  if (isLoading) {
    return (
      <Card className="p-8 border-zinc-800 bg-zinc-900/30 text-center animate-pulse">
        <div className="h-6 w-48 bg-zinc-800 rounded mx-auto mb-4" />
        <div className="space-y-3 max-w-md mx-auto">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-zinc-800/60 rounded-lg" />
          ))}
        </div>
      </Card>
    )
  }

  const hasConfiguredHours = hours.length > 0 && hours.some((h) => h.isOpen)

  return (
    <Card
      data-testid="hours-readonly-summary"
      className="border-zinc-800/80 bg-zinc-900/30 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-xl space-y-6"
    >
      <div className="border-b border-zinc-800/60 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            <Clock className="h-5 w-5 text-violet-400" />
            <span>Horários de Funcionamento</span>
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Visualização dos dias e horários em que seu estabelecimento está aberto ao público.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs h-9 gap-1.5 border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300"
          onClick={() => alert('O gerenciamento de horários e intervalos será habilitado no módulo de Disponibilidade.')}
        >
          <span>Gerenciar Horários</span>
          <ExternalLink className="h-3.5 w-3.5 text-zinc-500" />
        </Button>
      </div>

      {!hasConfiguredHours ? (
        <div
          data-testid="hours-empty-state"
          className="p-8 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-950/40 space-y-3"
        >
          <div className="h-10 w-10 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mx-auto">
            <Calendar className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-zinc-200">Nenhum horário configurado</p>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Defina sua grade de atendimento semanal para permitir agendamentos online nos horários corretos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {hours.map((item) => (
            <div
              key={item.weekday}
              data-testid={`hour-row-${item.weekday}`}
              className="flex items-center justify-between p-3 rounded-xl border border-zinc-800/80 bg-zinc-950/50"
            >
              <span className="text-xs font-semibold text-zinc-300">
                {WEEKDAY_NAMES[item.weekday] || `Dia ${item.weekday}`}
              </span>
              {item.isOpen ? (
                <span className="text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  {item.openTime} – {item.closeTime}
                </span>
              ) : (
                <span className="text-xs font-medium text-zinc-500 bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800">
                  Fechado
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
