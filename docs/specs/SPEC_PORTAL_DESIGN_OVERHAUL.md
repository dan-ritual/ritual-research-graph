# Specification: Portal Design Overhaul

**Parent:** [`SPEC_PORTAL_UI.md`](./SPEC_PORTAL_UI.md)
**Sequence:** Child Spec #4a (Design Focus)
**Phase:** 2 (Portal MVP - Visual Refinement)
**Status:** Ready for Implementation
**Created:** 2026-01-16
**Last Updated:** 2026-01-16

---

## Goal

The portal currently uses generic shadcn/ui defaults that do not align with the distinctive "Making Software" aesthetic established in our generated microsites. This specification defines the visual overhaul required to bring the portal's look and feel into alignment with the institutional, research-grade design language used across Ritual Research Graph outputs. The overhaul will adopt the same typography system (JetBrains Mono for UI, Crimson Text for body, Space Grotesk for display), color palette (#FBFBFB background, #3B5FE6 accent), and visual patterns (subtle grid background, dotted dividers, uppercase monospace section headers) that define the Making Software aesthetic. The result should be a portal that feels like a natural extension of the microsites it generates—clean, institutional, and distinctively non-generic.

---

## Reference Implementation

The Making Software design system is implemented in:
- `outputs/microsites/rwa-defi-jan-2026/src/App.jsx`

### Design Tokens (from reference)

```javascript
const FONTS = {
  mono: '"JetBrains Mono", "SF Mono", "Consolas", monospace',
  serif: '"Crimson Text", Georgia, "Times New Roman", serif',
  display: '"Space Grotesk", "Inter", system-ui, sans-serif',
};

const COLORS = {
  background: '#FBFBFB',
  text: '#171717',
  accent: '#3B5FE6',
  muted: 'rgba(0,0,0,0.45)',
  border: 'rgba(0,0,0,0.08)',
  divider: 'rgba(0,0,0,0.05)',
};

const PATTERNS = {
  gridBackground: 'linear-gradient(rgba(0,0,0,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.018) 1px, transparent 1px)',
  gridSize: '20px 20px',
  dottedBorder: '1px dotted rgba(59,95,230,0.3)',
};
```

### Key Visual Patterns

1. **Section Headers**: Uppercase, mono font, 0.12em letter-spacing, accent color, dotted bottom border
2. **Cards**: White background, 1px solid rgba(0,0,0,0.08) border, no border-radius
3. **Thesis/Hero Text**: Serif font, italic, centered, dotted top/bottom borders
4. **Buttons**: Mono font, uppercase, 0.1em letter-spacing, minimal styling
5. **Links**: Accent color (#3B5FE6), dotted underline

---

## Elicitation Results

### Round 1: Scope & Structure

| Question | Decision |
|----------|----------|
| **Priority** | All pages simultaneously — inherit from Making Software root aesthetic |
| **Navigation** | Keep current nav structure, restyle with Making Software aesthetic |
| **Wizard UX** | Simple progress bar — subtle dotted line with accent indicator |
| **Background** | Selective use — grid on content areas only, solid white for forms |

### Round 2: Components & Typography

| Question | Decision |
|----------|----------|
| **Cards** | Sharp edges, 1px solid border (`rgba(0,0,0,0.08)`), no border-radius |
| **Typography** | Full Making Software system: Space Grotesk (display), JetBrains Mono (UI), Crimson Text (body) |
| **Buttons** | Current shadcn but restyled with accent color (`#3B5FE6`) and mono font |
| **Status Colors** | Semantic colors (green/yellow/red), styled with mono font and uppercase |

### Round 3: Polish & Details

| Question | Decision |
|----------|----------|
| **Hero Text** | Centered italic serif (22px Crimson Text, dotted top/bottom borders) |
| **Accent Usage** | Prominent — section headers, links, primary buttons, active states |
| **Loading States** | Minimal mono text ('LOADING...' uppercase, letter-spacing: 0.12em) |

---

## Implementation Tasks

### 1. Design Tokens Setup
- [ ] Create `src/styles/tokens.ts` with FONTS, COLORS, PATTERNS constants
- [ ] Add Google Fonts imports (JetBrains Mono, Crimson Text, Space Grotesk) to layout
- [ ] Update `tailwind.config.ts` with custom font families

### 2. Global Styles
- [ ] Update `globals.css` with base typography settings
- [ ] Set `#FBFBFB` as default background color
- [ ] Add grid background pattern as utility class
- [ ] Define dotted border utilities

### 3. Component Restyling

**Card Component** (`components/ui/card.tsx`)
- [ ] Remove border-radius (set to 0)
- [ ] Set border to `1px solid rgba(0,0,0,0.08)`
- [ ] White background

**Button Component** (`components/ui/button.tsx`)
- [ ] Apply mono font (JetBrains Mono)
- [ ] Add uppercase text-transform
- [ ] Set letter-spacing: 0.1em
- [ ] Primary variant: accent background (`#3B5FE6`)

**Badge Component** (`components/ui/badge.tsx`)
- [ ] Mono font, uppercase
- [ ] Dotted border variant for status indicators

**Section Headers Pattern**
- [ ] Create reusable section header component
- [ ] Mono font, uppercase, 0.12em letter-spacing
- [ ] Accent color text
- [ ] Dotted bottom border

### 4. Page Updates

**Dashboard (`/app/page.tsx`)**
- [ ] Apply grid background to stats area
- [ ] Restyle stat cards with sharp edges
- [ ] Update welcome message typography

**Generation Wizard (`/app/new/page.tsx`)**
- [ ] Replace stepper with dotted progress indicator
- [ ] Solid white background for form areas
- [ ] Serif body text for descriptions

**Job Status (`/app/jobs/[id]/page.tsx`)**
- [ ] Restyle pipeline stages with mono font
- [ ] Status badges with semantic colors + mono styling
- [ ] Apply section header pattern to "Pipeline Stages"

**Microsites List (`/app/microsites/page.tsx`)**
- [ ] Sharp-edged cards
- [ ] Grid background on card area
- [ ] Mono metadata text

**Microsite Detail (`/app/microsites/[slug]/page.tsx`)**
- [ ] Thesis block with centered italic serif, dotted borders
- [ ] Section headers with accent color
- [ ] Entity list with mono type labels

**Header Component (`components/layout/header.tsx`)**
- [ ] Keep structure, apply mono font to nav
- [ ] Accent color for logo/brand
- [ ] Subtle bottom border

### 5. Loading States
- [ ] Create `<Loading />` component: mono font, uppercase "LOADING...", 0.12em spacing
- [ ] Apply to all async boundaries

---

## Related Specifications

| Spec | Relationship |
|------|--------------|
| [`SPEC_PORTAL_UI.md`](./SPEC_PORTAL_UI.md) | Parent specification (functional) |
| [`MASTER_SPEC.md`](../MASTER_SPEC.md) | Project root |

---

*Specification created as part of Ritual Research Graph project.*
