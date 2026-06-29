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
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
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
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
The design system is centered on the concepts of sanctuary, accessibility, and professional warmth. Targeting individuals seeking mental health support, the interface must act as a calming presence, reducing the cognitive load and anxiety often associated with seeking therapy. 

The aesthetic direction is **Modern Minimalist with Tonal Warmth**. It avoids the sterile, clinical feel of traditional healthcare apps by utilizing a palette of earth tones and organic shapes. The visual language emphasizes "Safety" through generous whitespace, "Trust" through structured typography, and "Approachability" through soft, tactile UI elements. The result is a professional yet deeply human environment that feels like an architectural extension of a therapy room.

## Colors
The palette is divided into "Foundation" and "Utility" layers. 

- **Foundation:** The Primary Alabaster Cream and Secondary Warm Ochre form the base of the UI, used for large surfaces and branding elements to establish a grounded, earthy atmosphere. Soft White is the primary background to maintain a high-key, airy feeling.
- **Action & Accent:** Accent Coral is reserved for primary calls to action and highlights, providing a gentle "pop" that guides the eye without being aggressive. 
- **Secondary Palette:** Turquoise Green is utilized for positive feedback and success states. Deep Purple and Light Lavender are used sparingly for specialized categorization (e.g., specific therapy types or educational resources) to distinguish them from core functional paths.
- **Typography:** Dark Charcoal is used for all body text to ensure maximum legibility against the light surfaces, maintaining a high contrast ratio for accessibility.

## Typography
Manrope is the sole typeface for this design system, chosen for its geometric balance and excellent legibility across all screen sizes. 

- **Hierarchy:** Use semi-bold and bold weights for headings to create a clear structural anchor. Body text stays at the regular weight (400) with a generous 1.5x line height to prevent visual crowding.
- **Scale:** On mobile devices, large display headers must scale down significantly (see `display-lg-mobile`) to ensure titles do not break awkwardly or overwhelm the viewport. 
- **Accessibility:** Ensure that all body text remains at or above 16px to support users with varying visual needs. Label styles should be used for metadata and form captions, utilizing a slightly heavier weight to maintain readability at smaller sizes.

## Layout & Spacing
This design system utilizes a **Fluid-Fixed Hybrid Grid**. 

- **Grid:** A 12-column grid is used for desktop (max-width 1200px), transitioning to a 4-column grid for mobile.
- **Rhythm:** An 8px base unit drives all spacing decisions. Content "stacks" (vertical margins between sections) should use larger increments (32px or 48px) to create the "uncluttered" feel requested.
- **Negative Space:** Whitespace is a functional element in this system. Do not fear large gaps between disparate sections; they provide the user "breathing room" to process information.

## Elevation & Depth
Depth is conveyed through **Tonal Layering** rather than heavy shadows.

- **Surfaces:** Use the Soft White (`#F8F8F8`) for the base background. Content cards should use a pure white background or the Light Gray (`#F2F2F2`) to create a subtle lift.
- **Shadows:** When necessary for interactive elements like buttons or modals, use "Ambient Glows"—very soft, low-opacity shadows (Blur: 20px, Opacity: 4%) tinted with the Warm Ochre hex rather than pure black.
- **Borders:** Use 1px solid borders in the Alabaster Cream (`#E6C9A7`) to define boundaries without creating the visual weight of a shadow.

## Shapes
The shape language is defined by **Soft Continuity**. 

All primary containers, buttons, and input fields utilize a 0.5rem (8px) base radius. For cards and larger interactive components, the `rounded-lg` (16px) or `rounded-xl` (24px) settings should be applied to create a friendlier, non-threatening physical metaphor. Avoid sharp 90-degree corners entirely to maintain the "warmth and safety" narrative.

## Components
- **Buttons:** Primary buttons use the Accent Coral (`#E98A6C`) with white text. They should have a minimum height of 48px for touch accessibility. Secondary buttons use an Alabaster Cream outline.
- **Cards:** Cards are the primary vessel for information. They should feature a 1px border (`#E6C9A7`) and use `rounded-xl` (24px) corners. Inner padding should be a minimum of 24px.
- **Input Fields:** Fields use the Light Gray (`#F2F2F2`) background with a subtle Alabaster Cream bottom-border or full outline. Focus states should transition the border to Warm Ochre.
- **Chips/Badges:** Use the Secondary Palette (Turquoise/Lavender) for chips with 10% opacity backgrounds and 100% opacity text of the same hue.
- **Progress Indicators:** Use soft, rounded bars. For therapy journeys or onboarding, use Turquoise Green to signal positive progression.
- **Lists:** List items should be separated by Alabaster Cream dividers with generous vertical padding (16px) to ensure each item is distinct and easy to read.