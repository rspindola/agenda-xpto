import type { ReactNode } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '#/components/ui/card'

export type AuthFormCardProps = {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthFormCard({ title, subtitle, children, footer }: AuthFormCardProps) {
  return (
    <Card className="bg-zinc-900/60 backdrop-blur-md border-zinc-800/80 text-zinc-100 shadow-2xl rounded-2xl">
      <CardHeader className="space-y-1.5 pb-4">
        {/* Logo/Branding Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center font-bold text-base text-zinc-50 shadow-md shadow-violet-600/25">
            X
          </div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-zinc-50 to-zinc-300 bg-clip-text text-transparent select-none">
            Agenda XPTO
          </span>
        </div>

        <CardTitle className="text-2xl font-bold tracking-tight text-zinc-50 select-none">
          {title}
        </CardTitle>
        {subtitle && (
          <CardDescription className="text-zinc-400 select-none">
            {subtitle}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {children}
      </CardContent>

      {footer && (
        <CardFooter className="flex flex-col gap-2 pt-4 border-t border-zinc-800/40 mt-2 text-sm text-zinc-400">
          {footer}
        </CardFooter>
      )}
    </Card>
  )
}
