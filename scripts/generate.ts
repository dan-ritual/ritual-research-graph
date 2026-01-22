#!/usr/bin/env npx tsx
// Main CLI entry point for the Ritual Research Graph generator

import 'dotenv/config';
import { program } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateArtifacts } from './stages/artifacts.js';
import { executeResearchChain, extractPreliminaryEntities } from './stages/research.js';
import { extractEntities } from './stages/entities.js';
import { generateSiteConfig } from './stages/site-config.js';
import { buildMicrosite } from './stages/microsite.js';
import { integrateWithGraph } from './stages/graph.js';
import { uploadToBlob, isBlobConfigured, formatBytes } from './lib/blob.js';
import { fileExists, ensureDir, writeFile } from './utils/files.js';
import { slugify } from './utils/files.js';
import { GenerationError, GenerationErrorType } from './lib/errors.js';
import { getSupabaseClient, isSupabaseConfigured } from './lib/supabase.js';
import type { GenerationConfig, ExtractedOpportunity } from './lib/types.js';
import os from 'os';
import {
  DEFAULT_MODE_ID,
  getSchemaTable,
  MODE_CONFIGS,
  type ModeId,
  type ModePipelineStage,
} from '@ritual-research/core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

function resolveModeId(value?: string | null): ModeId {
  if (value && value in MODE_CONFIGS) {
    return value as ModeId;
  }
  return DEFAULT_MODE_ID;
}

function resolvePipelineStages(modeId: ModeId): ModePipelineStage[] {
  const modeConfig = MODE_CONFIGS[modeId];
  if (modeConfig?.pipelineStages?.length) {
    return modeConfig.pipelineStages;
  }
  return MODE_CONFIGS[DEFAULT_MODE_ID].pipelineStages;
}

// Job status update helper for Portal integration
async function updateJobStatus(
  jobId: string,
  status: string,
  stage: number,
  progress: number,
  errorMessage?: string,
  mode: ModeId
): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const supabase = getSupabaseClient();
  const update: Record<string, unknown> = {
    status,
    current_stage: stage,
    stage_progress: progress,
    updated_at: new Date().toISOString(),
  };

  if (errorMessage) {
    update.error_message = errorMessage;
  }

  await supabase.from(getSchemaTable('generation_jobs', mode)).update(update).eq('id', jobId);
}

// Fetch existing artifacts for regeneration
async function fetchExistingArtifacts(jobId: string, mode: ModeId): Promise<{
  cleanedTranscript: import('./lib/types.js').Artifact;
  intelligenceBrief: import('./lib/types.js').Artifact;
  strategicQuestions: import('./lib/types.js').Artifact;
  narrativeResearch: import('./lib/types.js').Artifact | null;
  entities: import('./lib/types.js').ExtractedEntity[];
  opportunities: import('./lib/types.js').ExtractedOpportunity[];
  entitiesArtifact: import('./lib/types.js').Artifact;
  opportunitiesArtifact: import('./lib/types.js').Artifact | null;
}> {
  const supabase = getSupabaseClient();

  // Fetch all artifacts for this job
  const { data: artifacts, error } = await supabase
    .from(getSchemaTable('artifacts', mode))
    .select('*')
    .eq('job_id', jobId);

  if (error || !artifacts || artifacts.length === 0) {
    throw new GenerationError(
      GenerationErrorType.SUPABASE_ERROR,
      `No artifacts found for job: ${jobId}`
    );
  }

  // Map artifacts by type
  const artifactsByType = new Map(artifacts.map(a => [a.type, a]));

  const cleanedTranscriptData = artifactsByType.get('cleaned_transcript');
  const intelligenceBriefData = artifactsByType.get('intelligence_brief');
  const strategicQuestionsData = artifactsByType.get('strategic_questions');
  const narrativeResearchData = artifactsByType.get('narrative_research');
  const entitiesData = artifactsByType.get('entity_extraction');
  const opportunitiesData = artifactsByType.get('opportunity_extraction');

  if (!cleanedTranscriptData || !intelligenceBriefData || !strategicQuestionsData || !entitiesData) {
    throw new GenerationError(
      GenerationErrorType.SUPABASE_ERROR,
      'Required artifacts (transcript, brief, questions, entities) not found for regeneration'
    );
  }

  // Convert DB records to Artifact format
  const toArtifact = (data: typeof cleanedTranscriptData): import('./lib/types.js').Artifact => ({
    id: data.id,
    name: data.type,
    filename: data.file_path?.split('/').pop() || `${data.type}.md`,
    content: data.content || '',
    path: data.file_path,
  });

  // Parse entities from artifact content
  let entities: import('./lib/types.js').ExtractedEntity[] = [];
  let opportunities: import('./lib/types.js').ExtractedOpportunity[] = [];

  if (entitiesData.content) {
    try {
      const parsed = JSON.parse(entitiesData.content);
      entities = parsed.entities || parsed || [];
    } catch {
      console.warn('Failed to parse entities artifact content');
    }
  }

  if (opportunitiesData?.content) {
    try {
      const parsed = JSON.parse(opportunitiesData.content);
      opportunities = parsed.opportunities || parsed || [];
    } catch {
      console.warn('Failed to parse opportunities artifact content');
    }
  }

  return {
    cleanedTranscript: toArtifact(cleanedTranscriptData),
    intelligenceBrief: toArtifact(intelligenceBriefData),
    strategicQuestions: toArtifact(strategicQuestionsData),
    narrativeResearch: narrativeResearchData ? toArtifact(narrativeResearchData) : null,
    entities,
    opportunities,
    entitiesArtifact: toArtifact(entitiesData),
    opportunitiesArtifact: opportunitiesData ? toArtifact(opportunitiesData) : null,
  };
}

