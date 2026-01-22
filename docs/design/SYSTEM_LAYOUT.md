# System Layout

## Grid System
- **Container:** Max-width 1536px
- **Padding:** 40px (horizontal)
- **Columns:** Two-column grid (where applicable)
- **Gutter:** 48-64px

## Backgrounds
- **Global:** `var(--background)`
- **Pattern:** Dot grid or line grid on specific content areas
  - CSS: `linear-gradient(rgba(0,0,0,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.018) 1px, transparent 1px)`
  - Size: 20px 20px

## Vertical Rhythm
- **Between Sections:** 80-120px
- **Between Paragraphs:** 24px (line-height)
- **Heading to Content:** 16-24px

## Breakpoints
- **Mobile:** < 768px
  - Single column
  - Full-width illustrations
  - Reduced margins (24px)
- **Tablet:** 768px - 1024px
  - Two column
  - Smaller illustrations
- **Desktop:** > 1024px
  - Full two-column layout
- **Wide:** > 1536px
  - Centered container
