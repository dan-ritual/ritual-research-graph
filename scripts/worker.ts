#!/usr/bin/env npx tsx
/**
 * Job Worker - Processes generation jobs from Supabase
 *
 * Runs on GCP VM, subscribes to Supabase Realtime for new jobs,
 * and spawns the generate CLI for each pending job.
 *
 * Usage:
 *   npx tsx scripts/worker.ts
 *
 * Environment:
 *   SUPABASE_URL - Supabase project URL
 *   SUPABASE_SERVICE_KEY - Service role key (for realtime + updates)
 */

import 'dotenv/config';
import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { MODE_CONFIGS, getSchemaForMode, getSchemaTable, type ModeId } from '@ritual-research/core';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Configuration
const MAX_CONCURRENT_JOBS = 2;
const POLL_INTERVAL_MS = 30000; // Fallback polling every 30s

// State
const activeJobs = new Map<string, ChildProcess>();
let isShuttingDown = false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let supabase: ReturnType<typeof createClient<any>>;
let channel: RealtimeChannel;

// Validate environment
function validateEnv() {
  const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY'];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

// Initialize Supabase client
function initSupabase() {
  supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

const MODE_IDS = Object.keys(MODE_CONFIGS) as ModeId[];

// Process a single job
async function processJob(
  jobId: string,
  title: string,
  modeId: ModeId,
  isRegeneration = false
) {
  if (isShuttingDown) {
    console.log(`[${jobId}] Skipping - worker shutting down`);
    return;
  }

  if (activeJobs.has(jobId)) {
    console.log(`[${jobId}] Already processing`);
    return;
  }

  if (activeJobs.size >= MAX_CONCURRENT_JOBS) {
    console.log(`[${jobId}] Max concurrent jobs reached, will retry later`);
    return;
  }

  const mode = isRegeneration ? 'REGENERATE' : 'GENERATE';
  console.log(`[${jobId}] Starting ${mode}: ${title}`);

  // Update status to indicate we're picking it up
  const newStatus = isRegeneration ? 'regenerating_microsite' : 'generating_artifacts';
  const expectedStatus = isRegeneration ? 'pending_regeneration' : 'pending';

  await supabase
    .from(getSchemaTable('generation_jobs', modeId))
    .update({
      status: newStatus,
      started_at: new Date().toISOString(),
    })
    .eq('id', jobId)
    .eq('status', expectedStatus); // Only if still in expected status (avoid race)

  const outputDir = path.join(
    PROJECT_ROOT,
    'outputs/microsites',
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'untitled'
  );

  const args = [
    'run', 'generate', '--',
    '--job-id', jobId,
    '--output', outputDir,
    '--mode', modeId,
  ];

  // Add regeneration flag if this is a regeneration request
  if (isRegeneration) {
    args.push('--regenerate');
  }

  const child = spawn('npm', args, {
    cwd: PROJECT_ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env },
  });

  activeJobs.set(jobId, child);

  // Stream stdout
  child.stdout?.on('data', (data: Buffer) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => console.log(`[${jobId}] ${line}`));
  });

  // Stream stderr
  child.stderr?.on('data', (data: Buffer) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => console.error(`[${jobId}] ERR: ${line}`));
  });

  // Handle completion
  child.on('close', async (code) => {
    activeJobs.delete(jobId);

    if (code === 0) {
      console.log(`[${jobId}] Completed successfully`);
    } else {
      console.error(`[${jobId}] Failed with exit code ${code}`);
      // Mark as failed if CLI didn't already
      await supabase
        .from(getSchemaTable('generation_jobs', modeId))
        .update({
          status: 'failed',
          error_message: `CLI exited with code ${code}`,
        })
        .eq('id', jobId)
        .neq('status', 'completed'); // Don't overwrite if somehow completed
    }
  });

  child.on('error', async (err) => {
    activeJobs.delete(jobId);
    console.error(`[${jobId}] Spawn error:`, err.message);
    await supabase
      .from(getSchemaTable('generation_jobs', modeId))
      .update({
        status: 'failed',
        error_message: `Spawn error: ${err.message}`,
      })
      .eq('id', jobId);
  });
}

