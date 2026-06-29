---
name: Suluhu Crisis Core
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf1'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fa'
  on-surface: '#111c2c'
  on-surface-variant: '#424750'
  inverse-surface: '#263142'
  inverse-on-surface: '#ebf1ff'
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
  tertiary: '#642400'
  on-tertiary: '#ffffff'
  tertiary-container: '#893400'
  on-tertiary-container: '#ffae89'
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
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb595'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7c2e00'
  background: '#f9f9ff'
  on-background: '#111c2c'
  surface-variant: '#d8e3fa'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  title-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
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
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  action-xl:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 32px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-padding-mobile: 24px
  container-padding-desktop: 80px
  gutter: 16px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style
The design system is engineered for high-stakes emotional environments where cognitive load must be kept to an absolute minimum. The brand personality is **composed, authoritative, and protective**. It prioritizes immediate utility over aesthetic flourish, ensuring that users in distress feel held by a stable, predictable interface.

The design style is a refined **Minimalism** with a focus on **Functional Clarity**. By utilizing expansive whitespace and a structured typographic hierarchy, the system guides the eye toward life-saving actions without inducing panic. Every element is designed to evoke a sense of safety and "grounded urgency"—acknowledging the seriousness of the moment while providing a steady path forward.

## Colors
This design system utilizes a high-trust palette designed to stabilize the user's emotional state.
- **Deep Trust Blue (#1B4F8C):** The primary color, used for core navigation and structural reliability.
- **Calm Teal (#0E6655):** Used for therapeutic pathways and positive "grounding" actions.
- **Safety Amber (#D35400):** Used for critical alerts that require attention but must not cause visual stress or "alarm fatigue."
- **Surface Container Lowest (#FFFFFF):** The mandatory background color to ensure maximum contrast and a "breathable" interface.

Color is used sparingly to denote actionability and importance. Avoid gradients or high-vibrancy overlays that might distract or overstimulate.

## Typography
The system exclusively uses **Inter** for its exceptional legibility and neutral, modern tone. 
- **Hierarchy:** Clear distinction between headers and body text is vital. Use `display-lg` for primary crisis statements (e.g., "You are not alone.").
- **Readability:** Body text is set with generous line heights to prevent "wall of text" anxiety. 
- **Action-focused:** Use `action-xl` for primary call-to-action buttons (Dial/Chat) to ensure they are the most legible elements on the screen.

## Layout & Spacing
The layout uses a **fixed-width centered container** on desktop to keep information focused in the user's primary field of vision. On mobile, it transitions to a fluid grid with generous margins.

- **Vertical Rhythm:** Use `stack-lg` between major sections to prevent the UI from feeling cluttered.
- **Touch Targets:** All interactive elements must maintain a minimum 56px height to accommodate shaky hands or high-stress interaction.
- **Safe Zones:** The "Immediate Exit" button must be pinned to a consistent, easily accessible location (Top Right or Bottom Fixed Bar) with surrounding white space to prevent accidental clicks.

## Elevation & Depth
To maintain a sense of "grounding," this design system avoids complex shadows or floating elements. 
- **Tonal Layers:** Subtle surface differentiation is used instead of shadows. Use a very light grey (#F7FAFC) for container backgrounds to separate "Resource Cards" from the primary white background.
- **Low-Contrast Outlines:** Use 1px borders in `Neutral 200` to define input fields and secondary cards.
- **No Blurs:** Avoid glassmorphism or background blurs as they can feel disorienting or "unstable" to users in crisis.

## Shapes
The shape language uses **Rounded (0.5rem)** corners. This provides a "softened" professional look—less aggressive than sharp corners, but more serious and stable than pill-shaped elements.
- **Buttons:** Standard buttons use 0.5rem radius.
- **Crisis Cards:** Large containers use `rounded-lg` (1rem) to create a gentle, framing effect around sensitive content.

## Components
- **Emergency Action Buttons:** Primary crisis buttons (e.g., "Call Now") should use the `Deep Trust Blue` background with white text and a minimum height of 64px. 
- **Grounding Modules:** These should be styled as `Calm Teal` outlined cards, using soft iconography and step-by-step instructions (e.g., "Breathe with us").
- **Immediate Exit:** A high-visibility button, often styled with a `Safety Amber` border, that instantly clears the screen or redirects to a neutral site (like Google).
- **Resource Lists:** High-contrast list items with large tap targets and clear chevron indicators for navigation.
- **Input Fields:** Large, clearly labeled fields with high-contrast focus states to ensure users can easily request help without errors.
- **Progress Steppers:** When guiding through a process, use simple, horizontal dots to show progress without creating a sense of a "long journey."