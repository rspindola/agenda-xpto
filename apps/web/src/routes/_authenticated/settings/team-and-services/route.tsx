import { createFileRoute, Outlet, Link, useLocation } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/settings/team-and-services')({
  component: TeamAndServicesLayoutComponent,
})

function TeamAndServicesLayoutComponent() {
  const location = useLocation()
  const isServices = location.pathname.includes('/services')
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Equipe e Serviços</h2>
        <p className="text-muted-foreground">
          Gerencie os profissionais que atendem no seu estabelecimento e os serviços prestados.
        </p>
      </div>

      <div className="flex w-full items-center justify-start border-b border-border/40">
        <nav className="flex gap-4">
          <Link
            to="/settings/team-and-services/professionals"
            className={`pb-2 border-b-2 font-medium text-sm transition-colors ${
              !isServices 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-primary hover:border-border'
            }`}
          >
            Profissionais
          </Link>
          <Link
            to="/settings/team-and-services/services"
            className={`pb-2 border-b-2 font-medium text-sm transition-colors ${
              isServices 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-primary hover:border-border'
            }`}
          >
            Serviços
          </Link>
        </nav>
      </div>
      
      <div className="pt-2">
        <Outlet />
      </div>
    </div>
  )
}
