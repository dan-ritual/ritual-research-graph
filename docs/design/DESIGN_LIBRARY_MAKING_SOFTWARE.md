# Design Library: Making Software Aesthetic
## Ritual Intelligence Microsite Design System

> **CANONICAL DESIGN REFERENCE** — This is the authoritative design system for all Ritual Research Graph frontend work.

---

## Status & Usage

| Aspect | Value |
|--------|-------|
| **Status** | Active — Canonical Reference |
| **Applies To** | Portal UI + Generated Microsites |
| **Elicitation Spec** | [`docs/specs/SPEC_PORTAL_DESIGN_OVERHAUL.md`](../specs/SPEC_PORTAL_DESIGN_OVERHAUL.md) |
| **Reference Implementation** | `outputs/microsites/rwa-defi-jan-2026/src/App.jsx` |
| **Last Updated** | 2026-01-16 |

**IMPORTANT:** All frontend PRs must align with this design system. When in doubt, reference the microsite implementation.

---

# Source Analysis

**Reference:** https://www.makingsoftware.com/
**Creator:** Dan Hollick
**Style:** Technical reference manual / Blueprint aesthetic

---

# Core Design Philosophy

## Aesthetic Principles

1. **Technical Documentation Feel** — Evokes engineering drawings, blueprints, reference manuals
2. **Clean White Space** — Generous margins, breathing room between elements
3. **Monochromatic + Accent** — Near-black text on off-white, single cobalt blue accent
4. **Illustration-Forward** — Large isometric/technical diagrams as primary visual elements
5. **Typographic Hierarchy** — Monospace for headers/labels, serif for body
6. **Grid/Blueprint Elements** — Dotted grid backgrounds, measurement annotations, figure numbers

---

# Color Palette

## Core Colors

```
Background:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Base:        #FBFBFB  (off-white, warm paper)
  Alt:         #FAF9F5  (slightly warmer cream)

Foreground:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Primary:     #171717  (near-black, not pure black)
  Secondary:   rgba(0,0,0,0.5)  (50% black for labels)
  Muted:       rgba(0,0,0,0.2)  (20% black for grid lines)

Cobalt Blue Scale (Accent):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  50:          oklch(97.05% .0054 274.97)  → ~#F5F7FF (lightest fill)
  100:         oklch(94.22% .0275 274.66)  → ~#E8EDFF
  200:         oklch(83.76% .0774 273.32)  → ~#C5D3FF
  300:         oklch(76.12% .1218 272.4)   → ~#9BB3FF (primary fill)
  400:         oklch(63.79% .1899 269.89)  → ~#6B8AFF
  600:         oklch(50.58% .2886 264.84)  → ~#3B5FE6 (strokes/lines)
```

## Tailwind Translation

```javascript
// tailwind.config.js
colors: {
  background: '#FBFBFB',
  foreground: '#171717',

  cobalt: {
    50: '#F5F7FF',
    100: '#E8EDFF',
    200: '#C5D3FF',
    300: '#9BB3FF',  // Primary fill for illustrations
    400: '#6B8AFF',
    500: '#4B6FE8',
    600: '#3B5FE6',  // Primary stroke color
    700: '#2A4BC5',
    800: '#1E3A9E',
    900: '#142B7A',
  },

  muted: {
    50: 'rgba(0,0,0,0.05)',
    100: 'rgba(0,0,0,0.1)',
    200: 'rgba(0,0,0,0.2)',
    500: 'rgba(0,0,0,0.5)',
    700: 'rgba(0,0,0,0.7)',
  }
}
```

---

# Typography

## Font Stack

```
Display/Headers:  "Departure Mono", monospace
                  Fallback: "SF Mono", "Fira Code", "Consolas", monospace

Body Text:        "New York", Georgia, serif
                  Fallback: "Iowan Old Style", "Palatino", serif

Labels/Captions:  "Departure Mono", monospace (smaller size)
```

## Type Scale

```
Hero Title:       60px / 400 / -3px letter-spacing / UPPERCASE
Section Headers:  16px / 400 / 0 letter-spacing / UPPERCASE / monospace
Body Text:        16px / 400 / 24px line-height / serif
Labels:           10px / 400 / monospace / rgba(0,0,0,0.5)
Captions:         12px / 400 / monospace
Links:            16px / same as body / no underline default
```

## Tailwind Typography Config

