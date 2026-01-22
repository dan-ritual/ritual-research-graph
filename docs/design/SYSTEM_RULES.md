# System Rules

## Aesthetic Principles
1. **Technical Documentation Feel:** Evokes engineering drawings, blueprints, reference manuals.
2. **Clean White Space:** Generous margins, breathing room between elements.
3. **Monochromatic + Accent:** Near-black text on off-white, single mode accent.
4. **Typographic Hierarchy:** Monospace is default, serif is opt-in for long-form.
5. **Illustration-Forward:** Large technical diagrams as primary visual elements.

## Do's and Don'ts

### Do
- Use `var(--mode-accent)` for interactive elements and key highlights.
- Keep borders subtle (`var(--border)`).
- Use dotted lines for separation.
- Use uppercase mono for all UI labels and headers.

### Don't
- Use heavy drop shadows.
- Use rounded corners on cards (keep them sharp).
- Mix multiple accent colors in one mode.
- Use pure black (`#000000`) for text.

## Implementation Checklist
- [ ] Verify `@theme` inline configuration + CSS variables in `globals.css`
- [ ] Define all tokens in `src/styles/tokens.ts` or CSS variables
- [ ] Normalize all hardcoded colors to `var(--token)` syntax
- [ ] Apply "Making Software" aesthetic to all new components
