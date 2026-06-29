---
name: Serene Connection
colors:
  surface: '#fff8f4'
  surface-dim: '#dfd9d5'
  surface-bright: '#fff8f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f9f2ee'
  surface-container: '#f3ede8'
  surface-container-high: '#eee7e3'
  surface-container-highest: '#e8e1dd'
  on-surface: '#1e1b19'
  on-surface-variant: '#4d453d'
  inverse-surface: '#33302d'
  inverse-on-surface: '#f6efeb'
  outline: '#7f756b'
  outline-variant: '#d1c4b9'
  surface-tint: '#705b3f'
  primary: '#705b3f'
  on-primary: '#ffffff'
  primary-container: '#e6c9a7'
  on-primary-container: '#695439'
  inverse-primary: '#dec2a0'
  secondary: '#715b3a'
  on-secondary: '#ffffff'
  secondary-container: '#fadbb2'
  on-secondary-container: '#765f3e'
  tertiary: '#535f70'
  on-tertiary: '#ffffff'
  tertiary-container: '#c2cfe3'
  on-tertiary-container: '#4c5869'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#fcdebb'
  primary-fixed-dim: '#dec2a0'
  on-primary-fixed: '#281904'
  on-primary-fixed-variant: '#57432a'
  secondary-fixed: '#fddeb5'
  secondary-fixed-dim: '#e0c29a'
  on-secondary-fixed: '#281901'
  on-secondary-fixed-variant: '#584325'
  tertiary-fixed: '#d6e3f8'
  tertiary-fixed-dim: '#bac7db'
  on-tertiary-fixed: '#0f1c2b'
  on-tertiary-fixed-variant: '#3b4858'
  background: '#fff8f4'
  on-background: '#1e1b19'
  surface-variant: '#e8e1dd'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-md-mobile:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  title-lg:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1200px
  gutter: 24px
---

## Brand & Style

The design system focuses on creating a "Digital Sanctuary"—a space that feels professional yet deeply compassionate. The target audience includes individuals seeking mental health support, requiring an interface that reduces cognitive load and evokes a sense of immediate calm.

The style is a blend of **Soft Minimalism** and **Organic Professionalism**. It avoids the sterile, clinical aesthetic of traditional healthcare apps in favor of warm, tactile elements. High-quality whitespace is used as a functional tool to provide "breathing room" for the user's thoughts. The emotional response should be one of safety, reliability, and warmth.

## Colors

The palette is rooted in earth tones to ground the user experience. 
- **Primary (#E6C9A7):** Used for large surface areas and background sections to soften the visual impact compared to pure white.
- **Secondary (#C4A882):** Applied to structural elements like borders, dividers, and secondary iconography to provide definition without harshness.
- **Accent (#E98A6C):** Reserved strictly for primary calls-to-action and critical interactive highlights.
- **Branding Deep (#5F36D0):** Used for high-level headers and branding elements to inject authority and modern professional trust.
- **Neutral:** Dark Charcoal is used for body text to ensure WCAG AAA accessibility against the cream and white backgrounds.

## Typography

This design system prioritizes extreme legibility and accessibility. **Manrope** provides a modern, balanced feel for headings, while **Atkinson Hyperlegible Next** is utilized for all body copy to ensure users of all visual abilities can navigate the content without strain.

- **Line Heights:** Generous line heights (1.6x for body) are mandated to prevent text crowding, which can increase anxiety.
- **Hierarchy:** Use the Branding Deep color for `display` and `headline` levels to establish a clear information scent.
- **Mobile Scaling:** Headings scale down aggressively on mobile to ensure content remains centered and readable without excessive scrolling.

## Layout & Spacing

The layout follows a **Fluid Grid** model with an emphasis on wide margins.
- **Desktop:** 12-column grid with 24px gutters. Use wide 80px (xl) vertical spacing between major sections to emphasize the "minimalist" and "uncluttered" philosophy.
- **Mobile:** Single column with 20px side margins. Padding within cards should be generous (min 24px) to ensure touch targets are clear and content feels light.
- **Alignment:** Centralized content for informational pages; left-aligned for functional dashboards to maintain professional efficiency.

## Elevation & Depth

To maintain a "reassuring" feel, avoid heavy, dark shadows. Instead, use **Tonal Layering** and **Soft Ambient Shadows**.

- **Level 0 (Background):** Primary Color (#E6C9A7) or Neutral Soft White (#F8F8F8).
- **Level 1 (Cards):** Pure White surface with a very soft, diffused shadow: `0px 4px 20px rgba(95, 54, 208, 0.05)`. Note the subtle tint of the branding deep color in the shadow to maintain harmony.
- **Level 2 (Interactive):** When hovering over buttons or cards, the shadow should slightly expand and the border-color should transition to the Secondary Ochre color.

## Shapes

The shape language is defined by "The Compassionate Curve." Hard angles are strictly avoided to prevent the UI from feeling "sharp" or "aggressive."

- **Cards & Sections:** Use `rounded-xl` (1.5rem / 24px) to create a friendly, container-like feel.
- **Buttons:** Use `rounded-lg` (1rem / 16px) or full pill-shapes for a modern, approachable look.
- **Input Fields:** Softly rounded (8px) to balance professional data entry with the overall friendly aesthetic.

## Components

### Buttons
- **Primary:** Filled with Coral (#E98A6C), white text, rounded-lg. No harsh borders.
- **Secondary:** Outlined with Warm Ochre (#C4A882), text in Branding Deep.
- **Ghost:** Text-only in Branding Deep with a soft background highlight on hover.

### Cards
- Standard cards use a white background, 24px padding, and 24px corner radius. 
- Content inside cards should have a vertical gap of 12px-16px.

### Input Fields
- Backgrounds should be Soft White (#F8F8F8) with a 1px border in Alabaster Warm Cream. 
- Focus state: Border changes to Branding Deep with a 2px soft outer glow.

### Chips & Tags
- Used for therapy specialties or session types. 
- Soft, low-contrast backgrounds (Primary color at 20% opacity) with text in Dark Charcoal.

### Feedback Indicators
- **Success:** Use Turquoise Green (#00E2B1) for checkmarks or "Booking Confirmed" states.
- **Progress Bars:** Use a smooth transition from Secondary Ochre to Turquoise Green to symbolize growth and healing.