```javascript
// tailwind.config.js
fontFamily: {
  mono: ['"Departure Mono"', '"SF Mono"', '"Fira Code"', 'monospace'],
  serif: ['"New York"', 'Georgia', '"Iowan Old Style"', 'serif'],
},

fontSize: {
  'hero': ['60px', { lineHeight: '1.1', letterSpacing: '-0.05em' }],
  'section': ['16px', { lineHeight: '1.5', letterSpacing: '0.05em' }],
  'body': ['16px', { lineHeight: '1.5' }],
  'label': ['10px', { lineHeight: '1.4' }],
  'caption': ['12px', { lineHeight: '1.4' }],
}
```

---

# Spacing System

## Base Unit: 8px

```
Spacing Scale:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  xs:    8px   (0.5rem)
  sm:    16px  (1rem)
  md:    24px  (1.5rem)
  lg:    40px  (2.5rem)  — Container padding
  xl:    64px  (4rem)
  2xl:   80px  (5rem)
  3xl:   120px (7.5rem)
```

## Layout

```
Container:
  max-width: 1536px
  padding: 40px

Content Columns:
  Two-column grid with generous gutter (48-64px)
  Each column: ~480px max for text

Vertical Rhythm:
  Between sections: 80-120px
  Between paragraphs: 24px (line-height)
  Between heading and content: 16-24px
```

---

# Component Patterns

## 1. Hero Section

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│     MAKING SOFTWARE                     [subtitle/tagline]      │
│     ═══════════════════                 [author line]           │
│                                                                 │
│     ▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪   │
│     (dotted separator line)                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

CSS:
- Title: font-mono text-hero uppercase tracking-tighter
- Subtitle: font-serif text-body text-right
- Separator: 1px dotted rgba(0,0,0,0.3)
```

## 2. Two-Column Layout

```
┌───────────────────────────────┬───────────────────────────────┐
│                               │                               │
│   [Body text paragraph        │   [Technical illustration     │
│    in serif font with         │    in cobalt blue with        │
│    justified alignment]       │    annotations/labels]        │
│                               │                               │
│   [Another paragraph...]      │   FIG.001 ─────────────┐     │
│                               │   [ COMPONENT NAME ]    │     │
│                               │   └────────────────────┘     │
│                               │                               │
└───────────────────────────────┴───────────────────────────────┘

CSS:
- Left column: font-serif text-body text-justify
- Right column: flex items-center justify-center
- Gutter: 48-64px
```

## 3. Figure/Illustration Block

```
┌─────────────────────────────────────────────────────────────────┐
│  FIG.001                                    [ TITLE LABEL ]     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │             [Isometric technical drawing               │   │
│  │              with cobalt-300 fills and                 │   │
│  │              cobalt-600 strokes]                       │   │
│  │                                                         │   │
│  │    ← ANNOTATION LABEL                                  │   │
│  │                          ANOTHER LABEL →               │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                      [ 1988 ]   │
└─────────────────────────────────────────────────────────────────┘

CSS:
- Figure number: font-mono text-label text-muted-500 rotate-[-90deg]
- Title label: font-mono text-label uppercase tracking-wide
- Annotations: font-mono text-label text-cobalt-600
- Date/year: font-mono text-label text-muted-500 rotate-[90deg]
```

## 4. Table of Contents

```
┌─────────────────────────────────────────────────────────────────┐
│  TABLE OF CONTENTS [v1.0]                  [ SECTIONS: 8 ... ]  │
│  ════════════════════════════════════════════════════════════   │
│                                                                 │
│  1. PIXELS AND COLOR              5. DATA AND COMPRESSION       │
│  ────────────────────             ─────────────────────         │
│  • How does a screen work?        • Bits, bytes and binary.     │
│  • What is a color space? ─ 6.2K  • Entropy and compression.    │
│  • Color contrast.                • Image compression.          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

CSS:
- Section headers: font-mono text-section uppercase tracking-wider
- Chapter items: font-serif text-body
- Word counts: font-mono text-caption text-muted-500
- Dotted leaders: border-b border-dotted border-muted-200
```

## 5. Form Elements

```
┌─────────────────────────────────────────────────────────────────┐
│  SIGNUP FOR UPDATES:                                            │
│  ─────────────────────                                          │
│  [Description text in italic serif...]                          │
│                                                                 │
│  ┌─────────────────────────┐  ┌───────────────────┐            │
│  │ ENTER YOUR EMAIL        │  │  JOIN MAILING LIST │            │
│  └─────────────────────────┘  └───────────────────┘            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

