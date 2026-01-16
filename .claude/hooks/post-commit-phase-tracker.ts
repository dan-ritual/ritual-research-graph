#!/usr/bin/env npx tsx
/**
 * Post-commit hook: Updates MASTER_MAP phase status based on git history
 * Triggered after commits to keep phase tracking in sync
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

const MASTER_MAP_PATH = 'docs/MASTER_MAP.md';

interface PhaseStatus {
  phase: string;
  percentage: number;
  status: 'COMPLETE' | 'IN PROGRESS' | 'PENDING';
  checkpoints: { name: string; done: boolean }[];
}

// Define phase completion criteria based on file/folder existence
const PHASE_CRITERIA: Record<string, { files: string[]; folders: string[] }> = {
  '1a': {
    files: ['supabase/migrations/001_initial_schema.sql'],
    folders: ['supabase/migrations'],
  },
  '1b': {
    files: ['scripts/generate.ts', 'packages/core/src/pipeline/index.ts'],
    folders: ['packages/core/src/pipeline', 'packages/core/src/prompts'],
  },
  '2': {
    files: ['apps/portal/package.json', 'apps/portal/src/app/layout.tsx'],
    folders: ['apps/portal/src/app', 'apps/portal/src/components'],
  },
  '2.5a': {
    files: ['supabase/migrations/005_opportunity_pipeline.sql'],
    folders: ['apps/portal/src/app/pipeline'],
  },
  '2.5b': {
    files: ['apps/portal/src/app/pipeline/chat/page.tsx'],
    folders: [],
  },
};

function checkPhaseCompletion(phase: string): number {
  const criteria = PHASE_CRITERIA[phase];
  if (!criteria) return 0;

  const allItems = [...criteria.files, ...criteria.folders];
  if (allItems.length === 0) return 0;

  const existingItems = allItems.filter((item) => existsSync(item));
  return Math.round((existingItems.length / allItems.length) * 100);
}

function getPhaseStatus(): PhaseStatus[] {
  return Object.keys(PHASE_CRITERIA).map((phase) => {
    const percentage = checkPhaseCompletion(phase);
    let status: PhaseStatus['status'] = 'PENDING';
    if (percentage === 100) status = 'COMPLETE';
    else if (percentage > 0) status = 'IN PROGRESS';

    return {
      phase,
      percentage,
      status,
      checkpoints: [],
    };
  });
}

async function main() {
  const input = await new Promise<string>((resolve) => {
    let data = '';
    process.stdin.on('data', (chunk) => (data += chunk));
    process.stdin.on('end', () => resolve(data));
  });

  // Log phase status for debugging
  const statuses = getPhaseStatus();
  console.error('[phase-tracker] Current phase statuses:');
  statuses.forEach((s) => {
    console.error(`  Phase ${s.phase}: ${s.percentage}% ${s.status}`);
  });

  // Return continue - this hook is informational
  console.log(JSON.stringify({ result: 'continue' }));
}

main().catch((e) => {
  console.error('[phase-tracker] Error:', e);
  console.log(JSON.stringify({ result: 'continue' }));
});
