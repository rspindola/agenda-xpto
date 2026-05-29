import React from 'react'
import { StepProgress } from './step-progress'
import { Button } from '#/components/ui/button'

export type OnboardingShellProps = {
  currentStep: number
  title: string
  subtitle: string
  onNext?: () => void
  onBack?: () => void
  onSkip?: () => void
  isPending?: boolean
  nextLabel?: string
  children: React.ReactNode
}

export function OnboardingShell({
  currentStep,
  title,
  subtitle,
  onNext,
  onBack,
  onSkip,
  isPending = false,
  nextLabel = 'Próximo',
  children,
}: OnboardingShellProps) {
  return (
    <div className="w-full flex flex-col gap-6">
      {/* Visual Step Progress Header */}
      <StepProgress currentStep={currentStep} />

      {/* Main wizard card */}
      <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-zinc-800/80 p-6 sm:p-8 flex flex-col gap-6 shadow-xl shadow-black/10 select-none">
        {/* Title block */}
        <div className="flex flex-col gap-1.5 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100">{title}</h2>
          <p className="text-sm text-zinc-400 font-medium leading-relaxed">{subtitle}</p>
        </div>

        {/* Content body */}
        <div className="relative z-10">{children}</div>

        {/* Navigation Action Buttons */}
        <div className="flex items-center justify-between border-t border-zinc-800/50 pt-5 mt-2 gap-3">
          <div>
            {onBack && (
              <Button
                type="button"
                variant="ghost"
                onClick={onBack}
                disabled={isPending}
                className="h-10 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 font-semibold px-4"
              >
                Voltar
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {onSkip && (
              <Button
                type="button"
                variant="ghost"
                onClick={onSkip}
                disabled={isPending}
                className="h-10 text-zinc-500 hover:text-zinc-400 hover:bg-zinc-800/20 font-semibold px-4"
              >
                Pular
              </Button>
            )}

            {onNext && (
              <Button
                type="button"
                onClick={onNext}
                disabled={isPending}
                className="h-10 px-5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-zinc-50 font-semibold shadow-lg shadow-violet-600/20 min-w-[100px]"
              >
                {isPending ? 'Carregando...' : nextLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
