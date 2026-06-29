/**
 * Suluhu design tokens — the single source of truth for brand styling.
 *
 * Ported verbatim from the canonical Stitch design systems:
 *   • "Suluhu Wellness System" (primary application surfaces)
 *   • "Suluhu Crisis Core"      (adds Safety Amber for crisis screens)
 *
 * The earth-toned "Serene Connection" exploration was not adopted.
 */

/** Raw brand palette (Wellness System) plus crisis additions. */
export const palette = {
  // Brand
  primary: '#00386d',
  'primary-container': '#1b4f8c',
  'on-primary': '#ffffff',
  'on-primary-container': '#9cc2ff',
  'inverse-primary': '#a7c8ff',

  secondary: '#166a59',
  'secondary-container': '#a5f2db',
  'on-secondary': '#ffffff',
  'on-secondary-container': '#1f705f',

  tertiary: '#003d52',
  'tertiary-container': '#005571',
  'on-tertiary': '#ffffff',
  'on-tertiary-container': '#7acaf2',

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
  'accent-teal-light': '#e8f3f1',

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
  ambient: '0px 4px 24px rgba(27, 79, 140, 0.06)',
  'ambient-lg': '0px 12px 32px rgba(27, 79, 140, 0.08)',
} as const;

export const tokens = { palette, fontFamily, borderRadius, spacing, boxShadow } as const;
