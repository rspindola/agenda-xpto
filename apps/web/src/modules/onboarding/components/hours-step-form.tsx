import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { OnboardingShell } from './onboarding-shell'
import { Input } from '#/components/ui/input'
import { useSaveBusinessHours } from '../hooks/use-save-business-hours'
import { establishmentsQueryOptions } from '#/modules/auth/queries/session-queries'

export type HoursStepFormProps = {
  onSuccess: () => void
  onSkip: () => void
}

const DAYS_OF_WEEK = [
  { key: 'MON', label: 'Segunda-feira' },
  { key: 'TUE', label: 'Terça-feira' },
  { key: 'WED', label: 'Quarta-feira' },
  { key: 'THU', label: 'Quinta-feira' },
  { key: 'FRI', label: 'Sexta-feira' },
  { key: 'SAT', label: 'Sábado' },
  { key: 'SUN', label: 'Domingo' },
] as const

type DayState = {
  closed: boolean
  opensAt: string
  closesAt: string
  hasBreak: boolean
  breakStartsAt: string
  breakEndsAt: string
}

export function HoursStepForm({ onSuccess, onSkip }: HoursStepFormProps) {
  const { data: establishments } = useQuery(establishmentsQueryOptions)
  const saveMutation = useSaveBusinessHours()
  const [genericError, setGenericError] = useState<string | null>(null)

  const establishmentId = establishments?.[0]?.id || ''

  const [daysState, setDaysState] = useState<Record<string, DayState>>({
    MON: { closed: false, opensAt: '09:00', closesAt: '18:00', hasBreak: true, breakStartsAt: '12:00', breakEndsAt: '13:00' },
    TUE: { closed: false, opensAt: '09:00', closesAt: '18:00', hasBreak: true, breakStartsAt: '12:00', breakEndsAt: '13:00' },
    WED: { closed: false, opensAt: '09:00', closesAt: '18:00', hasBreak: true, breakStartsAt: '12:00', breakEndsAt: '13:00' },
    THU: { closed: false, opensAt: '09:00', closesAt: '18:00', hasBreak: true, breakStartsAt: '12:00', breakEndsAt: '13:00' },
    FRI: { closed: false, opensAt: '09:00', closesAt: '18:00', hasBreak: true, breakStartsAt: '12:00', breakEndsAt: '13:00' },
    SAT: { closed: true, opensAt: '09:00', closesAt: '18:00', hasBreak: false, breakStartsAt: '12:00', breakEndsAt: '13:00' },
    SUN: { closed: true, opensAt: '09:00', closesAt: '18:00', hasBreak: false, breakStartsAt: '12:00', breakEndsAt: '13:00' },
  })

  const handleToggleClosed = (key: string) => {
    setDaysState((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        closed: !prev[key].closed,
      },
    }))
  }

  const handleToggleBreak = (key: string) => {
    setDaysState((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        hasBreak: !prev[key].hasBreak,
      },
    }))
  }

  const handleFieldChange = (key: string, field: keyof DayState, value: string | boolean) => {
    setDaysState((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }))
  }

  const handleSubmit = async () => {
    if (!establishmentId) {
      setGenericError('Nenhum estabelecimento encontrado para salvar horários.')
      return
    }

    setGenericError(null)

    // Validation
    const batch = Object.entries(daysState).map(([weekday, state]) => {
      // Basic validation for times if open
      if (!state.closed) {
        if (!state.opensAt || !state.closesAt) {
          throw new Error(`Horários de abertura e fechamento são obrigatórios para ${weekday}`)
        }
        if (state.hasBreak && (!state.breakStartsAt || !state.breakEndsAt)) {
          throw new Error(`Horários de intervalo são obrigatórios para ${weekday}`)
        }
      }

      return {
        weekday,
        body: {
          closed: state.closed,
          opensAt: state.closed ? undefined : state.opensAt,
          closesAt: state.closed ? undefined : state.closesAt,
          breakStartsAt: !state.closed && state.hasBreak ? state.breakStartsAt : null,
          breakEndsAt: !state.closed && state.hasBreak ? state.breakEndsAt : null,
        },
      }
    })

    try {
      await saveMutation.mutateAsync({
        establishmentId,
        batch,
      })
      onSuccess()
    } catch (error: any) {
      setGenericError(
        error.message || 'Não foi possível salvar seus horários de funcionamento. Tente novamente.'
      )
    }
  }

  return (
    <OnboardingShell
      currentStep={4}
      title="Horários de Funcionamento"
      subtitle="Defina os dias e horas que seu estabelecimento estará aberto para receber agendamentos."
      onNext={handleSubmit}
      onSkip={onSkip}
      isPending={saveMutation.isPending}
      nextLabel="Próximo"
    >
      <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
        {genericError && (
          <div className="p-3 bg-destructive/15 border border-destructive/25 text-destructive rounded-lg text-sm font-medium">
            {genericError}
          </div>
        )}

        <div className="space-y-3.5">
          {DAYS_OF_WEEK.map((day) => {
            const state = daysState[day.key]

            return (
              <div
                key={day.key}
                className={`p-4 rounded-xl border transition-all duration-200 ${
                  state.closed
                    ? 'bg-zinc-950/20 border-zinc-900/60 opacity-60'
                    : 'bg-zinc-900/30 border-zinc-800/80 shadow-md shadow-black/5'
                }`}
              >
                {/* Header row with switch toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      id={`check-${day.key}`}
                      type="checkbox"
                      checked={!state.closed}
                      onChange={() => handleToggleClosed(day.key)}
                      className="h-4.5 w-4.5 rounded border-zinc-800 bg-zinc-950/40 text-violet-600 focus:ring-violet-500/20 cursor-pointer"
                    />
                    <label
                      htmlFor={`check-${day.key}`}
                      className="text-sm font-bold text-zinc-200 cursor-pointer select-none"
                    >
                      {day.label}
                    </label>
                  </div>
                  <span className={`text-xs font-semibold uppercase tracking-wider ${state.closed ? 'text-zinc-600' : 'text-emerald-500'}`}>
                    {state.closed ? 'Fechado' : 'Aberto'}
                  </span>
                </div>

                {/* Form fields if open */}
                {!state.closed && (
                  <div className="mt-4 pt-3.5 border-t border-zinc-800/50 space-y-3.5">
                    {/* Time fields */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
                          Abertura
                        </span>
                        <Input
                          type="time"
                          value={state.opensAt}
                          onChange={(e) => handleFieldChange(day.key, 'opensAt', e.target.value)}
                          className="h-9 text-xs border-zinc-800 bg-zinc-950/40 text-zinc-100"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
                          Fechamento
                        </span>
                        <Input
                          type="time"
                          value={state.closesAt}
                          onChange={(e) => handleFieldChange(day.key, 'closesAt', e.target.value)}
                          className="h-9 text-xs border-zinc-800 bg-zinc-950/40 text-zinc-100"
                        />
                      </div>
                    </div>

                    {/* Lunch Break Toggle */}
                    <div className="flex items-center justify-between bg-zinc-950/20 p-2.5 rounded-lg border border-zinc-900/60">
                      <span className="text-xs font-semibold text-zinc-300">Pausa para Almoço</span>
                      <input
                        type="checkbox"
                        checked={state.hasBreak}
                        onChange={() => handleToggleBreak(day.key)}
                        className="h-4 w-4 rounded border-zinc-800 bg-zinc-950/40 text-violet-600 focus:ring-violet-500/20 cursor-pointer"
                      />
                    </div>

                    {/* Lunch Break fields */}
                    {state.hasBreak && (
                      <div className="grid grid-cols-2 gap-3 pl-3.5 border-l-2 border-violet-500/30">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
                            Início Pausa
                          </span>
                          <Input
                            type="time"
                            value={state.breakStartsAt}
                            onChange={(e) => handleFieldChange(day.key, 'breakStartsAt', e.target.value)}
                            className="h-8 text-xs border-zinc-800 bg-zinc-950/40 text-zinc-100"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
                            Fim Pausa
                          </span>
                          <Input
                            type="time"
                            value={state.breakEndsAt}
                            onChange={(e) => handleFieldChange(day.key, 'breakEndsAt', e.target.value)}
                            className="h-8 text-xs border-zinc-800 bg-zinc-950/40 text-zinc-100"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </OnboardingShell>
  )
}
