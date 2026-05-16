# Design Feature: Design System

## 1. Architecture

### 1.1 Folder Structure

```
src/
├── components/
│   ├── ui/             # Atomic components (Base)
│   │   ├── button.tsx
│   │   ├── button.stories.tsx
│   │   ├── input.tsx
│   │   └── ...
│   └── shared/         # Business components (Composition)
│       └── appointment-card.tsx
├── lib/
│   └── utils.ts        # cn utility
├── styles.css          # Tailwind @theme + global resets
└── main.tsx            # Entry point
```

### 1.2 Styling Pattern

Using `cva` for variants and `cn` for class merging.

```typescript
// Example: src/components/ui/button.tsx
import { cva, type VariantProps } from 'cva';
import { cn } from '#/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        // ...
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export const Button = ({ className, variant, size, ...props }: ButtonProps) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
};
```

### 1.3 Tailwind v4 @theme

Tokens will be defined in `src/styles.css` using CSS variables.

```css
@theme {
  --color-primary: oklch(0.6 0.2 260);
  --color-primary-foreground: oklch(0.98 0.01 260);
  /* ... semantic colors ... */
  --font-sans: 'Inter', system-ui, sans-serif;
}
```

## 2. Component Migration Strategy

Existing components in `src/components/storybook/` will be:

1. Analyzed for accessibility and Tailwind v4 compliance.
2. Refactored to use `cva` and `cn`.
3. Moved to `src/components/ui/`.
4. Storybook stories updated to CSF 3.0.

## 3. Testing Strategy

- **Unit Tests**: Using Vitest + Testing Library for components with logic or interaction (Button, Input, Dialog).
- **Snapshot/Visual**: Storybook for visual review.
- **Accessibility**: Use `axe-core` via `jest-axe` (if needed) or manual check against ARIA patterns.
