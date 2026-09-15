import { createFileRoute } from '@tanstack/react-router'
import { useActiveEstablishment } from '#/modules/establishments/hooks/use-active-establishment'
import { HoursReadonlySummary } from '#/modules/establishments/components/hours-readonly-summary'
import { Card } from '#/components/ui/card'

export const Route = createFileRoute('/_authenticated/settings/hours')({
  component: HoursSettingsRouteComponent,
})

function HoursSettingsRouteComponent() {
  const { activeEstablishment, isLoading } = useActiveEstablishment()

  if (isLoading) {
    return (
      <Card className="p-8 border-zinc-800 bg-zinc-900/30 text-center animate-pulse">
        <div className="h-6 w-48 bg-zinc-800 rounded mx-auto mb-4" />
        <div className="h-4 w-64 bg-zinc-800/60 rounded mx-auto" />
      </Card>
    )
  }

  if (!activeEstablishment) {
    return (
      <Card className="p-8 border-zinc-800 bg-zinc-900/30 text-center">
        <p className="text-zinc-400 text-sm">Nenhum estabelecimento selecionado.</p>
      </Card>
    )
  }

  return <HoursReadonlySummary establishmentId={activeEstablishment.id} />
}
