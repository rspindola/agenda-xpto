import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ensureOnboardingComplete } from '#/modules/auth/lib/route-guards'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { authApi } from '#/modules/auth/api/auth-api'
import { authKeys } from '#/modules/auth/query-keys'
import { sessionQueryOptions } from '#/modules/auth/queries/session-queries'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/_authenticated/dashboard')({
  beforeLoad: async ({ context }) => {
    await ensureOnboardingComplete(context.queryClient)
  },
  component: DashboardComponent,
})

function DashboardComponent() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: sessionData } = useQuery(sessionQueryOptions)

  const signOutMutation = useMutation({
    mutationFn: () => authApi.signOut(),
    onSuccess: () => {
      queryClient.setQueryData(authKeys.session(), null)
      queryClient.clear()
      navigate({ to: '/login' })
    },
  })

  const handleSignOut = () => {
    signOutMutation.mutate()
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col justify-between selection:bg-violet-500/30 selection:text-violet-200">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.12),rgba(255,255,255,0))]" />

      {/* Header */}
      <header className="relative z-10 border-b border-zinc-800/50 bg-zinc-950/60 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 select-none">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-600/25">
            <span className="font-extrabold text-sm text-zinc-50 tracking-wider">X</span>
          </div>
          <span className="font-bold text-lg text-zinc-200 tracking-wide">Agenda XPTO</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-zinc-300 hidden sm:inline">
            Olá, {sessionData?.user.name || 'Administrador'}
          </span>
          <Button
            type="button"
            variant="ghost"
            onClick={handleSignOut}
            disabled={signOutMutation.isPending}
            className="h-9 px-3.5 border border-zinc-800/60 bg-zinc-900/30 hover:bg-zinc-800/40 text-xs font-semibold text-zinc-300 hover:text-zinc-100 rounded-lg transition-colors"
          >
            {signOutMutation.isPending ? 'Saindo...' : 'Sair'}
          </Button>
        </div>
      </header>

      {/* Dashboard Body Stub */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="max-w-md p-8 bg-zinc-900/30 backdrop-blur-md border border-zinc-800/80 rounded-2xl shadow-xl flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-zinc-100">Painel de Controle</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Sua agenda foi inicializada! Aqui você verá a lista de compromissos, profissionais, configurações e relatórios.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-900/60 bg-zinc-950/40 py-4 text-center text-xs text-zinc-500 font-medium">
        &copy; {new Date().getFullYear()} Agenda XPTO. Todos os direitos reservados.
      </footer>
    </div>
  )
}
