# temme.cloud Corporate Design & Styleguide

This document defines the visual language for the temme.cloud website. It serves as the single source of truth for designers, developers, and contributors working on the site.

All values reference SCSS variables defined in the codebase. Do not hard-code color values in templates — always use the corresponding variable.

---

## Table of Contents

1. [Brand Colors](#brand-colors)
2. [Community Sub-Palette](#community-sub-palette)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Breakpoints](#breakpoints)
6. [Components](#components)
7. [Section Patterns](#section-patterns)
8. [Icons](#icons)
9. [Interactive States](#interactive-states)
10. [Header](#header)
11. [Footer](#footer)
12. [Do's and Don'ts](#dos-and-donts)

---

## Brand Colors

The primary palette is built around petrol green. It appears across hero sections, the footer, CTAs, and all corporate-facing pages.

| Role               | Hex       | SCSS Variable              | Usage                                      |
|--------------------|-----------|----------------------------|---------------------------------------------|
| Primary (Petrol)   | `#007163` | `$light-background`        | Hero backgrounds, footer, CTA fills         |
| Secondary          | `#4a8a7c` | `$light-background-secondary` | Lighter petrol, borders, secondary surfaces |
| Light Teal         | `#d9f2ec` | `$light-color-variant`     | Emphasis backgrounds, highlights            |
| Border Green       | `#5e9e8f` | `$light-border-color`      | Card borders, dividers                      |
| Body Text          | `#4d4d4d` | `$dark-grey`               | Default text on white backgrounds           |
| White              | `#ffffff` | `$light-color`             | Text on green, card backgrounds             |
| Accent Blue        | `#3eb0ef` | —                          | Blockquote left-borders only                |

**Accent Blue is strictly limited to blockquote styling.** It does not appear anywhere else in the design system.

---

## Community Sub-Palette

The community page (`/community/`) uses a warm-shifted variant of the brand palette. These colors are **page-scoped** and must never bleed into corporate or services pages.

| Role                 | Hex       | Usage                                    |
|----------------------|-----------|------------------------------------------|
| Warm Primary         | `#c2785c` | Accent borders, hover states, icon tints |
| Warm Background      | `#faf6f2` | Section backgrounds                      |
| Warm Background Deep | `#f3ebe3` | Alternating section backgrounds          |
| Warm Text            | `#5c4a3d` | Body text on warm backgrounds            |
| Hero Start           | `#2a7a6e` | Gradient start (warm-shifted petrol)     |
| Hero End             | `#1a6b5f` | Gradient end (deeper warm petrol)        |
| Green Warm           | `#3d8c7a` | Links and labels on warm backgrounds     |

---

## Typography

All fonts are loaded via Adobe Typekit. No additional font services or self-hosted font files should be added.

**Typekit Kit:** `https://use.typekit.net/clz1zkl.css`
**Loading:** Preconnect hint to `https://use.typekit.net`, `font-display: swap` on all faces.

### Font Families

| Role     | Font              | Fallback Stack                                                                 |
|----------|-------------------|--------------------------------------------------------------------------------|
| Headings | houschka-rounded  | sans-serif                                                                     |
| Body     | nunito-sans       | -apple-system, BlinkMacSystemFont, "Roboto", "Segoe UI", Helvetica, Arial, sans-serif |
| Code     | ubuntu-mono       | Consolas, Monaco, Andale Mono, monospace                                       |

### Base Settings

| Property       | Value    |
|----------------|----------|
| Font size      | `1rem`   |
| Line height    | `1.54`   |
| Letter spacing | `0.06em` |

### Usage Rules

- **All headings and navigation items** use houschka-rounded.
- **All body copy, paragraphs, and form labels** use nunito-sans.
- **Code blocks and inline code** use ubuntu-mono.
- Heading weight: bold (700). Button labels: semi-bold (600).

---

## Spacing & Layout

| Property          | Value   | SCSS Variable      |
|-------------------|---------|---------------------|
| Max content width | `860px` | `$max-width`        |
| Body padding-top  | `80px`  | — (fixed header offset) |

Content is consistently centered with `max-width` and auto margins. Sections that need full-bleed backgrounds use a full-width wrapper with centered inner content.

---

## Breakpoints

| Name   | Condition         | SCSS Variable          |
|--------|-------------------|------------------------|
| Phone  | `max-width: 684px` | `$media-size-phone`   |
| Tablet | `max-width: 900px` | `$media-size-tablet`  |

- Cards collapse from 3-column grid to 1-column at the phone breakpoint.
- Navigation collapses to a mobile menu at the tablet breakpoint.

---

## Components

### Buttons

Two primary button styles. Both use pill-shaped borders and houschka-rounded font.

**Shared properties:**
- Border radius: `50px` (pill)
- Padding: `14px 32px`
- Font weight: `600`
- Font family: houschka-rounded
- Transition: `0.2s ease`

#### `.btn-filled`

| Context         | Background | Text    | Border  |
|-----------------|------------|---------|---------|
| On white page   | `#007163`  | `#fff`  | none    |
| On green section| `#ffffff`  | `#007163` | none  |
| Community footer| `#c2785c`  | `#fff`  | none    |

#### `.btn-outline`

| Context         | Background    | Text      | Border            |
|-----------------|---------------|-----------|-------------------|
| On white page   | transparent   | `#007163` | `2px solid #007163` |
| On green section| transparent   | `#ffffff` | `2px solid #ffffff` |
| Community footer| transparent   | `#c2785c` | `2px solid #c2785c` |

**Hover:** Subtle background shift (tinted fill on outline buttons, slightly darker fill on filled buttons).

---

### Cards

All cards share a consistent structure: rounded corners, border, optional gradient background, and a subtle hover lift.

#### Service Cards
- Border radius: `14px`
- Background: linear-gradient
- Border: `1px solid`
- Hover: `translateY(-2px)` + `box-shadow: 0 6px 20px rgba(0,0,0,0.06)`
- Desktop layout: 3-column grid
- Mobile layout: 1-column stack

#### Project Cards
- Same dimensions and hover behavior as service cards
- 3-column grid on desktop, 1-column on mobile

#### Reason Cards
- Border radius: `12px`
- Stacked column layout (no grid)

#### Community Page Cards
- Same structure but use the warm sub-palette colors
- Warm box-shadow equivalent on hover

---

### Callout Blocks

Centered content blocks used for key messages or CTAs within page sections.

- Border radius: `16px`
- Max width: `800px`
- Centered horizontally

**Variant: `--green-tint`**
- On community pages: terracotta tint background + `3px` left border in `#c2785c`

---

### Tag Cloud

Pill-shaped tags used for technology labels, skill tags, and categorization.

- Border radius: `20px`
- Padding: `6px 12px`
- Hover: border color shift, text color shift, subtle background tint

---

## Section Patterns

Sections alternate between background styles to create visual rhythm.

| Class             | Background | Text      | Usage                          |
|-------------------|------------|-----------|--------------------------------|
| `.post--white`    | `#ffffff`  | `#4d4d4d` | Default content pages          |
| `.section-grey`   | light grey | `#4d4d4d` | Alternating content sections   |
| `.section-warm`   | `#faf6f2`  | `#5c4a3d` | Community page sections        |
| Green sections    | `#007163`  | `#ffffff` | Hero, footer, highlight blocks |

- Community pages use warm variants (`#faf6f2` / `#f3ebe3`) instead of cool greys.
- Corporate pages use cool grey alternating sections.
- Never mix warm and cool section styles on the same page.

---

## Icons

All icons are inline SVGs following the Feather icon style.

| Property     | Value           |
|--------------|-----------------|
| Size         | `16px` - `20px` |
| Stroke       | `currentColor`  |
| Stroke width | `2`             |
| Fill         | `none`          |

Using `currentColor` ensures icons inherit the text color of their parent, making them flexible across light and dark backgrounds.

**Decorative symbols** used in section headers:

- `\u2726` (four-pointed star)
- `\u25C6` (diamond)
- `\u27E1` (concave diamond)

---

## Interactive States

All interactive elements follow consistent transition timing.

| Element       | Hover Effect                                         | Transition     |
|---------------|------------------------------------------------------|----------------|
| Cards         | `translateY(-2px)`, `box-shadow: 0 6px 20px rgba(0,0,0,0.06)` | `0.15s ease` |
| Buttons       | Background color shift                               | `0.2s ease`    |
| Links         | Color change + underline                             | `0.2s ease`    |
| Tags          | Border + text color shift, background tint           | `0.15s ease`   |
| Card borders  | Border-color shift on hover                          | `0.15s ease`   |

Card hover lift must not exceed `2px`. Shadows must stay subtle — no heavy drop shadows anywhere.

---

## Header

- **Position:** Fixed, top of viewport
- **Background:** `#ffffff`
- **Z-index:** `9999`
- **Layout:** Logo left, navigation right
- **Navigation font:** houschka-rounded
- **CTA button:** Appears in the nav bar (links to delivery-check or tech-sprechstunde)
- **Body offset:** `padding-top: 80px` on the body to prevent content from hiding behind the fixed header

---

## Footer

- **Background:** `#007163` (petrol green)
- **Text color:** `#ffffff`
- **Content:** Company address, discover links, legal links
- **Logo:** White variant of the temme.cloud logo
- **Layout:** Multi-column on desktop, stacked on mobile

---

## Do's and Don'ts

### Do

- Use petrol green (`#007163`) as the primary brand anchor across all pages.
- Maintain generous whitespace and centered layouts (max-width `860px`).
- Use the warm palette **only** on community-facing pages.
- Keep card hover effects subtle — maximum `2px` vertical lift.
- Use houschka-rounded for all headings and navigation text.
- Use inline SVGs with `stroke="currentColor"` for icon flexibility.
- Maintain WCAG AA contrast ratios on all text.
- Reference SCSS variables for all color values.

### Don't

- Don't use warm terracotta colors (`#c2785c`) on corporate or services pages.
- Don't mix warm and cool card styles on the same page.
- Don't use heavy drop shadows anywhere.
- Don't add custom fonts outside of Typekit — everything loads through the existing kit.
- Don't hard-code hex values in templates — always use SCSS variables.
- Don't break the centered layout pattern (especially on community pages).
- Don't use Accent Blue (`#3eb0ef`) outside of blockquote borders.