CSS:
- Input:
  border: 1px solid rgba(0,0,0,0.5)
  border-radius: 4px
  padding: 0 8px
  font-mono text-caption uppercase
  placeholder: text-muted-500

- Button:
  border: 1px solid rgba(0,0,0,0.5)
  border-radius: 4px
  padding: 8px 16px
  font-mono text-caption uppercase
  background: transparent
  hover: background rgba(0,0,0,0.05)
```

## 6. FAQ/Accordion Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│  COMMON QUESTIONS                                               │
│  ════════════════                                               │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  IN:  IS THIS A PHYSICAL BOOK?                    ↑ ↓   │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  OUT: No, it's a digital book for now.                  │   │
│  │                                                         │   │
│  │       [Expanded content in serif...]                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  How much will it cost?                                         │
│  What font is this?                                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

CSS:
- Question header: font-mono text-body
- IN/OUT labels: font-mono text-caption uppercase text-muted-500
- Answer content: font-serif text-body
- Collapsed items: font-serif text-body italic text-muted-700
```

---

# Illustration Style Guide

## Technical Drawing Aesthetic

```
Colors:
  Fills:     cobalt-300 (#9BB3FF) — primary surfaces
             cobalt-50 (#F5F7FF) — highlights
             cobalt-200 (#C5D3FF) — secondary surfaces

  Strokes:   cobalt-600 (#3B5FE6) — outlines, 1-2px
             cobalt-400 (#6B8AFF) — secondary lines

  Annotations: cobalt-600 — leader lines and labels

Style:
  - Isometric projection (30° angles)
  - Clean geometric shapes
  - Exploded views for complex objects
  - Grid/graph paper backgrounds (subtle)
  - Measurement annotations
  - Leader lines with text labels
  - No drop shadows
  - No gradients (flat fills only)
```

## Grid Background Pattern

```css
.grid-bg {
  background-image:
    linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px);
  background-size: 20px 20px;
}
```

---

# Animation Patterns

## Minimal, Functional Animations

```
Transitions:
  Default duration: 250ms
  Easing: ease-out

Hover States:
  - Links: No underline → underline (slide in from left)
  - Buttons: background-color shift (transparent → rgba(0,0,0,0.05))
  - Cards: No transform/lift effects

Interactive Elements:
  - Bezier curve animation on illustrations (demonstrated on site)
  - Smooth expand/collapse for accordions

NO:
  - Parallax scrolling
  - Heavy transforms
  - Scale/rotation on hover
  - Drop shadows appearing on hover
```

---

# Responsive Considerations

```
Breakpoints:
  Mobile:   < 768px  — Single column, full-width illustrations
  Tablet:   768-1024px — Two column, smaller illustrations
  Desktop:  > 1024px — Full two-column layout
  Wide:     > 1536px — Centered with max-width container

Mobile Adaptations:
  - Stack columns vertically
  - Full-width illustrations
  - Maintain typography scale
  - Reduce margins (40px → 24px)
  - Figure labels move above illustrations
```

---

# Implementation Notes for Ritual Microsite

## Adaptation Strategy

The Making Software aesthetic translates well to the Ritual Intelligence microsite with these modifications:

1. **Keep:**
   - Off-white background
   - Monospace headers
   - Serif body text
   - Two-column layouts
   - Figure/annotation patterns
   - Minimal form styling

2. **Adapt:**
   - Replace cobalt blue with **Ritual brand color** (indigo/violet gradient could map to cobalt scale)
   - Technical illustrations → **Data visualizations, architecture diagrams**
   - Figure numbers → **Section/Question numbers**
   - Book chapters → **Strategic questions, transcript sections**

3. **Add:**
   - Navigation patterns (the source is single-page)
   - Card components for landing page
   - Tier badges for Narrative Atlas
   - Interactive filters

## Color Mapping Suggestion

```
Making Software       →    Ritual Adaptation
─────────────────────────────────────────────
#FBFBFB (bg)          →    #FBFBFB (keep)
#171717 (text)        →    #171717 (keep)
cobalt-300 (fill)     →    indigo-300 (#A5B4FC)
cobalt-600 (stroke)   →    indigo-600 (#4F46E5)
```

---

*Design library extracted from makingsoftware.com on January 15, 2026*
*For internal use in Ritual Intelligence Microsite development*
