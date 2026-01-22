// Stage: Engineering entity extraction

import path from "path";
import { generateJsonWithClaude } from "../lib/claude.js";
import { buildEngineeringExtractionPrompt } from "../prompts/extract-engineering.js";
import { writeFile, slugify } from "../utils/files.js";
import type {
  Artifact,
  GenerationConfig,
  MeetingTranscript,
  EngineeringExtractionResult,
  EngineeringTopic,
  EngineeringDecision,
  EngineeringFeature,
  EngineeringComponent,
} from "../lib/types.js";
import type { Ora } from "ora";

interface EngineeringEntityOptions {
  config: GenerationConfig;
  meeting: MeetingTranscript;
  spinner: Ora;
  outputDir: string;
}

interface EngineeringEntityOutput {
  extraction: EngineeringExtractionResult;
  entitiesArtifact: Artifact;
}

function dedupeByKey<T>(items: T[], getKey: (item: T) => string): T[] {
  const seen = new Map<string, T>();
  for (const item of items) {
    const key = getKey(item).toLowerCase();
    if (!seen.has(key)) {
      seen.set(key, item);
    }
  }
  return Array.from(seen.values());
}

function normalizeExtraction(result: EngineeringExtractionResult): EngineeringExtractionResult {
  const topics: EngineeringTopic[] = Array.isArray(result.topics) ? result.topics : [];
  const decisions: EngineeringDecision[] = Array.isArray(result.decisions) ? result.decisions : [];
  const features: EngineeringFeature[] = Array.isArray(result.features) ? result.features : [];
  const components: EngineeringComponent[] = Array.isArray(result.components) ? result.components : [];

  return {
    topics: dedupeByKey(topics, (topic) => topic.name),
    decisions: dedupeByKey(decisions, (decision) => decision.title),
    features: dedupeByKey(features, (feature) => feature.name),
    components: dedupeByKey(components, (component) => component.name),
  };
}

export async function extractEngineeringEntities(
  options: EngineeringEntityOptions
): Promise<EngineeringEntityOutput> {
  const { config, meeting, spinner, outputDir } = options;

  spinner.text = "Extracting engineering entities with Claude...";

  const extraction = await generateJsonWithClaude<EngineeringExtractionResult>({
    prompt: buildEngineeringExtractionPrompt(meeting),
    maxTokens: 8192,
    temperature: 0.3,
  });

  const normalized = normalizeExtraction(extraction);

  const slug = slugify(config.title || meeting.title || "meeting");
  const artifactsDir = path.join(outputDir, "artifacts");

  const entitiesArtifact: Artifact = {
    id: "engineering_entities",
    name: "Engineering Entities",
    filename: `${slug}_Engineering_Entities.json`,
    content: JSON.stringify({
      ...normalized,
      extractedAt: new Date().toISOString(),
    }, null, 2),
  };
  entitiesArtifact.path = path.join(artifactsDir, entitiesArtifact.filename);

  if (!config.dryRun) {
    await writeFile(entitiesArtifact.path, entitiesArtifact.content);
  }

  return { extraction: normalized, entitiesArtifact };
}
