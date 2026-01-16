// Stage 5: Microsite Build

import path from 'path';
import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import { ensureDir, writeFile, readFile, fileExists } from '../utils/files.js';
import type { Artifact, GenerationConfig, SiteConfig, ExtractedEntity } from '../lib/types.js';
import type { Ora } from 'ora';

const execAsync = promisify(exec);

interface MicrositeOptions {
  config: GenerationConfig;
  siteConfig: SiteConfig;
  entities: ExtractedEntity[];
  artifacts: {
    cleanedTranscript: Artifact;
    intelligenceBrief: Artifact;
    strategicQuestions: Artifact;
    narrativeResearch?: Artifact | null;
    entities: Artifact;
    siteConfig: Artifact;
  };
  spinner: Ora;
  outputDir: string;
}

const TEMPLATE_PATH = '/Users/danielgosek/Downloads/defi-rwa';

export async function buildMicrosite(options: MicrositeOptions): Promise<string> {
  const { config, siteConfig, entities, artifacts, spinner, outputDir } = options;

  const siteDir = path.join(outputDir, 'site');

  // Step 1: Copy template files
  spinner.text = 'Stage 5/6: Copying template files...';
  await copyTemplateFiles(siteDir);

  // Step 2: Copy artifacts to public directory
  spinner.text = 'Stage 5/6: Copying artifacts to site...';
  await copyArtifacts(artifacts, siteDir);

  // Step 3: Generate config.js with SITE_CONFIG data
  spinner.text = 'Stage 5/6: Generating site configuration...';
  await generateConfigModule(siteConfig, entities, siteDir);

  // Step 4: Generate App.jsx with imported config
  spinner.text = 'Stage 5/6: Generating application code...';
  await generateAppComponent(siteDir);

  // Step 5: Install dependencies and build (skip if --skip-build or --dry-run)
  if (config.skipBuild) {
    spinner.info('Stage 5/6: Skipping npm build (--skip-build)');
    return siteDir;
  }

  if (!config.dryRun) {
    spinner.text = 'Stage 5/6: Installing dependencies...';
    await execAsync('npm install', { cwd: siteDir });

    spinner.text = 'Stage 5/6: Building microsite...';
    await execAsync('npm run build', { cwd: siteDir });
  }

  const distPath = path.join(siteDir, 'dist');
  return distPath;
}

async function copyTemplateFiles(destDir: string) {
  await ensureDir(destDir);
  await ensureDir(path.join(destDir, 'src'));
  await ensureDir(path.join(destDir, 'public'));

  // Copy essential files
  const filesToCopy = [
    'package.json',
    'vite.config.js',
    'index.html',
    'src/main.jsx',
  ];

  for (const file of filesToCopy) {
    const src = path.join(TEMPLATE_PATH, file);
    const dest = path.join(destDir, file);

    if (await fileExists(src)) {
      const content = await fs.readFile(src, 'utf-8');
      await writeFile(dest, content);
    }
  }

  // Copy public directory files
  const publicDir = path.join(TEMPLATE_PATH, 'public');
  if (await fileExists(publicDir)) {
    const files = await fs.readdir(publicDir);
    for (const file of files) {
      const src = path.join(publicDir, file);
      const dest = path.join(destDir, 'public', file);
      const stat = await fs.stat(src);
      if (stat.isFile()) {
        const content = await fs.readFile(src);
        await fs.mkdir(path.dirname(dest), { recursive: true });
        await fs.writeFile(dest, content);
      }
    }
  }
}

async function copyArtifacts(
  artifacts: MicrositeOptions['artifacts'],
  siteDir: string
) {
  const publicDir = path.join(siteDir, 'public', 'artifacts');
  await ensureDir(publicDir);

  // Copy all artifact files
  const artifactList = [
    artifacts.cleanedTranscript,
    artifacts.intelligenceBrief,
    artifacts.strategicQuestions,
    artifacts.narrativeResearch,
    artifacts.entities,
    artifacts.siteConfig,
  ].filter(Boolean) as Artifact[];

  for (const artifact of artifactList) {
    if (artifact.path && await fileExists(artifact.path)) {
      const dest = path.join(publicDir, artifact.filename);
      await fs.copyFile(artifact.path, dest);
    }
  }
}

