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
import { fileExists, ensureDir } from './utils/files.js';
import { slugify } from './utils/files.js';
import { GenerationError, GenerationErrorType } from './lib/errors.js';
import type { GenerationConfig } from './lib/types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

program
  .name('generate')
  .description('Generate microsite from transcript')
  .requiredOption('-t, --transcript <path>', 'Path to transcript file')
  .option('-w, --workflow <type>', 'Workflow type', 'market-landscape')
  .option('-o, --output <path>', 'Output directory', './outputs/microsites/new-research')
  .option('--title <title>', 'Microsite title')
  .option('--subtitle <subtitle>', 'Microsite subtitle')
  .option('--accent <color>', 'Accent color hex', '#3B5FE6')
  .option('--skip-build', 'Skip Vite build step')
  .option('--dry-run', 'Show what would be generated without running')
  .parse();

async function main() {
  const opts = program.opts();
  const spinner = ora();

  console.log(chalk.blue('\n🔬 Ritual Research Graph - Generator\n'));

  // Resolve paths
  const transcriptPath = path.resolve(opts.transcript);
  const outputPath = path.resolve(opts.output);

  // Validate transcript exists
  if (!(await fileExists(transcriptPath))) {
    throw new GenerationError(
      GenerationErrorType.TRANSCRIPT_NOT_FOUND,
      `Transcript not found: ${transcriptPath}`
    );
  }

  // Check for required API keys
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log(chalk.yellow('⚠️  ANTHROPIC_API_KEY not found in environment'));
    console.log(chalk.gray('   Add it to .env or export it in your shell'));
    process.exit(1);
  }

  const config: GenerationConfig = {
    transcript: transcriptPath,
    workflow: opts.workflow,
    output: outputPath,
    title: opts.title,
    subtitle: opts.subtitle,
    accent: opts.accent,
    skipBuild: opts.skipBuild,
    dryRun: opts.dryRun,
  };

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

  try {
    // Stage 1: Generate artifacts
    spinner.start('Stage 1/6: Generating artifacts...');
    const artifacts = await generateArtifacts({
      config,
      spinner,
    });
    spinner.succeed(`Stage 1/6: Artifacts generated (3 files)`);
    console.log(chalk.gray(`   ├── ${artifacts.cleanedTranscript.filename}`));
    console.log(chalk.gray(`   ├── ${artifacts.intelligenceBrief.filename}`));
    console.log(chalk.gray(`   └── ${artifacts.strategicQuestions.filename}`));

    // Stage 2: Multi-AI Research Chain
    let narrativeResearch: import('./lib/types.js').Artifact | null = null;
    const hasExternalKeys = process.env.XAI_API_KEY || process.env.PERPLEXITY_API_KEY;
    if (hasExternalKeys) {
      spinner.start('\nStage 2/6: Executing multi-AI research chain...');
      const entities = extractPreliminaryEntities(artifacts.intelligenceBrief.content);
      console.log(chalk.gray(`\n   Found ${entities.length} entities to research`));

      narrativeResearch = await executeResearchChain({
        config,
        intelligenceBrief: artifacts.intelligenceBrief.content,
        entities,
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

    // Stage 3: Entity Extraction
    spinner.start('\nStage 3/6: Extracting entities...');
    const extractionResult = await extractEntities({
      config,
      intelligenceBrief: artifacts.intelligenceBrief,
      narrativeResearch: narrativeResearch || null,
      spinner,
      outputDir: outputPath,
    });
    const { entitiesArtifact, opportunitiesArtifact, entities, opportunities } = extractionResult;
    spinner.succeed(`Stage 3/6: Entities extracted (${entities.length} entities, ${opportunities.length} opportunities)`);
    console.log(chalk.gray(`   ├── ${entitiesArtifact.filename}`));
    if (opportunitiesArtifact) {
      console.log(chalk.gray(`   └── ${opportunitiesArtifact.filename}`));
    }

    // Stage 4: SITE_CONFIG Generation
    spinner.start('\nStage 4/6: Generating SITE_CONFIG...');
    const siteConfigArtifact = await generateSiteConfig({
      config,
      intelligenceBrief: artifacts.intelligenceBrief,
      strategicQuestions: artifacts.strategicQuestions,
      narrativeResearch,
      entities,
      spinner,
      outputDir: outputPath,
    });
    const siteConfig = JSON.parse(siteConfigArtifact.content);
    spinner.succeed(`Stage 4/6: SITE_CONFIG generated`);
    console.log(chalk.gray(`   ├── ${siteConfigArtifact.filename}`));
    console.log(chalk.gray(`   ├── ${siteConfig.keyFindings.length} key findings`));
    console.log(chalk.gray(`   ├── ${siteConfig.recommendations.length} recommendations`));
    console.log(chalk.gray(`   └── ${siteConfig.deepDives.length} deep dives`));

    // Stage 5: Microsite Build
    spinner.start('\nStage 5/6: Building microsite...');
    const distPath = await buildMicrosite({
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

    // Stage 5b: Upload to Vercel Blob (optional)
    let blobPath: string | undefined;
    if (distPath && !config.skipBuild && !config.dryRun && isBlobConfigured()) {
      spinner.start('\nStage 5b: Uploading to Vercel Blob...');
      const micrositeSlug = slugify(siteConfig.branding.title);
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

    // Stage 6: Graph Integration
    spinner.start('\nStage 6/6: Integrating with graph database...');
    const graphResult = await integrateWithGraph({
      config,
      siteConfig,
      entities,
      opportunities,
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

    console.log(chalk.green('\n✨ Pipeline complete!'));
    console.log(`   Artifacts: ${outputPath}/artifacts/`);
    if (distPath) {
      console.log(`   Microsite: ${distPath}/`);
    }
    console.log('');

  } catch (error) {
    spinner.fail('Generation failed');
    if (error instanceof GenerationError) {
      console.error(chalk.red(`\nError [${error.type}]: ${error.message}`));
    } else {
      console.error(chalk.red('\nUnexpected error:'), error);
    }
    process.exit(1);
  }
}

main().catch(console.error);
