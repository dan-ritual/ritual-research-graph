---
name: progress-update
description: Update project-overview.html with current phase status
---

# Progress Update

Updates `docs/project-overview.html` to reflect current implementation status.

## When to Use

- After completing a phase or major milestone
- When phase tracking shows status change
- Before sharing project status externally

## Process

1. Run phase status hook to get current completion
2. Read current project-overview.html
3. Update version, status bar, phase timeline, changelog
4. Commit with message "Update project overview to vX.Y.Z"

## Quick Command

```bash
# Check current status
export CLAUDE_PROJECT_DIR="$(pwd)" && echo '{}' | .claude/hooks/session-start-phase-status.sh
```

## Updates Required

| Section | What to Update |
|---------|----------------|
| Header eyebrow | Version number |
| Status bar | Phase completion dots |
| Current Status | Phase descriptions and tags |
| Build Phases | Timeline status (complete/in-progress/pending) |
| Changelog | New version entry if milestone |
| Footer | Version number |

## Version Scheme

- Major milestone: bump minor (v0.3 → v0.4)
- Phase complete: bump patch (v0.4.0 → v0.4.1)
- Dev suffix for work-in-progress: v0.4.0-dev
