#!/bin/bash
# Pre-compact hook: Creates a handoff before context compaction
# Triggered by PreCompact event
set -e

cd "$CLAUDE_PROJECT_DIR/.claude/hooks"
cat | npx tsx pre-compact-handoff.ts
