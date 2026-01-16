---
name: dev-mode
description: Switch to development mode for building the system
---

# /dev-mode — Development Mode

Activates development mode for building the Ritual Research Graph system.

## When to Use

- Implementing features
- Writing code, specs, migrations
- Debugging infrastructure
- Running tests
- Any task related to **building** the system

## What Changes

This mode provides full access to:
- `docs/` — Specifications and design documents
- `packages/` — Core libraries and CLI
- `supabase/` — Database migrations
- `.claude/handoffs/` — Dev session continuity
- All implementation tasks and phase tracking

## Activation

When this skill runs, it will:
1. Update `.claude/mode.json` to `{"mode": "dev"}`
2. Display dev-mode guidance
3. Show current phase and implementation status

## Quick Reference

```
Current Phase: Check .claude/handoffs/index.json
Specs:         docs/MASTER_SPEC.md, docs/specs/
Handoffs:      npx tsx .claude/scripts/resume-handoff.ts --latest
Kickoff:       npx tsx .claude/scripts/generate-kickoff.ts --phase <phase>
```

## Session Continuity

Dev sessions use `.claude/handoffs/` for state preservation.

Before ending:
```bash
cat << 'EOF' | npx tsx .claude/scripts/create-handoff.ts
{
  "phase": "<current-phase>",
  "status": "in-progress",
  "summary": "[What you accomplished]",
  "nextSteps": ["[Next step]"]
}
EOF
```

---

**Mode activated.** You are now in /dev-mode. Full codebase access enabled.
