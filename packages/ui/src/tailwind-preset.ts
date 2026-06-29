/**
 * Shared Tailwind preset consumed by apps/web.
 *
 * Exposes both:
 *   1. Faithful Suluhu palette tokens (e.g. `bg-primary-container`, `text-on-surface`)
 *      so screens ported from Stitch keep their exact class names.
 *   2. shadcn/ui-style semantic aliases (`bg-background`, `border-border`, …) backed
 *      by CSS variables defined in apps/web globals.css, enabling light/dark theming.
 */

import type { Config } from 'tailwindcss';
import { borderRadius, boxShadow, fontFamily, palette, spacing } from './tokens';

const semanticColors = {
  border: 'var(--border)',
  input: 'var(--input)',
  ring: 'var(--ring)',
  background: 'var(--background)',
  foreground: 'var(--foreground)',
  card: { DEFAULT: 'var(--card)', foreground: 'var(--card-foreground)' },
  popover: { DEFAULT: 'var(--popover)', foreground: 'var(--popover-foreground)' },
  muted: { DEFAULT: 'var(--muted)', foreground: 'var(--muted-foreground)' },
  accent: { DEFAULT: 'var(--accent)', foreground: 'var(--accent-foreground)' },
  destructive: { DEFAULT: 'var(--destructive)', foreground: 'var(--destructive-foreground)' },
  brand: { DEFAULT: 'var(--brand)', foreground: 'var(--brand-foreground)' },
} as const;

export const suluhuPreset: Partial<Config> = {
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: spacing.marginMobile, lg: spacing.marginDesktop },
      screens: { '2xl': spacing.containerMax },
    },
    extend: {
      colors: {
        // Faithful Suluhu palette
        ...palette,
        // shadcn semantic aliases (override the brand-ambiguous ones above)
        ...semanticColors,
      },
      fontFamily: {
        display: [...fontFamily.display],
        sans: [...fontFamily.sans],
      },
      borderRadius: {
        sm: borderRadius.sm,
        DEFAULT: borderRadius.DEFAULT,
        md: borderRadius.md,
        lg: borderRadius.lg,
        xl: borderRadius.xl,
        full: borderRadius.full,
      },
      boxShadow: {
        ambient: boxShadow.ambient,
        'ambient-lg': boxShadow['ambient-lg'],
      },
      maxWidth: {
        container: spacing.containerMax,
      },
    },
  },
};

export default suluhuPreset;
