import { cn } from '#/lib/utils'

export type StepProgressProps = {
  currentStep: number
}

const STEPS = [
  { label: 'Empresa', desc: 'Dados do negócio' },
  { label: 'Equipe', desc: 'Profissionais' },
  { label: 'Serviços', desc: 'Catálogo' },
  { label: 'Horários', desc: 'Agenda' },
  { label: 'Pronto', desc: 'Finalização' },
]

export function StepProgress({ currentStep }: StepProgressProps) {
  return (
    <div className="w-full py-2">
      {/* Mobile progress indicator */}
      <div className="flex items-center justify-between sm:hidden mb-4">
        <span className="text-xs font-semibold text-zinc-400 tracking-wider uppercase">
          Passo {currentStep} de {STEPS.length}
        </span>
        <span className="text-sm font-bold text-violet-400">
          {STEPS[currentStep - 1].label}
        </span>
      </div>

      {/* Desktop progress bar */}
      <div className="hidden sm:flex items-start justify-between relative mb-6">
        {/* Connecting progress line */}
        <div className="absolute top-[18px] left-[5%] right-[5%] h-0.5 bg-zinc-800/80 rounded" />
        <div
          className="absolute top-[18px] left-[5%] h-0.5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded transition-all duration-500 ease-out"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 90}%` }}
        />

        {STEPS.map((step, idx) => {
          const stepNum = idx + 1
          const isCompleted = stepNum < currentStep
          const isActive = stepNum === currentStep

          return (
            <div key={idx} className="flex flex-col items-center relative z-10 flex-1 select-none">
              {/* Step indicator circle */}
              <div
                className={cn(
                  'h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border shadow-lg',
                  isCompleted
                    ? 'bg-gradient-to-tr from-violet-600 to-indigo-600 border-violet-500 text-zinc-50 shadow-violet-600/20'
                    : isActive
                      ? 'bg-zinc-900 border-violet-500 text-violet-400 ring-4 ring-violet-500/10 shadow-violet-500/10'
                      : 'bg-zinc-950 border-zinc-800/80 text-zinc-500'
                )}
              >
                {isCompleted ? (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>

              {/* Step Labels */}
              <span
                className={cn(
                  'mt-2.5 text-xs font-semibold tracking-wide transition-colors duration-200',
                  isActive ? 'text-zinc-200' : isCompleted ? 'text-zinc-400' : 'text-zinc-600'
                )}
              >
                {step.label}
              </span>
              <span
                className={cn(
                  'text-[10px] hidden md:block transition-colors duration-200 font-medium',
                  isActive ? 'text-zinc-400' : isCompleted ? 'text-zinc-500' : 'text-zinc-700'
                )}
              >
                {step.desc}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