// Fetch job and transcript from Supabase
async function fetchJobAndTranscript(jobId: string, mode: ModeId): Promise<{
  transcriptContent: string;
  config: {
    title?: string;
    subtitle?: string;
    accentColor?: string;
    mode?: string;
    skipBuild?: boolean;
    skipResearch?: boolean;
  };
  workflowType: string;
}> {
  const supabase = getSupabaseClient();

  // Fetch job record
  const { data: job, error: jobError } = await supabase
    .from(getSchemaTable('generation_jobs', mode))
    .select('transcript_path, config, workflow_type')
    .eq('id', jobId)
    .single();

  if (jobError || !job) {
    throw new GenerationError(
      GenerationErrorType.SUPABASE_ERROR,
      `Job not found: ${jobId}`
    );
  }

  // Download transcript from Supabase Storage
  const { data: transcriptBlob, error: downloadError } = await supabase.storage
    .from('transcripts')
    .download(job.transcript_path);

  if (downloadError || !transcriptBlob) {
    throw new GenerationError(
      GenerationErrorType.TRANSCRIPT_NOT_FOUND,
      `Failed to download transcript: ${downloadError?.message || 'Unknown error'}`
    );
  }

  const transcriptContent = await transcriptBlob.text();

  return {
    transcriptContent,
    config: job.config || {},
    workflowType: job.workflow_type || 'market-landscape',
  };
}

program
  .name('generate')
  .description('Generate microsite from transcript')
  .option('-t, --transcript <path>', 'Path to transcript file')
  .option('-j, --job-id <id>', 'Existing job ID for status tracking (reads transcript from Supabase)')
  .option('-w, --workflow <type>', 'Workflow type', 'market-landscape')
  .option('--mode <mode>', 'Mode id', DEFAULT_MODE_ID)
  .option('-o, --output <path>', 'Output directory', './outputs/microsites/new-research')
  .option('--title <title>', 'Microsite title')
  .option('--subtitle <subtitle>', 'Microsite subtitle')
  .option('--accent <color>', 'Accent color hex', '#3B5FE6')
  .option('--skip-build', 'Skip Vite build step')
  .option('--dry-run', 'Show what would be generated without running')
  .option('--regenerate', 'Regeneration mode: re-use existing artifacts, only rebuild site-config and microsite')
  .parse();

