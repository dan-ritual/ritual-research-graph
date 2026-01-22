import type { ModeId } from "./modes/types.js";

export type DbSchema = "public" | "growth" | "engineering" | "skunkworks" | "shared";

export const DB_TABLES = {
  users: "users",
  cross_links: "cross_links",
  entities: "entities",
  entity_appearances: "entity_appearances",
  entity_relations: "entity_relations",
  microsites: "microsites",
  artifacts: "artifacts",
  generation_jobs: "generation_jobs",
  opportunities: "opportunities",
  opportunity_entities: "opportunity_entities",
  opportunity_activity: "opportunity_activity",
  opportunity_owners: "opportunity_owners",
  pipeline_workflows: "pipeline_workflows",
  pipeline_stages: "pipeline_stages",
  transcripts: "transcripts",
  entity_opportunities: "entity_opportunities",
} as const;

export type DbTable = keyof typeof DB_TABLES;

export const DEFAULT_SCHEMA: DbSchema = "public";

export const MODE_SCHEMA_MAP: Record<ModeId, DbSchema> = {
  growth: "growth",
  engineering: "engineering",
  skunkworks: "skunkworks",
};

export const SHARED_SCHEMA: DbSchema = "shared";

export function getSchemaForMode(mode: ModeId): DbSchema {
  return MODE_SCHEMA_MAP[mode];
}

export function getSchemaTable(table: DbTable, mode: ModeId, schemaOverride?: DbSchema): string {
  const schema = schemaOverride ?? getSchemaForMode(mode);
  return `${schema}.${DB_TABLES[table]}`;
}
