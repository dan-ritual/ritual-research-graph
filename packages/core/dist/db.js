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
};
export const DEFAULT_SCHEMA = "public";
export const MODE_SCHEMA_MAP = {
    growth: "growth",
    engineering: "engineering",
    skunkworks: "skunkworks",
};
export const SHARED_SCHEMA = "shared";
export function getSchemaForMode(mode) {
    return MODE_SCHEMA_MAP[mode];
}
export function getSchemaTable(table, mode, schemaOverride) {
    const schema = schemaOverride ?? getSchemaForMode(mode);
    return `${schema}.${DB_TABLES[table]}`;
}
