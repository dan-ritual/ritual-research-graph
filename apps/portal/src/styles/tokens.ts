/**
 * Making Software Design Tokens
 *
 * Institutional-grade design system derived from RWA microsite aesthetic.
 * These tokens define the visual language for the Ritual Research Graph portal.
 */

export const FONTS = {
  /** UI elements, section headers, labels, metadata */
  mono: '"JetBrains Mono", "SF Mono", "Consolas", monospace',
  /** Body text, descriptions, thesis statements */
  serif: '"Crimson Text", Georgia, "Times New Roman", serif',
  /** Display headings, titles */
  display: '"Space Grotesk", "Inter", system-ui, sans-serif',
} as const;

export const COLORS = {
  /** Page background - subtle off-white */
  background: '#FBFBFB',
  /** Primary text */
  text: '#171717',
  /** Primary accent - distinctive blue */
  accent: '#3B5FE6',
  /** Muted/secondary text */
  muted: 'rgba(0,0,0,0.45)',
  /** Borders and dividers */
  border: 'rgba(0,0,0,0.08)',
  /** Light divider lines */
  divider: 'rgba(0,0,0,0.05)',
  /** Status colors */
  status: {
    success: '#22c55e',
    warning: '#eab308',
    error: '#ef4444',
    info: '#3B5FE6',
  },
} as const;

export const PATTERNS = {
  /** Subtle grid background for content areas */
  gridBackground: 'linear-gradient(rgba(0,0,0,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.018) 1px, transparent 1px)',
  gridSize: '20px 20px',
  /** Accent dotted border for section dividers */
  dottedBorder: '1px dotted rgba(59,95,230,0.3)',
  /** Standard solid border */
  solidBorder: '1px solid rgba(0,0,0,0.08)',
} as const;

/** Tailwind CSS classes for common patterns */
export const tw = {
  /** Section header styling */
  sectionHeader: 'font-mono text-sm font-semibold uppercase tracking-[0.12em] text-accent border-b border-dotted border-accent/30 pb-4 mb-6',
  /** Card styling (sharp edges) */
  card: 'bg-white border border-border rounded-none',
  /** Primary button styling */
  buttonPrimary: 'font-mono uppercase tracking-[0.1em] bg-accent text-white',
  /** Thesis block styling */
  thesis: 'font-serif text-xl italic text-center py-10 px-8 border-y border-dotted border-accent/30',
  /** Grid background utility */
  gridBg: 'bg-[linear-gradient(rgba(0,0,0,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.018)_1px,transparent_1px)] bg-[size:20px_20px]',
} as const;
