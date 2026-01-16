# Ritual Research Graph

Transform meeting transcripts into interconnected, Wikipedia-style microsites.

## Quick Reference

| What | Where |
|------|-------|
| Master Spec | `docs/MASTER_SPEC.md` |
| Phase Specs | `docs/specs/SPEC_*.md` |
| Design Docs | `docs/design/` |
| Source Transcripts | `inputs/transcripts/` |
| Generated Microsites | `outputs/microsites/` |
| Session Handoffs | `.claude/handoffs/` |

## Current Phase

**Phase 1a: Database & Storage (Supabase)** — Setting up Supabase foundation.

Check progress:
```bash
npx tsx .claude/scripts/resume-handoff.ts --latest
```

## Session Continuity (USE THIS)

This project has a bespoke handoff system linked to Claude Code's native sessions.

### Before Starting
```bash
npx tsx .claude/scripts/resume-handoff.ts --latest
```

### Before Ending
```bash
cat << 'EOF' | npx tsx .claude/scripts/create-handoff.ts
{
  "phase": "1a",
  "status": "in-progress",
  "summary": "[What you accomplished]",
  "nextSteps": ["[Next step]"]
}
EOF
```

### Auto-Handoff
PreCompact hook automatically creates handoffs before context compaction.

## Key Architecture Decisions

- **Database**: Supabase (Postgres)
- **Auth**: Google OAuth, @ritual.net domain restriction
- **Portal**: Next.js (Phase 2)
- **Microsites**: React/Vite with "Making Software" aesthetic
- **Multi-AI**: Grok → Perplexity → bird-cli → Claude

## Implementation Sequence

```
Phase 1a ──► Phase 1b ──► Phase 2 ──► Phase 3 ──► Phase 4
Database     Pipeline     Portal      Graph       Edit
```

## Anti-Patterns

- Don't create new spec files without updating MASTER_SPEC.md
- Don't bypass the handoff system — always create handoffs at stopping points
- Don't hardcode paths — use PROJECT_ROOT pattern from existing scripts
- Don't store secrets in code — use .env (already in .gitignore)

## File Conventions

- Specs: `docs/specs/SPEC_*.md`
- Handoffs: `.claude/handoffs/rrg-{phase}-{date}-{time}-{seq}.md`
- Scripts: TypeScript with `npx tsx` execution
- Hooks: Shell wrapper → TypeScript handler pattern

## Generate Kickoff Prompts

```bash
npx tsx .claude/scripts/generate-kickoff.ts --phase 1a
npx tsx .claude/scripts/generate-kickoff.ts --phase 1a --continue
```
