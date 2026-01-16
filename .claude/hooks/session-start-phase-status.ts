#!/usr/bin/env npx tsx
/**
 * SessionStart hook: Reports current phase status at session start
 * Keeps Claude aware of project progress
 */

import { existsSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

const PROJECT_ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd().replace('/.claude/hooks', '');

interface PhaseInfo {
  id: string;
  name: string;
  percentage: number;
  status: 'COMPLETE' | 'IN PROGRESS' | 'PENDING';
}

// Phase completion criteria based on key files/folders
const PHASES: { id: string; name: string; markers: string[] }[] = [
  {
    id: '0',
    name: 'Foundation',
    markers: ['CLAUDE.md', 'docs/MASTER_SPEC.md', 'packages/core/src/types.ts'],
  },
  {
    id: '1a',
    name: 'Database & Storage',
    markers: [
      'supabase/migrations/001_initial_schema.sql',
      'supabase/migrations/002_rls_policies.sql',
      'scripts/lib/supabase.ts',
    ],
  },
  {
    id: '1b',
    name: 'Processing Pipeline',
    markers: [
      'scripts/generate.ts',
      'scripts/stages/artifacts.ts',
      'scripts/prompts/clean-transcript.ts',
      'scripts/prompts/synthesize-research.ts',
    ],
  },
  {
    id: '2',
    name: 'Portal MVP',
    markers: [
      'apps/portal/package.json',
      'apps/portal/src/app/layout.tsx',
      'apps/portal/src/app/pipeline/page.tsx',
      'apps/portal/src/components/ui/button.tsx',
    ],
  },
  {
    id: '2.5a',
    name: 'Pipeline Core',
    markers: [
      'supabase/migrations/005_opportunity_pipeline.sql',
      'apps/portal/src/app/pipeline/kanban/page.tsx',
    ],
  },
  {
    id: '2.5b',
    name: 'Pipeline Advanced',
    markers: [
      'apps/portal/src/app/pipeline/chat/page.tsx',
      'scripts/prompts/opportunity-strategy.ts',
    ],
  },
  {
    id: '3',
    name: 'Graph UI',
    markers: [
      'apps/portal/src/app/entities/[slug]/page.tsx',
      'apps/portal/src/components/entity-graph.tsx',
    ],
  },
  {
    id: '4',
    name: 'Spot Treatment',
    markers: [
      'apps/portal/src/components/spot-editor.tsx',
      'scripts/prompts/spot-treatment.ts',
    ],
  },
];

function checkPhase(markers: string[]): number {
  if (markers.length === 0) return 100;
  const found = markers.filter((m) => existsSync(join(PROJECT_ROOT, m))).length;
  return Math.round((found / markers.length) * 100);
}

function getPhaseStatuses(): PhaseInfo[] {
  return PHASES.map((p) => {
    const percentage = checkPhase(p.markers);
    let status: PhaseInfo['status'] = 'PENDING';
    if (percentage === 100) status = 'COMPLETE';
    else if (percentage > 0) status = 'IN PROGRESS';
    return { id: p.id, name: p.name, percentage, status };
  });
}

function getCurrentPhase(statuses: PhaseInfo[]): PhaseInfo | null {
  // Find first non-complete phase
  return statuses.find((s) => s.status !== 'COMPLETE') || null;
}

async function main() {
  const input = await new Promise<string>((resolve) => {
    let data = '';
    process.stdin.on('data', (chunk) => (data += chunk));
    process.stdin.on('end', () => resolve(data));
  });

  const statuses = getPhaseStatuses();
  const current = getCurrentPhase(statuses);

  // Build status summary
  const completed = statuses.filter((s) => s.status === 'COMPLETE');
  const inProgress = statuses.find((s) => s.status === 'IN PROGRESS');

  let message = '## Phase Status\n';
  message += `Completed: ${completed.map((c) => c.id).join(', ') || 'None'}\n`;
  if (inProgress) {
    message += `Current: Phase ${inProgress.id} (${inProgress.name}) — ${inProgress.percentage}%\n`;
  }

  // Output for Claude
  console.log(
    JSON.stringify({
      result: 'continue',
      message,
    })
  );
}

main().catch((e) => {
  console.error('[phase-status] Error:', e);
  console.log(JSON.stringify({ result: 'continue' }));
});
