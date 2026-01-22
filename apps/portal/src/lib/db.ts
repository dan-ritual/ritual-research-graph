import {
  SHARED_SCHEMA,
  getSchemaForMode as coreGetSchemaForMode,
  getSchemaTable as coreGetSchemaTable,
  type DbSchema,
  type DbTable,
  type ModeId,
} from "@ritual-research/core";

/**
 * Get the schema-qualified table name for a given mode.
 * Mode must be explicit to avoid defaulting to the wrong schema.
 */
export function getSchemaTable(
  table: DbTable,
  mode: ModeId,
  schemaOverride?: DbSchema
): string {
  return coreGetSchemaTable(table, mode, schemaOverride);
}

export function getSchemaForMode(mode: ModeId): DbSchema {
  return coreGetSchemaForMode(mode);
}

export { SHARED_SCHEMA };
export type { DbSchema, DbTable, ModeId };