async function main() {
  const opts = program.opts();
  const spinner = ora();
  const jobId = opts.jobId;
  let modeId: ModeId = resolveModeId(opts.mode);

  console.log(chalk.blue('\n🔬 Ritual Research Graph - Generator\n'));

  // Validate: need either transcript or job-id
  if (!opts.transcript && !opts.jobId) {
    console.error(chalk.red('Error: Must provide either --transcript or --job-id'));
    process.exit(1);
  }

  let transcriptPath: string;
  let outputPath: string;
  let config: GenerationConfig;

  // Job-id mode: fetch from Supabase
  if (jobId) {
    if (!isSupabaseConfigured()) {
      throw new GenerationError(
        GenerationErrorType.SUPABASE_ERROR,
        'Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY.'
      );
    }

    console.log(chalk.gray(`Job ID: ${jobId}`));
    spinner.start('Fetching job and transcript from Supabase...');

    const jobData = await fetchJobAndTranscript(jobId, modeId);
    spinner.succeed('Job data fetched');

    // Write transcript to temp file for processing
    const tempDir = path.join(os.tmpdir(), 'ritual-research-graph');
    await ensureDir(tempDir);
    transcriptPath = path.join(tempDir, `${jobId}.md`);
    await writeFile(transcriptPath, jobData.transcriptContent);

    // Use job config, with CLI args as overrides
    outputPath = path.resolve(opts.output);
    modeId = resolveModeId(opts.mode ?? jobData.config.mode);
    const accentFallback = MODE_CONFIGS[modeId]?.accent || '#3B5FE6';
    config = {
      transcript: transcriptPath,
      workflow: jobData.workflowType || opts.workflow,
      output: outputPath,
      mode: modeId,
      title: opts.title || jobData.config.title,
      subtitle: opts.subtitle || jobData.config.subtitle,
      accent: opts.accent || jobData.config.accentColor || accentFallback,
      skipBuild: opts.skipBuild ?? jobData.config.skipBuild,
      dryRun: opts.dryRun,
    };

    console.log(chalk.gray(`Title: ${config.title}`));
  } else {
    // Local file mode
    transcriptPath = path.resolve(opts.transcript);
    outputPath = path.resolve(opts.output);
    modeId = resolveModeId(opts.mode);

    // Validate transcript exists
    if (!(await fileExists(transcriptPath))) {
      throw new GenerationError(
        GenerationErrorType.TRANSCRIPT_NOT_FOUND,
        `Transcript not found: ${transcriptPath}`
      );
    }

    config = {
      transcript: transcriptPath,
      workflow: opts.workflow,
      output: outputPath,
      mode: modeId,
      title: opts.title,
      subtitle: opts.subtitle,
      accent: opts.accent || MODE_CONFIGS[modeId]?.accent || '#3B5FE6',
      skipBuild: opts.skipBuild,
      dryRun: opts.dryRun,
    };
  }

  // Check for required API keys
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log(chalk.yellow('⚠️  ANTHROPIC_API_KEY not found in environment'));
    console.log(chalk.gray('   Add it to .env or export it in your shell'));
    if (jobId) await updateJobStatus(jobId, 'failed', 0, 0, 'ANTHROPIC_API_KEY not configured', modeId);
    process.exit(1);
  }

  if (config.dryRun) {
    console.log(chalk.yellow('🔍 DRY RUN - No files will be written\n'));
  }

  console.log(chalk.gray(`Transcript: ${transcriptPath}`));
  console.log(chalk.gray(`Output: ${outputPath}`));
  console.log(chalk.gray(`Workflow: ${config.workflow}\n`));

  // Ensure output directory exists
  if (!config.dryRun) {
    await ensureDir(outputPath);
  }

  // Check for regeneration mode
  const isRegeneration = opts.regenerate && jobId;
  const pipelineStages = resolvePipelineStages(modeId);
  const orderedStages = [...pipelineStages].sort((a, b) => a.order - b.order);
  const hasBlobStage = orderedStages.some((stage) => stage.id === 'blob-upload');

  try {
    let artifacts: Awaited<ReturnType<typeof generateArtifacts>> | null = null;
    let narrativeResearch: import('./lib/types.js').Artifact | null = null;
    let entitiesArtifact: import('./lib/types.js').Artifact | null = null;
    let opportunitiesArtifact: import('./lib/types.js').Artifact | null = null;
    let entities: import('./lib/types.js').ExtractedEntity[] | null = null;
    let opportunities: ExtractedOpportunity[] | null = null;

    let siteConfigArtifact: import('./lib/types.js').Artifact | null = null;
    let siteConfig: import('./lib/types.js').SiteConfig | null = null;
    let distPath: string | undefined;
    let blobPath: string | undefined;

    if (isRegeneration) {
      // REGENERATION MODE: Re-use existing artifacts, skip to stage 4
      console.log(chalk.yellow('\n🔄 REGENERATION MODE - Re-using existing artifacts\n'));

      if (jobId) await updateJobStatus(jobId, 'regenerating_microsite', 4, 0, undefined, modeId);
      spinner.start('Fetching existing artifacts from database...');

      const existingArtifacts = await fetchExistingArtifacts(jobId, modeId);

      artifacts = {
        cleanedTranscript: existingArtifacts.cleanedTranscript,
        intelligenceBrief: existingArtifacts.intelligenceBrief,
        strategicQuestions: existingArtifacts.strategicQuestions,
      };
      narrativeResearch = existingArtifacts.narrativeResearch;
      entitiesArtifact = existingArtifacts.entitiesArtifact;
      opportunitiesArtifact = existingArtifacts.opportunitiesArtifact;
      entities = existingArtifacts.entities;
      opportunities = existingArtifacts.opportunities;

      spinner.succeed('Existing artifacts loaded');
      console.log(chalk.gray(`   ├── ${artifacts.cleanedTranscript.filename}`));
      console.log(chalk.gray(`   ├── ${artifacts.intelligenceBrief.filename}`));
      console.log(chalk.gray(`   ├── ${artifacts.strategicQuestions.filename}`));
      console.log(chalk.gray(`   ├── ${entitiesArtifact.filename} (${entities.length} entities)`));
      if (narrativeResearch) {
        console.log(chalk.gray(`   └── ${narrativeResearch.filename}`));
      }
      console.log(chalk.gray('\n   Skipping stages 1-3, proceeding to SITE_CONFIG generation...\n'));
    }

    const regenerationSkips = new Set(['artifacts', 'research', 'entities']);

    for (const stage of orderedStages) {
      if (isRegeneration && regenerationSkips.has(stage.id)) {
        continue;
      }

      switch (stage.id) {
        case 'artifacts': {
          if (jobId) await updateJobStatus(jobId, 'generating_artifacts', 1, 0, undefined, modeId);
          spinner.start('Stage 1/6: Generating artifacts...');
          artifacts = await generateArtifacts({
            config,
            spinner,
          });
          if (jobId) await updateJobStatus(jobId, 'generating_artifacts', 1, 100, undefined, modeId);
          spinner.succeed(`Stage 1/6: Artifacts generated (3 files)`);
          console.log(chalk.gray(`   ├── ${artifacts.cleanedTranscript.filename}`));
          console.log(chalk.gray(`   ├── ${artifacts.intelligenceBrief.filename}`));
          console.log(chalk.gray(`   └── ${artifacts.strategicQuestions.filename}`));
          break;
        }
        case 'research': {
          if (!artifacts) {
            throw new GenerationError(
              GenerationErrorType.VALIDATION_ERROR,
              'Artifacts are required before research stage'
            );
          }
          if (jobId) await updateJobStatus(jobId, 'research', 2, 0, undefined, modeId);
          const hasExternalKeys = process.env.XAI_API_KEY || process.env.PERPLEXITY_API_KEY;
          if (hasExternalKeys) {
            spinner.start('\nStage 2/6: Executing multi-AI research chain...');
            const preliminaryEntities = extractPreliminaryEntities(artifacts.intelligenceBrief.content);
            console.log(chalk.gray(`\n   Found ${preliminaryEntities.length} entities to research`));

            narrativeResearch = await executeResearchChain({
              config,
              intelligenceBrief: artifacts.intelligenceBrief.content,
              entities: preliminaryEntities,
              spinner,
              outputDir: outputPath,
            });

            if (narrativeResearch) {
              spinner.succeed(`Stage 2/6: Research chain complete (1 file)`);
              console.log(chalk.gray(`   └── ${narrativeResearch.filename}`));
            } else {
              spinner.warn('Stage 2/6: Research chain completed with no output');
            }
          } else {
            console.log(chalk.yellow('\n⏸️  Stage 2/6: Skipping multi-AI research (no XAI_API_KEY or PERPLEXITY_API_KEY)'));
          }
          if (jobId) await updateJobStatus(jobId, 'research', 2, 100, undefined, modeId);
          break;
        }
        case 'entities': {
          if (!artifacts) {
            throw new GenerationError(
              GenerationErrorType.VALIDATION_ERROR,
              'Artifacts are required before entity extraction'
            );
          }
          if (jobId) await updateJobStatus(jobId, 'entity_extraction', 3, 0, undefined, modeId);
          spinner.start('\nStage 3/6: Extracting entities...');
          const extractionResult = await extractEntities({
            config,
            intelligenceBrief: artifacts.intelligenceBrief,
            narrativeResearch: narrativeResearch || null,
            spinner,
            outputDir: outputPath,
          });
          entitiesArtifact = extractionResult.entitiesArtifact;
          opportunitiesArtifact = extractionResult.opportunitiesArtifact;
          entities = extractionResult.entities;
          opportunities = extractionResult.opportunities;
          spinner.succeed(`Stage 3/6: Entities extracted (${entities.length} entities, ${opportunities.length} opportunities)`);
          console.log(chalk.gray(`   ├── ${entitiesArtifact.filename}`));
          if (opportunitiesArtifact) {
            console.log(chalk.gray(`   └── ${opportunitiesArtifact.filename}`));
          }
          if (jobId) await updateJobStatus(jobId, 'entity_extraction', 3, 100, undefined, modeId);
          break;
        }
        case 'site-config': {
          if (!artifacts || !entities) {
            throw new GenerationError(
              GenerationErrorType.VALIDATION_ERROR,
              'Artifacts and entities are required before SITE_CONFIG'
            );
          }
          if (jobId) await updateJobStatus(jobId, 'site_config', 4, 0, undefined, modeId);
          spinner.start('\nStage 4/6: Generating SITE_CONFIG...');
          siteConfigArtifact = await generateSiteConfig({
            config,
            intelligenceBrief: artifacts.intelligenceBrief,
            strategicQuestions: artifacts.strategicQuestions,
            narrativeResearch,
            entities,
            spinner,
            outputDir: outputPath,
          });
          siteConfig = JSON.parse(siteConfigArtifact.content);
          spinner.succeed(`Stage 4/6: SITE_CONFIG generated`);
          console.log(chalk.gray(`   ├── ${siteConfigArtifact.filename}`));
          console.log(chalk.gray(`   ├── ${siteConfig.keyFindings.length} key findings`));
          console.log(chalk.gray(`   ├── ${siteConfig.recommendations.length} recommendations`));
          console.log(chalk.gray(`   └── ${siteConfig.deepDives.length} deep dives`));
          if (jobId) await updateJobStatus(jobId, 'site_config', 4, 100, undefined, modeId);
          break;
        }
        case 'microsite': {
          if (!siteConfig || !siteConfigArtifact || !artifacts || !entities || !entitiesArtifact) {
            throw new GenerationError(
              GenerationErrorType.VALIDATION_ERROR,
              'Artifacts, entities, and SITE_CONFIG are required before microsite build'
            );
          }
          if (jobId) await updateJobStatus(jobId, 'building', 5, 0, undefined, modeId);
          spinner.start('\nStage 5/6: Building microsite...');
          distPath = await buildMicrosite({
            config,
            siteConfig,
            entities,
            artifacts: {
              cleanedTranscript: artifacts.cleanedTranscript,
              intelligenceBrief: artifacts.intelligenceBrief,
              strategicQuestions: artifacts.strategicQuestions,
              narrativeResearch,
              entities: entitiesArtifact,
              siteConfig: siteConfigArtifact,
            },
            spinner,
            outputDir: outputPath,
          });
          if (distPath) {
            if (config.skipBuild) {
              spinner.succeed(`Stage 5/6: Microsite prepared (build skipped)`);
            } else {
              spinner.succeed(`Stage 5/6: Microsite built`);
            }
            console.log(chalk.gray(`   └── ${path.relative(outputPath, distPath)}/`));
          }
          if (!hasBlobStage && jobId) {
            await updateJobStatus(jobId, 'building', 5, 100, undefined, modeId);
          }
          break;
        }
        case 'blob-upload': {
          if (distPath && !config.skipBuild && !config.dryRun && isBlobConfigured()) {
            spinner.start('\nStage 5b: Uploading to Vercel Blob...');
            const micrositeSlug = slugify(siteConfig?.branding.title || 'microsite');
            const blobResult = await uploadToBlob({
              distPath,
              slug: micrositeSlug,
              spinner,
            });
            blobPath = blobResult.blobPath;
            spinner.succeed(`Stage 5b: Uploaded to Vercel Blob`);
            console.log(chalk.gray(`   ├── Path: ${blobResult.blobPath}`));
            console.log(chalk.gray(`   ├── Files: ${blobResult.fileCount}`));
            console.log(chalk.gray(`   └── Size: ${formatBytes(blobResult.totalSize)}`));
          } else if (!isBlobConfigured()) {
            console.log(chalk.yellow('\n⏸️  Stage 5b: Skipping blob upload (BLOB_READ_WRITE_TOKEN not set)'));
          }
          if (jobId) await updateJobStatus(jobId, 'building', 5, 100, undefined, modeId);
          break;
        }
        case 'graph': {
          if (!siteConfig || !siteConfigArtifact || !artifacts || !entities || !entitiesArtifact) {
            throw new GenerationError(
              GenerationErrorType.VALIDATION_ERROR,
              'Artifacts, entities, and SITE_CONFIG are required before graph integration'
            );
          }
          if (jobId) await updateJobStatus(jobId, 'graph_integration', 6, 0, undefined, modeId);
          spinner.start('\nStage 6/6: Integrating with graph database...');
          const graphResult = await integrateWithGraph({
            config,
            siteConfig,
            entities,
            opportunities: opportunities ?? [],
            artifacts: {
              cleanedTranscript: artifacts.cleanedTranscript,
              intelligenceBrief: artifacts.intelligenceBrief,
              strategicQuestions: artifacts.strategicQuestions,
              narrativeResearch,
              entities: entitiesArtifact,
              siteConfig: siteConfigArtifact,
            },
            spinner,
            outputDir: outputPath,
            blobPath, // Pass blob path for storage in database
          });
          if (graphResult) {
            spinner.succeed(`Stage 6/6: Graph integration complete`);
            console.log(chalk.gray(`   ├── Microsite ID: ${graphResult.micrositeId.slice(0, 8)}...`));
            console.log(chalk.gray(`   ├── ${graphResult.entityCount} entities indexed`));
            console.log(chalk.gray(`   ├── ${graphResult.relationCount} relations created`));
            if (graphResult.opportunityCount > 0) {
              console.log(chalk.gray(`   └── ${graphResult.opportunityCount} opportunities created`));
            } else {
              console.log(chalk.gray(`   └── 0 opportunities created`));
            }
          }
          break;
        }
        default:
          console.log(chalk.yellow(`\n⏸️  Skipping unknown stage: ${stage.id}`));
      }
    }

    // Mark job as completed
    if (jobId) await updateJobStatus(jobId, 'completed', 6, 100, undefined, modeId);

    console.log(chalk.green('\n✨ Pipeline complete!'));
    console.log(`   Artifacts: ${outputPath}/artifacts/`);
    if (distPath) {
      console.log(`   Microsite: ${distPath}/`);
    }
    console.log('');

  } catch (error) {
    spinner.fail('Generation failed');
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (jobId) await updateJobStatus(jobId, 'failed', 0, 0, errorMessage, modeId);
    if (error instanceof GenerationError) {
      console.error(chalk.red(`\nError [${error.type}]: ${error.message}`));
    } else {
      console.error(chalk.red('\nUnexpected error:'), error);
    }
    process.exit(1);
  }
}

main().catch(console.error);
