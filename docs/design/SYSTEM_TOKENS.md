# System Tokens

## Core Colors

| Token | Value | Description |
|-------|-------|-------------|
| `--background` | `#FBFBFB` | Off-white, warm paper base |
| `--foreground` | `#171717` | Near-black text |
| `--card` | `#FFFFFF` | Card background (pure white) |
| `--border` | `rgba(0,0,0,0.08)` | Subtle borders |
| `--muted` | `rgba(0,0,0,0.05)` | Muted backgrounds |
| `--muted-foreground` | `rgba(0,0,0,0.45)` | Muted text |
| `--accent` | `var(--mode-accent)` | Primary interactive color (dynamic) |

## Accent Colors

### Cobalt Scale (Base Brand)
Used for the default Growth mode and general brand elements.

| Token | Value | Usage |
|-------|-------|-------|
| `--cobalt-50` | `#F5F7FF` | Lightest fill / highlight |
| `--cobalt-100` | `#E8EDFF` | |
| `--cobalt-200` | `#C5D3FF` | Secondary surfaces |
| `--cobalt-300` | `#9BB3FF` | Primary illustration fill |
| `--cobalt-400` | `#6B8AFF` | Secondary lines |
| `--cobalt-600` | `#3B5FE6` | Primary stroke / accent |

### Mode Accents
The system uses semantic mode tokens to allow theming.

| Mode | Token | Value |
|------|-------|-------|
| **Growth (Default)** | `--mode-accent` | `#3B5FE6` (Cobalt 600) |
| | `--mode-accent-light` | `#9BB3FF` (Cobalt 300) |
| **Engineering** | `--mode-accent` | `#3BE65B` (Green) |
| | `--mode-accent-light` | `#9BFFB3` |
| **Skunkworks** | `--mode-accent` | `#E63B3B` (Red) |
| | `--mode-accent-light` | `#FF9B9B` |

## Typography

### Families
- **Mono (Default):** "JetBrains Mono", "SF Mono", monospace
- **Display (Page Titles Only):** "Space Grotesk", "Inter", sans-serif
- **Serif (Opt-in):** "Crimson Text", Georgia, serif

### Scale
- **Hero:** 60px / 1.1 / -0.05em
- **Section:** 16px / 1.5 / 0.05em (UPPERCASE)
- **Body:** 16px / 1.5
- **Label:** 10px / 1.4
- **Caption:** 12px / 1.4

## Spacing

- `xs`: 8px (0.5rem)
- `sm`: 16px (1rem)
- `md`: 24px (1.5rem)
- `lg`: 40px (2.5rem)
- `xl`: 64px (4rem)
- `2xl`: 80px (5rem)
- `3xl`: 120px (7.5rem)
