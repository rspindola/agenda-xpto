import { OnboardingShell } from './onboarding-shell'

export type ServiceInfoStepProps = {
  onSuccess: () => void
}

export function ServiceInfoStep({ onSuccess }: ServiceInfoStepProps) {
  return (
    <OnboardingShell
      currentStep={3}
      title="Seus Serviços"
      subtitle="Simplificamos a sua configuração inicial! Você poderá cadastrar e gerenciar seus serviços depois."
      onNext={onSuccess}
      onSkip={onSuccess}
      nextLabel="Próximo"
    >
      <div className="space-y-4 text-center select-none py-2">
        <div className="p-5 bg-zinc-900/50 rounded-xl border border-zinc-800/60 flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-zinc-200">Personalize tudo no Painel</h3>
          <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
            No painel de controle, você poderá adicionar múltiplos serviços (Ex: Corte de Cabelo, Manicure, Barbaterapia), definir durações customizadas, preços em centavos e associar profissionais a cada item de forma simples.
          </p>
        </div>
      </div>
    </OnboardingShell>
  )
}
