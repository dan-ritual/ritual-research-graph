// Stage: Asana one-way feature import

import { DEFAULT_MODE_ID, getSchemaTable, type ModeId } from "@ritual-research/core";
import { fetchAsanaTasks, mapAsanaSectionToStatus } from "../lib/asana.js";
import { getSupabaseClient, isSupabaseConfigured } from "../lib/supabase.js";
import type { GenerationConfig } from "../lib/types.js";
interface AsanaImportOptions {
  config: GenerationConfig;
}

interface AsanaImportResult {
  imported: number;
  skipped: number;
  reason?: string;
}

export async function importAsanaFeatures(
  options: AsanaImportOptions
): Promise<AsanaImportResult | null> {
  const { config } = options;

  if (!isSupabaseConfigured()) {
    return { imported: 0, skipped: 0, reason: "Supabase not configured" };
  }

  const accessToken = process.env.ASANA_ACCESS_TOKEN;
  const projectId = config.asanaProjectId || process.env.ASANA_PROJECT_ID;

  if (!accessToken || !projectId) {
    return { imported: 0, skipped: 0, reason: "ASANA_ACCESS_TOKEN or ASANA_PROJECT_ID missing" };
  }

  const supabase = getSupabaseClient();
  const mode = (config.mode ?? DEFAULT_MODE_ID) as ModeId;

  const tasks = await fetchAsanaTasks(projectId, accessToken);
  if (tasks.length === 0) {
    return { imported: 0, skipped: 0, reason: "No tasks found" };
  }

  const records = tasks.map((task) => {
    const sectionName =
      task.memberships?.find((m) => m.project?.gid === projectId)?.section?.name || null;

    return {
      slug: `asana-${task.gid}`,
      canonical_name: task.name,
      aliases: [],
      type: "feature",
      metadata: {
        description: task.notes ?? "",
        status: mapAsanaSectionToStatus(sectionName),
        owner: task.assignee?.name ?? null,
        asana_task_id: task.gid,
        asana_section: sectionName,
        source: "asana",
      },
      appearance_count: 0,
      updated_at: new Date().toISOString(),
    };
  });

  const { error } = await supabase
    .from(getSchemaTable("entities", mode))
    .upsert(records, { onConflict: "slug", ignoreDuplicates: false });

  if (error) {
    throw new Error(`Failed to import Asana tasks: ${error.message}`);
  }

  return { imported: records.length, skipped: 0 };
}
