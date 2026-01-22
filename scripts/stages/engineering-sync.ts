// Stage: Engineering sync to database

import { DEFAULT_MODE_ID, getSchemaTable, type ModeId } from "@ritual-research/core";
import { getSupabaseClient, isSupabaseConfigured } from "../lib/supabase.js";
import { slugify } from "../utils/files.js";
import type {
  Artifact,
  EngineeringExtractionResult,
  EngineeringWikiPage,
  GenerationConfig,
} from "../lib/types.js";
import type { Ora } from "ora";

interface EngineeringSyncOptions {
  config: GenerationConfig;
  jobId?: string;
  extraction: EngineeringExtractionResult;
  wikiPages: EngineeringWikiPage[];
  artifacts: {
    meetingTranscript?: Artifact | null;
    entities?: Artifact | null;
    wiki?: Artifact | null;
    featureTracking?: Artifact | null;
    decisionLog?: Artifact | null;
  };
  spinner: Ora;
}

interface EngineeringSyncResult {
  entityCount: number;
  artifactCount: number;
}

export async function syncEngineeringOutputs(
  options: EngineeringSyncOptions
): Promise<EngineeringSyncResult | null> {
  const { config, jobId, extraction, wikiPages, artifacts, spinner } = options;

  if (!isSupabaseConfigured()) {
    spinner.warn("Skipping engineering sync (Supabase not configured)");
    return null;
  }

  const mode = (config.mode ?? DEFAULT_MODE_ID) as ModeId;
  const supabase = getSupabaseClient();

  const wikiMap = new Map<string, string>();
  for (const page of wikiPages) {
    wikiMap.set(page.topic.toLowerCase(), page.content);
  }

  const entitiesToUpsert = [
    ...extraction.topics.map((topic) => ({
      slug: slugify(topic.name),
      canonical_name: topic.name,
      aliases: [],
      type: "topic",
      metadata: {
        description: topic.description,
        category: topic.category,
        mentions: topic.mentions,
        related_topics: [],
        related_features: topic.related_features,
        related_decisions: topic.related_decisions,
        wiki_content: wikiMap.get(topic.name.toLowerCase()) || null,
      },
      appearance_count: topic.mentions?.length || 0,
      updated_at: new Date().toISOString(),
    })),
    ...extraction.decisions.map((decision) => ({
      slug: slugify(decision.title),
      canonical_name: decision.title,
      aliases: [],
      type: "decision",
      metadata: {
        status: decision.status,
        context: decision.context,
        decision: decision.decision,
        consequences: decision.consequences,
        related_topics: decision.related_topics,
        superseded_by: decision.superseded_by ?? null,
        decided_at: decision.decided_at ?? null,
      },
      appearance_count: 0,
      updated_at: new Date().toISOString(),
    })),
    ...extraction.features.map((feature) => ({
      slug: slugify(feature.name),
      canonical_name: feature.name,
      aliases: [],
      type: "feature",
      metadata: {
        description: feature.description,
        status: feature.status,
        owner: feature.owner,
        epic: feature.epic ?? null,
        asana_task_id: feature.asana_task_id ?? null,
        related_topics: feature.related_topics,
        related_decisions: feature.related_decisions,
        source: "transcript",
      },
      appearance_count: 0,
      updated_at: new Date().toISOString(),
    })),
    ...extraction.components.map((component) => ({
      slug: slugify(component.name),
      canonical_name: component.name,
      aliases: [],
      type: "component",
      metadata: {
        type: component.type,
        description: component.description,
        repository: component.repository ?? null,
        dependencies: component.dependencies,
        owned_by: component.owned_by ?? null,
        related_features: component.related_features,
      },
      appearance_count: 0,
      updated_at: new Date().toISOString(),
    })),
  ];

  if (entitiesToUpsert.length > 0) {
    const { error } = await supabase
      .from(getSchemaTable("entities", mode))
      .upsert(entitiesToUpsert, { onConflict: "slug", ignoreDuplicates: false });

    if (error) {
      throw new Error(`Failed to upsert engineering entities: ${error.message}`);
    }
  }

  let artifactCount = 0;
  if (jobId) {
    const artifactRecords = [
      artifacts.meetingTranscript,
      artifacts.entities,
      artifacts.wiki,
      artifacts.featureTracking,
      artifacts.decisionLog,
    ]
      .filter(Boolean)
      .map((artifact) => ({
        job_id: jobId,
        type: artifact!.id,
        file_path: artifact!.path,
        file_size: artifact!.content.length,
      }));

    if (artifactRecords.length > 0) {
      const { error } = await supabase
        .from(getSchemaTable("artifacts", mode))
        .insert(artifactRecords);

      if (error) {
        throw new Error(`Failed to store engineering artifacts: ${error.message}`);
      }
      artifactCount = artifactRecords.length;
    }
  } else if (artifacts.meetingTranscript) {
    spinner.warn("Skipping artifact storage (no job id provided)");
  }

  return {
    entityCount: entitiesToUpsert.length,
    artifactCount,
  };
}
