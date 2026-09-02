/**
 * Suluhu design tokens — the single source of truth for brand styling.
 *
 * Brand colors are sourced from the official Suluhu Therapy Center logo:
 *   • Primary   — the wordmark indigo (#542CB8)
 *   • Secondary — the chain-link mark's spring green (#00E8A2)
 *   • Tertiary  — a warm terracotta added as a complementary accent, not
 *     present in the logo itself, used sparingly for warmth against the
 *     cool primary/secondary pair.
 *
 * Container/on-* variants are generated tints/shades of these three,
 * checked against WCAG AA contrast (4.5:1 body text, 3:1 large/UI).
 */

/** Raw brand palette (Wellness System) plus crisis additions. */
export const palette = {
  // Brand
  primary: '#542cb8',
  // Note: unlike the *-container pattern below, primary-container is consumed
  // across the app as a solid avatar/badge fill paired with `on-primary`
  // (white) text — not a pale tint — so it stays mid-saturation, not light.
  'primary-container': '#7656c6',
  'on-primary': '#ffffff',
  'on-primary-container': '#ffffff',
  'inverse-primary': '#b7a6e1',

  secondary: '#00e8a2',
  'secondary-container': '#ccfaec',
  'on-secondary': '#002a1d',
  'on-secondary-container': '#00583e',

  tertiary: '#ce4128',
  'tertiary-container': '#f9e6e3',
  'on-tertiary': '#ffffff',
  'on-tertiary-container': '#942f1d',

  // Surfaces
  surface: '#f8fafb',
  'surface-dim': '#d8dadb',
  'surface-bright': '#f8fafb',
  'surface-container-lowest': '#ffffff',
  'surface-container-low': '#f2f4f5',
  'surface-container': '#eceeef',
  'surface-container-high': '#e6e8e9',
  'surface-container-highest': '#e1e3e4',
  'surface-soothing': '#f0f4f8',
  'accent-teal-light': '#e0fbf3',

  // Text / outlines
  'on-surface': '#191c1d',
  'on-surface-variant': '#424750',
  'text-rich-slate': '#1c1e21',
  outline: '#737781',
  'outline-variant': '#c2c6d1',
  background: '#f8fafb',
  'on-background': '#191c1d',

  // Status
  error: '#ba1a1a',
  'on-error': '#ffffff',
  'error-container': '#ffdad6',
  'on-error-container': '#93000a',
  'success-calm': '#2e8555',

  // Crisis Core
  'safety-amber': '#d35400',
  'on-safety-amber': '#ffffff',
} as const;

export type PaletteToken = keyof typeof palette;

export const fontFamily = {
  display: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
} as const;

export const borderRadius = {
  sm: '0.25rem',
  DEFAULT: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
  full: '9999px',
} as const;

/** 8px base grid (Wellness System §Layout). */
export const spacing = {
  containerMax: '1200px',
  gutter: '24px',
  marginMobile: '16px',
  marginDesktop: '40px',
  sectionGap: '80px',
} as const;

/** Soft ambient elevation — large blur, low opacity, primary-tinted. */
export const boxShadow = {
  ambient: '0px 4px 24px rgba(84, 44, 184, 0.07)',
  'ambient-lg': '0px 12px 32px rgba(84, 44, 184, 0.10)',
} as const;

export const tokens = { palette, fontFamily, borderRadius, spacing, boxShadow } as const;
