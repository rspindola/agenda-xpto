export const colors = {
  background: 'oklch(1 0 0)',
  foreground: 'oklch(0.145 0.023 205)',
  primary: 'oklch(0.585 0.233 277.117)',
  primaryForeground: 'oklch(0.985 0 0)',
  secondary: 'oklch(0.967 0.001 286.375)',
  secondaryForeground: 'oklch(0.205 0.002 343.343)',
  muted: 'oklch(0.967 0.001 286.375)',
  mutedForeground: 'oklch(0.556 0.001 286.375)',
  accent: 'oklch(0.967 0.001 286.375)',
  accentForeground: 'oklch(0.205 0.002 343.343)',
  destructive: 'oklch(0.577 0.245 27.325)',
  destructiveForeground: 'oklch(1 0 0)',
  border: 'oklch(0.922 0 0)',
  input: 'oklch(0.922 0 0)',
  ring: 'oklch(0.708 0 0)',
} as const

export const darkColors = {
  background: 'oklch(0.145 0.023 205)',
  foreground: 'oklch(0.985 0 0)',
  primary: 'oklch(0.985 0 0)',
  primaryForeground: 'oklch(0.205 0.002 343.343)',
  secondary: 'oklch(0.205 0.002 343.343)',
  secondaryForeground: 'oklch(0.985 0 0)',
  muted: 'oklch(0.205 0.002 343.343)',
  mutedForeground: 'oklch(0.556 0.001 286.375)',
  accent: 'oklch(0.205 0.002 343.343)',
  accentForeground: 'oklch(0.985 0 0)',
  destructive: 'oklch(0.577 0.245 27.325)',
  destructiveForeground: 'oklch(0.985 0 0)',
  border: 'oklch(0.205 0.002 343.343)',
  input: 'oklch(0.205 0.002 343.343)',
  ring: 'oklch(0.708 0 0)',
} as const

export const radii = {
  lg: '0.5rem',
  md: 'calc(var(--radius-lg) - 2px)',
  sm: 'calc(var(--radius-lg) - 4px)',
} as const

export const fonts = {
  sans: "'Inter', system-ui, sans-serif",
} as const
