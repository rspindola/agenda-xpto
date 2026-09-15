import { Link } from '@tanstack/react-router'
import { Settings, Clock, Users, Scissors, AlertTriangle } from 'lucide-react'
import { cn } from '#/lib/utils'

export type SettingsSidebarProps = {
  className?: string
}

export const SETTINGS_NAV_ITEMS = [
  {
    label: 'Geral',
    to: '/settings/general' as const,
    icon: Settings,
    isDanger: false,
    testId: 'nav-settings-general',
  },
  {
    label: 'Horários de Funcionamento',
    to: '/settings/hours' as const,
    icon: Clock,
    isDanger: false,
    testId: 'nav-settings-hours',
  },
  {
    label: 'Equipe e Serviços',
    to: '/settings/team-and-services' as const,
    icon: Users,
    isDanger: false,
    testId: 'nav-settings-team-services',
  },
  {
    label: 'Zona de Perigo',
    to: '/settings/danger' as const,
    icon: AlertTriangle,
    isDanger: true,
    testId: 'nav-settings-danger',
  },
]

export function SettingsSidebar({ className }: SettingsSidebarProps) {
  return (
    <nav
      data-testid="settings-sidebar"
      aria-label="Configurações do Estabelecimento"
      className={cn('flex md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none', className)}
    >
      <div className="hidden md:block px-3 py-1 mb-1">
        <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
          Configurações
        </span>
      </div>

      {SETTINGS_NAV_ITEMS.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          data-testid={item.testId}
          activeProps={{
            className: item.isDanger
              ? 'bg-rose-500/15 text-rose-300 font-semibold border-rose-500/30'
              : 'bg-violet-600/15 text-violet-200 font-semibold border-violet-500/20',
          }}
          inactiveProps={{
            className: item.isDanger
              ? 'text-rose-400/80 hover:bg-rose-500/10 hover:text-rose-300 border-transparent'
              : 'text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-200 border-transparent',
          }}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors shrink-0 border whitespace-nowrap"
        >
          <item.icon className="h-4 w-4 shrink-0" />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}
