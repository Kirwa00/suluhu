---
name: Suluhu Wellness System
colors:
  surface: '#f8fafb'
  surface-dim: '#d8dadb'
  surface-bright: '#f8fafb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f5'
  surface-container: '#eceeef'
  surface-container-high: '#e6e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#424750'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#eff1f2'
  outline: '#737781'
  outline-variant: '#c2c6d1'
  surface-tint: '#305f9d'
  primary: '#00386d'
  on-primary: '#ffffff'
  primary-container: '#1b4f8c'
  on-primary-container: '#9cc2ff'
  inverse-primary: '#a7c8ff'
  secondary: '#166a59'
  on-secondary: '#ffffff'
  secondary-container: '#a5f2db'
  on-secondary-container: '#1f705f'
  tertiary: '#003d52'
  on-tertiary: '#ffffff'
  tertiary-container: '#005571'
  on-tertiary-container: '#7acaf2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d5e3ff'
  primary-fixed-dim: '#a7c8ff'
  on-primary-fixed: '#001c3b'
  on-primary-fixed-variant: '#0d4784'
  secondary-fixed: '#a5f2db'
  secondary-fixed-dim: '#89d5c0'
  on-secondary-fixed: '#002019'
  on-secondary-fixed-variant: '#005142'
  tertiary-fixed: '#c1e8ff'
  tertiary-fixed-dim: '#81d0f8'
  on-tertiary-fixed: '#001e2b'
  on-tertiary-fixed-variant: '#004d67'
  background: '#f8fafb'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
  surface-soothing: '#F0F4F8'
  text-rich-slate: '#1C1E21'
  success-calm: '#2E8555'
  accent-teal-light: '#E8F3F1'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  section-gap: 80px
---

## Brand & Style

The design system is anchored in the concept of "Suluhu"—a Swahili word meaning "solution" or "reconciliation." The brand personality is professional, calm, and profoundly trustworthy, designed to serve a mental health community with dignity and stability. 

The aesthetic follows a **Modern Corporate** direction with a focus on psychological safety. It prioritizes clarity over flair, utilizing generous whitespace to reduce cognitive load and prevent visual stress. Every element is designed to feel "grounded"—achieved through a balanced use of deep oceanic blues and organic teals. The interface should feel like a quiet, well-organized office: supportive, reliable, and accessible.

## Colors

The palette is strategically chosen to evoke stability (Deep Trust Blue) and growth (Calm Teal). 

- **Primary (#1B4F8C):** Used for core branding, headers, and primary navigation to establish authority and trust.
- **Secondary (#0E6655):** Used for restorative actions and health-related indicators.
- **Tertiary (#2E86AB):** A lighter, more energetic blue used for secondary interactions that require focus without creating urgency.
- **Surface Strategy:** We avoid pure white (#FFFFFF) for large background areas to reduce eye strain. Instead, `surface-soothing` and the neutral base provide a soft, "off-white" canvas that feels more approachable.
- **Text:** High-contrast slate (#1C1E21) is used instead of pure black to maintain readability while appearing more sophisticated and less "harsh."

## Typography

This design system uses a dual-font approach to balance character with utility. **Manrope** is used for headlines to provide a modern, refined, and geometric feel that looks professional yet friendly. **Inter** is used for all body text and UI labels due to its exceptional legibility and systematic, neutral nature.

**Internationalization (English & Swahili):**
- Line heights are slightly more generous (1.5x for body) to accommodate Swahili descriptors which can often be longer than their English counterparts. 
- Avoid fixed-width containers for labels; allow for horizontal expansion to prevent text clipping in Swahili translations.

## Layout & Spacing

The layout philosophy is centered on a **Fixed Grid** for desktop (12 columns) and a **Fluid Grid** for mobile (4 columns). 

- **Rhythm:** An 8px base unit drives all spacing. 
- **Generosity:** We employ "Generous Whitespace." Section gaps are intentionally large (80px+) to allow the user's eyes to rest between different content blocks.
- **Reflow:** On mobile, side margins shrink to 16px, and complex multi-column grids must collapse into a single-column vertical stack to maintain readability for therapy seekers on the go.

## Elevation & Depth

To maintain a "calm" environment, this design system avoids heavy shadows or aggressive depth. 

- **Tonal Layering:** Depth is primarily communicated through subtle shifts in background color (e.g., a slightly darker surface for a card sitting on a light background).
- **Soft Ambient Shadows:** Where elevation is necessary (like a floating action button or a modal), use very large blur radii (24px+) with extremely low opacity (5-8%) tinted with the Primary Blue. This creates a "lifted" effect rather than a "floating" one.
- **Interactive States:** Use subtle inner shadows or 1px strokes in a lighter shade of the primary color to indicate "pressed" or "active" states without adding visual noise.

## Shapes

The shape language is consistently **Rounded**. 

- **Standard Elements:** Buttons, input fields, and small cards use a 0.5rem (8px) radius.
- **Large Containers:** Content sections or primary feature cards use a 1rem (16px) radius to feel softer and more inviting.
- **Consistency:** Never use sharp 90-degree corners, as they can feel "aggressive" or "clinical" in a mental health context. The goal is to feel organic and safe.

## Components

### Buttons
- **Primary:** Solid #1B4F8C with white text. High contrast but with the 8px rounded corner.
- **Secondary:** Outline button with #1B4F8C border and text. Use for less critical actions like "Learn More."
- **Ghost:** No border, Teal text. Used for tertiary actions to keep the UI clean.

### Input Fields
- Use a soft background (#F0F4F8) instead of a white background to differentiate the field from the page.
- Focus states should use a 2px solid border in Action Accent (#2E86AB) to clearly guide the user.

### Cards
- Cards should have a 1px border (#E2E8F0) and no shadow by default. 
- On hover, cards can transition to a very soft ambient shadow to indicate interactivity.

### Chips & Tags
- Used for therapy specialties (e.g., "Counseling," "Youth"). Use the Secondary Teal at 10% opacity for the background and 100% opacity for the text.

### Progress Indicators
- For intake forms, use a soft horizontal progress bar in Action Accent. Avoid "ticking clocks" or high-pressure countdowns; the tone should always be "take your time."