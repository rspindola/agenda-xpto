import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Building2, ChevronDown, Check, Plus, AlertCircle } from 'lucide-react'
import { useActiveEstablishment } from '../hooks/use-active-establishment'
import { sessionQueryOptions } from '#/modules/auth/queries/session-queries'
import { getEstablishmentLimit } from '../lib/plan-limits'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import type { EstablishmentPublic } from '../api/establishments-api'

export type EstablishmentSwitcherProps = {
  className?: string
  onOpenCreate?: () => void
}

export function EstablishmentSwitcher({ className, onOpenCreate }: EstablishmentSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { data: sessionData } = useQuery(sessionQueryOptions)
  const { activeEstablishment, establishments, isLoading, setActiveEstablishmentId } =
    useActiveEstablishment()

  const userPlan = (sessionData?.user as any)?.plan || 'starter'
  const { max, isAtLimit, isNearLimit, isSingleOnly } = getEstablishmentLimit(userPlan)
  const currentCount = establishments.length
  const atLimit = isAtLimit(currentCount)
  const nearLimit = isNearLimit(currentCount)

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (isLoading) {
    return (
      <div className={cn('h-9 px-3 rounded-lg bg-zinc-900/50 border border-zinc-800 animate-pulse flex items-center gap-2', className)}>
        <div className="h-4 w-4 bg-zinc-800 rounded" />
        <div className="h-3.5 w-24 bg-zinc-800 rounded" />
      </div>
    )
  }

  const establishmentName = activeEstablishment?.name || 'Meu Estabelecimento'

  // Starter Plan: Static text / badge
  if (isSingleOnly) {
    return (
      <div
        data-testid="starter-establishment-badge"
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-800/80 bg-zinc-900/40 text-xs font-semibold text-zinc-300 select-none shadow-sm',
          className
        )}
      >
        <Building2 className="h-4 w-4 text-violet-400 shrink-0" />
        <span className="truncate max-w-[160px] sm:max-w-[220px]">{establishmentName}</span>
      </div>
    )
  }

  // Pro / Business Plan: Interactive Dropdown
  const handleSelect = (est: EstablishmentPublic) => {
    setActiveEstablishmentId(est.id)
    setIsOpen(false)
  }

  return (
    <div
      ref={dropdownRef}
      data-testid="establishment-switcher"
      className={cn('relative inline-block text-left', className)}
    >
      <Button
        type="button"
        variant="ghost"
        data-testid="establishment-switcher-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 px-3 gap-2 border border-zinc-800/80 bg-zinc-900/50 hover:bg-zinc-800/60 text-xs font-semibold text-zinc-200 hover:text-zinc-100 rounded-lg transition-colors flex items-center shadow-sm"
      >
        <Building2 className="h-4 w-4 text-violet-400 shrink-0" />
        <span className="truncate max-w-[140px] sm:max-w-[200px]">{establishmentName}</span>
        <ChevronDown
          className={cn('h-3.5 w-3.5 text-zinc-400 transition-transform duration-200', isOpen && 'rotate-180')}
        />
      </Button>

      {isOpen && (
        <div
          data-testid="establishment-switcher-dropdown"
          className="absolute left-0 mt-2 w-72 rounded-xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-md p-1.5 shadow-2xl z-50 animate-in fade-in-0 zoom-in-95 duration-100 flex flex-col gap-1"
        >
          {/* Header count info */}
          <div className="px-2.5 py-1.5 flex items-center justify-between border-b border-zinc-800/60 pb-2">
            <span className="text-xs font-semibold text-zinc-400">Estabelecimentos</span>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
              {currentCount} de {max}
            </span>
          </div>

          {/* Limit feedback */}
          {atLimit && (
            <div
              data-testid="plan-limit-alert"
              className="mx-1 my-1 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
              <span>Seu plano permite até {max} estabelecimentos. Faça upgrade para adicionar mais.</span>
            </div>
          )}

          {!atLimit && nearLimit && (
            <div className="mx-1 my-1 p-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[11px] flex items-center gap-1.5">
              <span>Você pode criar mais 1 estabelecimento.</span>
            </div>
          )}

          {/* List of establishments */}
          <div className="max-h-56 overflow-y-auto space-y-0.5 py-1">
            {establishments.map((est) => {
              const isSelected = est.id === activeEstablishment?.id
              return (
                <button
                  key={est.id}
                  type="button"
                  data-testid={`establishment-item-${est.id}`}
                  onClick={() => handleSelect(est)}
                  className={cn(
                    'w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium rounded-lg text-left transition-colors',
                    isSelected
                      ? 'bg-violet-600/15 text-violet-200 font-semibold'
                      : 'text-zinc-300 hover:bg-zinc-900/80 hover:text-zinc-100'
                  )}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <Building2 className={cn('h-3.5 w-3.5 shrink-0', isSelected ? 'text-violet-400' : 'text-zinc-500')} />
                    <span className="truncate">{est.name}</span>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-violet-400 shrink-0" />}
                </button>
              )
            })}
          </div>

          {/* Footer action: Add new */}
          <div className="pt-1.5 border-t border-zinc-800/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-testid="add-establishment-button"
              disabled={atLimit}
              onClick={() => {
                setIsOpen(false)
                onOpenCreate?.()
              }}
              className={cn(
                'w-full justify-center gap-1.5 text-xs h-8 border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200',
                atLimit && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Plus className="h-3.5 w-3.5 text-violet-400" />
              <span>Novo Estabelecimento</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
