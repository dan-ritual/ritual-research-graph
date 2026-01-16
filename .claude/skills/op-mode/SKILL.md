---
name: op-mode
description: Switch to operations mode for using the system
---

# /op-mode — Operations Mode

Activates operations mode for **using** the Ritual Research Graph to generate research.

## When to Use

- Uploading transcripts to generate microsites
- Managing entities in the registry
- Curating the knowledge graph
- Any task related to **using** the system (not building it)

## What's Available

In operations mode, you work with:
- Research workflows (transcript → microsite)
- Entity management (browse, edit, merge)
- Knowledge graph navigation
- Microsite deployment

## What's Hidden

Dev tooling is hidden to keep focus on research operations:
- Specs and implementation docs
- Database migrations
- Package source code
- Dev handoffs

## Capability Status

Capabilities unlock as implementation phases complete:

| Capability | Requires | Status |
|------------|----------|--------|
| Generate microsite from transcript | Phase 1b | Pending |
| Manage entity registry | Phase 2 | Pending |
| Browse knowledge graph | Phase 3 | Pending |
| Edit artifacts (spot treatment) | Phase 4 | Pending |

## Activation

When this skill runs, it will:
1. Update `.claude/mode.json` to `{"mode": "op"}`
2. Check which capabilities are available
3. Display op-mode guidance

## Research Workflows

### Generate Microsite (Phase 1b+)
```bash
# Via CLI (when available)
npm run generate -- \
  --transcript ./path/to/transcript.md \
  --workflow market-landscape \
  --title "Research Title"
```

### Conversational Mode
Just describe what you want:
- "I have notes from our research call about Ondo Finance"
- "Generate a microsite from the Q1 strategy transcript"
- "Show me all entities related to tokenized treasuries"

## Session Logging

Op sessions use `.claude/op-logs/` for research session tracking (separate from dev handoffs).

---

**Mode activated.** You are now in /op-mode. Research operations enabled.

Note: Some capabilities may be pending based on implementation status.
