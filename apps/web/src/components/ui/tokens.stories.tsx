import type { Meta, StoryObj } from '@storybook/react'
import { colors, fonts, radii } from '#/lib/tokens'

const spacingScale = [
  { name: 'xs', value: '0.25rem' },
  { name: 'sm', value: '0.5rem' },
  { name: 'md', value: '0.75rem' },
  { name: 'lg', value: '1rem' },
  { name: 'xl', value: '1.5rem' },
  { name: '2xl', value: '2rem' },
  { name: '3xl', value: '3rem' },
  { name: '4xl', value: '4rem' },
]

type ColorKey = keyof typeof colors

const colorGroups: Array<{ title: string; keys: ColorKey[] }> = [
  {
    title: 'Surface',
    keys: ['background'],
  },
  {
    title: 'Content',
    keys: ['foreground', 'mutedForeground'],
  },
  {
    title: 'Brand & Accent',
    keys: [
      'primary',
      'primaryForeground',
      'secondary',
      'secondaryForeground',
      'accent',
      'accentForeground',
    ],
  },
  {
    title: 'State',
    keys: ['destructive', 'destructiveForeground'],
  },
  {
    title: 'Borders & Rings',
    keys: ['border', 'input', 'ring'],
  },
]

const renderColorGrid = (entries: Array<[string, string]>) => (
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {entries.map(([key, value]) => (
      <div
        key={key}
        className="flex items-center justify-between rounded-md border bg-background p-3"
      >
        <div>
          <div className="text-sm font-medium">{key}</div>
          <div className="text-xs text-muted-foreground">{value}</div>
        </div>
        <div
          className="h-10 w-10 rounded-md border"
          style={{ backgroundColor: value }}
        />
      </div>
    ))}
  </div>
)

const TokensShowcase = () => {
  return (
    <div className="grid gap-8 p-6 text-foreground">
      <section className="grid gap-4">
        <div>
          <h2 className="text-lg font-semibold">Colors</h2>
          <p className="text-sm text-muted-foreground">Light theme tokens</p>
        </div>
        {renderColorGrid(Object.entries(colors))}
      </section>

      <section className="grid gap-4">
        <div>
          <h2 className="text-lg font-semibold">Semantic Tokens</h2>
          <p className="text-sm text-muted-foreground">
            Grouped by usage category
          </p>
        </div>
        <div className="grid gap-4">
          {colorGroups.map((group) => (
            <div key={group.title} className="grid gap-3">
              <div className="text-sm font-semibold text-foreground">
                {group.title}
              </div>
              {renderColorGrid(group.keys.map((key) => [key, colors[key]]))}
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4">
        <div>
          <h2 className="text-lg font-semibold">Typography</h2>
          <p className="text-sm text-muted-foreground">Font family tokens</p>
        </div>
        <div className="grid gap-2 rounded-md border bg-background p-4">
          <div className="text-xs text-muted-foreground">{fonts.sans}</div>
          <div style={{ fontFamily: fonts.sans }}>
            <div className="text-3xl font-semibold">Design System</div>
            <div className="text-base text-muted-foreground">
              The quick brown fox jumps over the lazy dog.
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4">
        <div>
          <h2 className="text-lg font-semibold">Spacing</h2>
          <p className="text-sm text-muted-foreground">
            Default spacing scale for layout rhythm
          </p>
        </div>
        <div className="grid gap-3 rounded-md border bg-background p-4">
          {spacingScale.map((item) => (
            <div key={item.name} className="flex items-center gap-4">
              <div className="w-12 text-xs font-medium">{item.name}</div>
              <div
                className="h-3 rounded-sm bg-primary/20"
                style={{ width: item.value }}
              />
              <div className="text-xs text-muted-foreground">{item.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4">
        <div>
          <h2 className="text-lg font-semibold">Radii</h2>
          <p className="text-sm text-muted-foreground">Corner radius tokens</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {Object.entries(radii).map(([key, value]) => (
            <div
              key={key}
              className="rounded-md border bg-background p-4 text-sm"
            >
              <div className="mb-3 text-xs text-muted-foreground">{key}</div>
              <div
                className="h-16 w-16 border bg-secondary"
                style={{ borderRadius: value }}
              />
              <div className="mt-2 text-xs text-muted-foreground">{value}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

const meta = {
  component: TokensShowcase,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof TokensShowcase>

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {}

export const LightDark: Story = {
  decorators: [
    (Story) => (
      <div className="grid gap-6 bg-muted/30 p-6">
        <section className="grid gap-3">
          <div className="text-sm font-semibold text-foreground">Light</div>
          <div className="rounded-lg border bg-background text-foreground">
            <Story />
          </div>
        </section>
        <section className="grid gap-3">
          <div className="text-sm font-semibold text-foreground">Dark</div>
          <div className="rounded-lg border bg-background text-foreground dark">
            <Story />
          </div>
        </section>
      </div>
    ),
  ],
}
