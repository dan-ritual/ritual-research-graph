// Stage: Engineering wiki + outputs

import path from "path";
import { generateJsonWithClaude } from "../lib/claude.js";
import { buildEngineeringWikiPrompt } from "../prompts/generate-engineering-wiki.js";
import { ensureDir, writeFile, slugify } from "../utils/files.js";
import type {
  Artifact,
  GenerationConfig,
  MeetingTranscript,
  EngineeringExtractionResult,
  EngineeringDecision,
  EngineeringFeature,
  EngineeringWikiPage,
} from "../lib/types.js";
import type { Ora } from "ora";

interface EngineeringWikiOptions {
  config: GenerationConfig;
  meeting: MeetingTranscript;
  extraction: EngineeringExtractionResult;
  spinner: Ora;
  outputDir: string;
}

interface EngineeringWikiOutput {
  pages: EngineeringWikiPage[];
  wikiArtifact: Artifact;
  decisionLogArtifact: Artifact;
  featureTrackingArtifact: Artifact;
}

function buildDecisionLog(decisions: EngineeringDecision[]): string {
  if (!decisions.length) {
    return "# Decision Log\n\nNo decisions captured.";
  }

  return [
    "# Decision Log",
    "",
    ...decisions.map((decision) =>
      [
        `## ${decision.title}`,
        `Status: ${decision.status}`,
        decision.decided_at ? `Decided: ${decision.decided_at}` : null,
        "",
        "### Context",
        decision.context || "(No context provided)",
        "",
        "### Decision",
        decision.decision || "(No decision recorded)",
        "",
        "### Consequences",
        decision.consequences || "(No consequences noted)",
      ].filter(Boolean).join("\n")
    ),
  ].join("\n\n");
}

function buildFeatureTracking(features: EngineeringFeature[]) {
  return {
    updatedAt: new Date().toISOString(),
    features: features.map((feature) => ({
      name: feature.name,
      description: feature.description,
      status: feature.status,
      owner: feature.owner,
      epic: feature.epic ?? null,
      related_topics: feature.related_topics,
      related_decisions: feature.related_decisions,
      asana_task_id: feature.asana_task_id ?? null,
    })),
  };
}

export async function generateEngineeringWiki(
  options: EngineeringWikiOptions
): Promise<EngineeringWikiOutput> {
  const { config, meeting, extraction, spinner, outputDir } = options;

  spinner.text = "Generating engineering wiki pages...";

  const response = await generateJsonWithClaude<{ pages: EngineeringWikiPage[] }>({
    prompt: buildEngineeringWikiPrompt(meeting, extraction),
    maxTokens: 8192,
    temperature: 0.4,
  });

  const pages = Array.isArray(response.pages) ? response.pages : [];

  const slug = slugify(config.title || meeting.title || "meeting");
  const artifactsDir = path.join(outputDir, "artifacts");
  const wikiDir = path.join(artifactsDir, "wiki");

  if (!config.dryRun) {
    await ensureDir(wikiDir);
    for (const page of pages) {
      const filename = `${slugify(page.topic)}.md`;
      await writeFile(path.join(wikiDir, filename), page.content);
    }
  }

  const wikiArtifact: Artifact = {
    id: "engineering_wiki",
    name: "Engineering Wiki",
    filename: `${slug}_Engineering_Wiki.json`,
    content: JSON.stringify({ pages }, null, 2),
  };
  wikiArtifact.path = path.join(artifactsDir, wikiArtifact.filename);

  const decisionLogArtifact: Artifact = {
    id: "decision_log",
    name: "Decision Log",
    filename: `${slug}_Decision_Log.md`,
    content: buildDecisionLog(extraction.decisions),
  };
  decisionLogArtifact.path = path.join(artifactsDir, decisionLogArtifact.filename);

  const featureTrackingArtifact: Artifact = {
    id: "feature_tracking",
    name: "Feature Tracking",
    filename: `${slug}_Feature_Tracking.json`,
    content: JSON.stringify(buildFeatureTracking(extraction.features), null, 2),
  };
  featureTrackingArtifact.path = path.join(artifactsDir, featureTrackingArtifact.filename);

  if (!config.dryRun) {
    await writeFile(wikiArtifact.path, wikiArtifact.content);
    await writeFile(decisionLogArtifact.path, decisionLogArtifact.content);
    await writeFile(featureTrackingArtifact.path, featureTrackingArtifact.content);
  }

  return { pages, wikiArtifact, decisionLogArtifact, featureTrackingArtifact };
}
