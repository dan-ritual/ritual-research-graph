#!/bin/bash
# Quick handoff creation script
# Usage: ./quick-handoff.sh --phase 1a --status in-progress

set -e

PROJECT_ROOT="/Users/danielgosek/dev/projects/ritual/ritual-research-graph"
cd "$PROJECT_ROOT/.claude/scripts"

# If JSON is piped in, pass it through
if [ ! -t 0 ]; then
  cat | npx tsx create-handoff.ts
else
  # Otherwise use CLI args
  npx tsx create-handoff.ts "$@"
fi
