import { useQuery } from '@tanstack/react-query'
import { OnboardingShell } from './onboarding-shell'
import { establishmentsQueryOptions } from '#/modules/auth/queries/session-queries'

export type OnboardingDoneSummaryProps = {
  onSuccess: () => void
}

export function OnboardingDoneSummary({ onSuccess }: OnboardingDoneSummaryProps) {
  const { data: establishments } = useQuery(establishmentsQueryOptions)
  const establishment = establishments?.[0]

  return (
    <OnboardingShell
      currentStep={5}
      title="Tudo Pronto!"
      subtitle="Seu estabelecimento foi configurado com sucesso. Agora você já pode gerenciar sua agenda!"
      onNext={onSuccess}
      nextLabel="Ir para o Dashboard"
    >
      <div className="space-y-4 select-none">
        <div className="p-5 bg-zinc-900/50 rounded-xl border border-zinc-800/60 space-y-4">
          <div className="flex items-center gap-3.5 pb-3.5 border-b border-zinc-800/60">
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <svg className="h-5.5 w-5.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">Configuração Concluída</h3>
              <p className="text-xs text-zinc-400">Sua conta está ativa e pronta para uso</p>
            </div>
          </div>

          {establishment && (
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400 font-medium">Nome do Negócio:</span>
                <span className="text-zinc-200 font-bold">{establishment.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400 font-medium">E-mail de Contato:</span>
                <span className="text-zinc-200 font-medium break-all">{establishment.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400 font-medium">Fuso Horário:</span>
                <span className="text-zinc-200 font-medium">{establishment.timezone}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </OnboardingShell>
  )
}
