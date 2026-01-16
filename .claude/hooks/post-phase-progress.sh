#!/bin/bash
# Lightweight hook: Check if phase status changed after significant commits
# Triggers reminder to run /progress-update skill
set -e
cd "$CLAUDE_PROJECT_DIR/.claude/hooks"
cat | npx tsx post-phase-progress.ts
