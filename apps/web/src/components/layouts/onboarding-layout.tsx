import type { ReactNode } from 'react'

export type OnboardingLayoutProps = {
  children: ReactNode
}

export function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 text-zinc-50 relative overflow-hidden select-none p-4 md:p-6 md:py-12">
      {/* Premium Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-gradient-to-tr from-violet-600/30 to-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[70%] rounded-full bg-gradient-to-br from-cyan-500/20 to-indigo-600/20 blur-[150px] pointer-events-none" />

      {/* Decorative center light flare */}
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-indigo-500/5 blur-[80px] pointer-events-none" />

      {/* Centered card container - wider than auth for the wizard */}
      <div className="w-full max-w-2xl relative z-10 transition-all duration-300 ease-in-out">
        {children}
      </div>
    </div>
  )
}