async function generateConfigModule(
  siteConfig: SiteConfig,
  entities: ExtractedEntity[],
  siteDir: string
) {
  // Transform entities to PROJECTS format expected by template
  const projects: Record<string, { website: string | null; twitter: string | null; tvSymbol: string | null }> = {};
  for (const [name, data] of Object.entries(siteConfig.entities)) {
    projects[name] = {
      website: data.website || null,
      twitter: data.twitter || null,
      tvSymbol: data.tvSymbol || null,
    };
  }

  // Transform keyFindings and recommendations
  const executiveSummary = {
    title: siteConfig.branding.title,
    subtitle: siteConfig.branding.subtitle,
    thesis: siteConfig.thesis,
    keyFindings: siteConfig.keyFindings,
    recommendations: siteConfig.recommendations,
  };

  // Transform deepDives
  const deepDives = siteConfig.deepDives.map((dive, i) => ({
    id: dive.id,
    title: `FIG.${String(i + 1).padStart(3, '0')} · ${dive.title}`,
    subtitle: dive.subtitle,
    isContent: dive.isContent || false,
    content: dive.content || undefined,
    file: dive.file || undefined,
    summary: dive.summary || undefined,
  }));

  // Transform sourceArtifacts
  const sourceArtifacts = siteConfig.sourceArtifacts.map(artifact => ({
    id: artifact.id,
    title: artifact.title,
    subtitle: artifact.subtitle,
    file: artifact.file,
    description: artifact.description,
  }));

  const configContent = `// Generated SITE_CONFIG - DO NOT EDIT
// Generated at: ${new Date().toISOString()}

export const PROJECTS = ${JSON.stringify(projects, null, 2)};

export const EXECUTIVE_SUMMARY = ${JSON.stringify(executiveSummary, null, 2)};

export const DEEP_DIVES = ${JSON.stringify(deepDives, null, 2)};

export const SOURCE_ARTIFACTS = ${JSON.stringify(sourceArtifacts, null, 2)};

export const ACCENT_COLOR = '${siteConfig.branding.accentColor}';
`;

  await writeFile(path.join(siteDir, 'src', 'config.js'), configContent);
}

async function generateAppComponent(siteDir: string) {
  // For MVP: Copy original App.jsx as-is
  // The config.js provides the data structure for manual integration
  // Future: auto-generate App.jsx from template with injected imports
  const src = path.join(TEMPLATE_PATH, 'src', 'App.jsx');
  const dest = path.join(siteDir, 'src', 'App.jsx');

  if (await fileExists(src)) {
    const content = await fs.readFile(src, 'utf-8');
    await writeFile(dest, content);
  }

  // Also generate a README with integration instructions
  const readme = `# Generated Microsite

This microsite was generated from the Ritual Research Graph pipeline.

## Generated Files

- \`src/config.js\` - Contains all research data in the SITE_CONFIG format
- \`public/artifacts/\` - Source documents and extracted data

## Manual Integration

To use the generated config in App.jsx:

1. Add import at top of App.jsx:
   \`\`\`javascript
   import { PROJECTS, EXECUTIVE_SUMMARY, DEEP_DIVES, SOURCE_ARTIFACTS } from './config.js';
   \`\`\`

2. Remove the inline data constants (PROJECTS, EXECUTIVE_SUMMARY, DEEP_DIVES, SOURCE_ARTIFACTS)

3. The app will now use your generated research data

## Build Commands

\`\`\`bash
npm install
npm run build
npm run preview  # To test locally
\`\`\`

## Deployment

The \`dist/\` folder contains the static site ready for deployment to any static host.
`;

  await writeFile(path.join(siteDir, 'README.md'), readme);
}
