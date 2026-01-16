// Stage 1: Artifact Generation (Claude)

import path from 'path';
import { generateWithClaude } from '../lib/claude.js';
import { buildCleanTranscriptPrompt } from '../prompts/clean-transcript.js';
import { buildIntelligenceBriefPrompt } from '../prompts/intelligence-brief.js';
import { buildStrategicQuestionsPrompt } from '../prompts/strategic-questions.js';
import { readFile, writeFile } from '../utils/files.js';
import type { Artifact, GeneratedArtifacts, GenerationConfig } from '../lib/types.js';
import type { Ora } from 'ora';

interface ArtifactGenerationOptions {
  config: GenerationConfig;
  spinner: Ora;
  onProgress?: (artifact: string, percent: number) => void;
}

export async function generateArtifacts(
  options: ArtifactGenerationOptions
): Promise<GeneratedArtifacts> {
  const { config, spinner, onProgress } = options;
  const { transcript, output } = config;

  // Read raw transcript
  spinner.text = 'Stage 1/6: Reading transcript...';
  const rawTranscript = await readFile(transcript);

  // Infer topic from filename or use default
  const topic = inferTopic(transcript, config.title);

  // Create slug for filenames
  const slug = createSlug(config.title || topic);
  const artifactsDir = path.join(output, 'artifacts');

  // 1. Clean Transcript
  spinner.text = 'Stage 1/6: Generating cleaned transcript...';
  onProgress?.('cleaned-transcript', 10);

  const cleanedTranscriptContent = await generateWithClaude({
    prompt: buildCleanTranscriptPrompt(topic, rawTranscript),
    maxTokens: 8192,
    temperature: 0.3, // Lower temperature for cleaning
  });

  const cleanedTranscript: Artifact = {
    id: 'cleaned-transcript',
    name: 'Cleaned Transcript',
    filename: `${slug}_Transcript_Clean.md`,
    content: cleanedTranscriptContent,
  };
  cleanedTranscript.path = path.join(artifactsDir, cleanedTranscript.filename);

  // Save cleaned transcript
  if (!config.dryRun) {
    await writeFile(cleanedTranscript.path, cleanedTranscript.content);
  }

  // 2. Intelligence Brief
  spinner.text = 'Stage 1/6: Generating intelligence brief...';
  onProgress?.('intelligence-brief', 40);

  const intelligenceBriefContent = await generateWithClaude({
    prompt: buildIntelligenceBriefPrompt(topic, cleanedTranscriptContent),
    maxTokens: 8192,
    temperature: 0.7,
  });

  const intelligenceBrief: Artifact = {
    id: 'intelligence-brief',
    name: 'Intelligence Brief',
    filename: `${slug}_Intelligence_Brief.md`,
    content: intelligenceBriefContent,
  };
  intelligenceBrief.path = path.join(artifactsDir, intelligenceBrief.filename);

  if (!config.dryRun) {
    await writeFile(intelligenceBrief.path, intelligenceBrief.content);
  }

  // 3. Strategic Questions
  spinner.text = 'Stage 1/6: Generating strategic questions...';
  onProgress?.('strategic-questions', 70);

  const strategicQuestionsContent = await generateWithClaude({
    prompt: buildStrategicQuestionsPrompt(topic, cleanedTranscriptContent, intelligenceBriefContent),
    maxTokens: 8192,
    temperature: 0.7,
  });

  const strategicQuestions: Artifact = {
    id: 'strategic-questions',
    name: 'Strategic Questions',
    filename: `${slug}_Strategic_Questions.md`,
    content: strategicQuestionsContent,
  };
  strategicQuestions.path = path.join(artifactsDir, strategicQuestions.filename);

  if (!config.dryRun) {
    await writeFile(strategicQuestions.path, strategicQuestions.content);
  }

  onProgress?.('complete', 100);

  return {
    cleanedTranscript,
    intelligenceBrief,
    strategicQuestions,
  };
}

function inferTopic(transcriptPath: string, title?: string): string {
  if (title) return title;

  const filename = path.basename(transcriptPath, path.extname(transcriptPath));
  // Convert filename to readable topic
  return filename
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/transcript|raw|clean/gi, '')
    .trim();
}

function createSlug(topic: string): string {
  return topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
}
