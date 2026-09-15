import type { ReactNode } from 'react'
import { Link, Outlet, useNavigate } from '@tanstack/react-router'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { authApi } from '#/modules/auth/api/auth-api'
import { authKeys } from '#/modules/auth/query-keys'
import { sessionQueryOptions } from '#/modules/auth/queries/session-queries'
import { Button } from '#/components/ui/button'
import { EstablishmentSwitcher } from '#/modules/establishments/components/establishment-switcher'
import { SettingsSidebar } from '#/modules/establishments/components/settings-sidebar'

export type SettingsLayoutProps = {
  children?: ReactNode
}

export function SettingsLayout({ children }: SettingsLayoutProps) {
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

  return (
    <div
      data-testid="settings-layout"
      className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col selection:bg-violet-500/30 selection:text-violet-200"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.12),rgba(255,255,255,0))] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-zinc-800/50 bg-zinc-950/60 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 select-none hover:opacity-90 transition-opacity"
            data-testid="logo-link"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-600/25">
              <span className="font-extrabold text-sm text-zinc-50 tracking-wider">X</span>
            </div>
            <span className="font-bold text-lg text-zinc-200 tracking-wide">Agenda XPTO</span>
          </Link>

          <div className="hidden sm:block h-5 w-px bg-zinc-800" />

          <EstablishmentSwitcher />
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors hidden sm:inline"
            data-testid="link-back-dashboard"
          >
            ← Voltar ao Painel
          </Link>
          <span className="text-sm font-medium text-zinc-300 hidden md:inline">
            Olá, {sessionData?.user.name || 'Administrador'}
          </span>
          <Button
            type="button"
            variant="ghost"
            onClick={() => signOutMutation.mutate()}
            disabled={signOutMutation.isPending}
            className="h-9 px-3.5 border border-zinc-800/60 bg-zinc-900/30 hover:bg-zinc-800/40 text-xs font-semibold text-zinc-300 hover:text-zinc-100 rounded-lg transition-colors"
          >
            {signOutMutation.isPending ? 'Saindo...' : 'Sair'}
          </Button>
        </div>
      </header>

      {/* Main Settings Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Configurações do Estabelecimento</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Gerencie as informações gerais, horários, equipe e configurações da sua empresa.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          <SettingsSidebar />
          <div className="flex-1 w-full min-w-0" data-testid="settings-content">
            {children || <Outlet />}
          </div>
        </div>
      </main>
    </div>
  )
}
