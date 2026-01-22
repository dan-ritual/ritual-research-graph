/**
 * Making Software Design Tokens
 *
 * Institutional-grade design system derived from project-overview.html reference.
 * Aligned with docs/design/SYSTEM_TOKENS.md specification.
 *
 * RULES:
 * - Mono is DEFAULT typography; serif is opt-in
 * - Zero radius for all components (except status dots)
 * - Borders use alpha (rgba), never solid gray
 * - Mode mapping: Growth=Blue, Engineering=Green, Skunkworks=Red
 */

export const FONTS = {
  /** UI elements, section headers, labels, metadata (DEFAULT) */
  mono: '"JetBrains Mono", "SF Mono", monospace',
  /** Body text, descriptions, thesis statements (OPT-IN) */
  serif: '"Crimson Text", Georgia, serif',
  /** Page titles only */
  display: '"Space Grotesk", "Inter", system-ui, sans-serif',
} as const;

export const COLORS = {
  /** Page background - subtle off-white */
  background: '#FBFBFB',
  /** Primary text */
  foreground: '#171717',
  /** Card background */
  card: '#FFFFFF',

  /** Cobalt scale (base brand) */
  cobalt: {
    50: '#F5F7FF',
    100: '#E8EDFF',
    200: '#C5D3FF',
    300: '#9BB3FF',
    400: '#6B8AFF',
    600: '#3B5FE6',
  },

  /** Mode accents - use CSS variables for dynamic theming */
  mode: {
    growth: { accent: '#3B5FE6', light: '#9BB3FF' },      // Blue (default)
    engineering: { accent: '#3BE65B', light: '#9BFFB3' }, // Green
    skunkworks: { accent: '#E63B3B', light: '#FF9B9B' },  // Red
  },

  /** Muted scale (alpha-based, not solid gray) */
  muted: 'rgba(0,0,0,0.05)',
  mutedForeground: 'rgba(0,0,0,0.45)',
  mutedLight: 'rgba(0,0,0,0.2)',
  mutedLighter: 'rgba(0,0,0,0.08)',

  /** Borders and dividers (alpha-based) */
  border: 'rgba(0,0,0,0.08)',

  /** Status colors */
  status: {
    success: '#22c55e',
    warning: '#eab308',
    error: '#ef4444',
    pending: 'rgba(0,0,0,0.3)',
  },
} as const;

export const PATTERNS = {
  /** Subtle grid background for content areas */
  gridBackground: 'linear-gradient(rgba(0,0,0,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.018) 1px, transparent 1px)',
  gridSize: '20px 20px',
  /** Accent dotted border for section dividers */
  dottedBorder: '1px dotted color-mix(in srgb, var(--mode-accent) 30%, transparent)',
  /** Standard solid border (alpha-based) */
  solidBorder: '1px solid rgba(0,0,0,0.08)',
} as const;

export const TYPOGRAPHY = {
  /** Hero text: 60px / 1.1 / -0.05em */
  hero: { fontSize: '60px', lineHeight: '1.1', letterSpacing: '-0.05em' },
  /** Section headers: 12px / 1.5 / 0.12em (UPPERCASE) */
  section: { fontSize: '12px', lineHeight: '1.5', letterSpacing: '0.12em', textTransform: 'uppercase' as const },
  /** Body: 16px / 1.5 */
  body: { fontSize: '16px', lineHeight: '1.5' },
  /** Label: 10px / 1.4 */
  label: { fontSize: '10px', lineHeight: '1.4' },
  /** Caption: 12px / 1.4 */
  caption: { fontSize: '12px', lineHeight: '1.4' },
} as const;

export const SPACING = {
  xs: '8px',   // 0.5rem
  sm: '16px',  // 1rem
  md: '24px',  // 1.5rem
  lg: '40px',  // 2.5rem
  xl: '64px',  // 4rem
  '2xl': '80px',  // 5rem
  '3xl': '120px', // 7.5rem
} as const;

/** Tailwind CSS classes for common patterns */
export const tw = {
  /** Section header styling */
  sectionHeader: 'font-mono text-xs font-medium uppercase tracking-[0.12em] text-[var(--mode-accent)] border-b border-dotted border-[color-mix(in_srgb,var(--mode-accent)_30%,transparent)] pb-3 mb-6',
  /** Card styling (sharp edges, no radius) */
  card: 'bg-white border border-[rgba(0,0,0,0.08)] rounded-none',
  /** Primary button styling */
  buttonPrimary: 'font-mono uppercase tracking-[0.1em] bg-[var(--mode-accent)] text-white rounded-none',
  /** Secondary button styling */
  buttonSecondary: 'font-mono uppercase tracking-[0.1em] border border-[rgba(0,0,0,0.08)] text-foreground hover:bg-[rgba(0,0,0,0.05)] rounded-none',
  /** Thesis block styling (serif opt-in) */
  thesis: 'font-serif text-xl italic text-center py-10 px-8 border-y border-dotted border-[color-mix(in_srgb,var(--mode-accent)_30%,transparent)]',
  /** Grid background utility */
  gridBg: 'bg-[linear-gradient(rgba(0,0,0,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.018)_1px,transparent_1px)] bg-[size:20px_20px]',
  /** Input styling (sharp edges) */
  input: 'font-mono uppercase text-xs border border-[rgba(0,0,0,0.5)] rounded-none bg-transparent placeholder:text-[rgba(0,0,0,0.45)]',
  /** Badge/tag styling */
  badge: 'font-mono text-[9px] uppercase tracking-[0.05em] px-2 py-0.5 bg-[rgba(0,0,0,0.08)] rounded-none',
  /** Navigation link */
  navLink: 'text-xs font-light text-foreground no-underline hover:text-[var(--mode-accent)] transition-colors',
} as const;