// Check for pending jobs (fallback polling)
async function checkPendingJobs() {
  if (isShuttingDown) return;

  // Check for new jobs AND regeneration requests
  for (const modeId of MODE_IDS) {
    const { data: jobs, error } = await supabase
      .from(getSchemaTable('generation_jobs', modeId))
      .select('id, config, status')
      .in('status', ['pending', 'pending_regeneration'])
      .order('created_at', { ascending: true })
      .limit(MAX_CONCURRENT_JOBS - activeJobs.size);

    if (error) {
      console.error(`Error fetching pending jobs (${modeId}):`, error.message);
      continue;
    }

    for (const job of jobs || []) {
      const title = (job.config as { title?: string })?.title || 'untitled';
      const isRegeneration = job.status === 'pending_regeneration';
      await processJob(job.id, title, modeId, isRegeneration);
    }
  }
}

// Subscribe to realtime changes
function subscribeToJobs() {
  channel = supabase.channel('generation_jobs_changes');

  for (const modeId of MODE_IDS) {
    const schema = getSchemaForMode(modeId);
    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema,
          table: 'generation_jobs',
        },
        async (payload) => {
          const job = payload.new as { id: string; status: string; config: { title?: string } };
          if (job.status === 'pending') {
            console.log(`Realtime: New job detected ${job.id} (${modeId})`);
            await processJob(job.id, job.config?.title || 'untitled', modeId, false);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema,
          table: 'generation_jobs',
        },
        async (payload) => {
          const job = payload.new as { id: string; status: string; config: { title?: string } };
          if (activeJobs.has(job.id)) return;

          // Handle new job requests
          if (job.status === 'pending') {
            console.log(`Realtime: Job ${job.id} set to pending (${modeId})`);
            await processJob(job.id, job.config?.title || 'untitled', modeId, false);
          }
          // Handle regeneration requests
          else if (job.status === 'pending_regeneration') {
            console.log(`Realtime: Job ${job.id} set to pending_regeneration (${modeId})`);
            await processJob(job.id, job.config?.title || 'untitled', modeId, true);
          }
        }
      );
  }

  channel.subscribe((status) => {
    console.log(`Realtime subscription status: ${status}`);
  });
}

// Graceful shutdown
function setupShutdownHandlers() {
  const shutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log(`\nReceived ${signal}, shutting down gracefully...`);

    // Unsubscribe from realtime
    if (channel) {
      await supabase.removeChannel(channel);
    }

    // Wait for active jobs to complete (with timeout)
    if (activeJobs.size > 0) {
      console.log(`Waiting for ${activeJobs.size} active job(s) to complete...`);

      const timeout = setTimeout(() => {
        console.log('Timeout waiting for jobs, forcing exit');
        process.exit(1);
      }, 60000); // 1 minute timeout

      // Check every second if jobs are done
      const checkInterval = setInterval(() => {
        if (activeJobs.size === 0) {
          clearInterval(checkInterval);
          clearTimeout(timeout);
          console.log('All jobs completed, exiting');
          process.exit(0);
        }
      }, 1000);
    } else {
      process.exit(0);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

// Main
async function main() {
  console.log('='.repeat(50));
  console.log('Ritual Research Graph - Job Worker');
  console.log('='.repeat(50));
  console.log(`Project root: ${PROJECT_ROOT}`);
  console.log(`Max concurrent jobs: ${MAX_CONCURRENT_JOBS}`);
  console.log('');

  validateEnv();
  initSupabase();
  setupShutdownHandlers();

  // Subscribe to realtime changes
  subscribeToJobs();

  // Initial check for any pending jobs
  console.log('Checking for existing pending jobs...');
  await checkPendingJobs();

  // Fallback polling (in case realtime misses something)
  setInterval(checkPendingJobs, POLL_INTERVAL_MS);

  console.log('Worker running. Press Ctrl+C to stop.\n');
}

main().catch((err) => {
  console.error('Worker crashed:', err);
  process.exit(1);
});
