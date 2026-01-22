import {
  DEFAULT_MODE_ID,
  SHARED_SCHEMA,
  getSchemaForMode as coreGetSchemaForMode,
  getSchemaTable as coreGetSchemaTable,
  type DbSchema,
  type DbTable,
  type ModeId,
} from "@ritual-research/core";
import { cookies, headers } from "next/headers";

const COOKIE_NAME = "ritual-mode";
const HEADER_NAME = "x-ritual-mode";

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

/**
 * Resolve mode from various sources (for API routes):
 * 1. Explicit mode parameter
 * 2. X-Ritual-Mode header
 * 3. ritual-mode cookie
 * 4. Default mode
 */
export async function resolveMode(explicitMode?: string): Promise<ModeId> {
  // If explicit mode provided, validate and use it
  if (explicitMode) {
    const validModes: ModeId[] = ["growth", "engineering", "skunkworks"];
    if (validModes.includes(explicitMode as ModeId)) {
      return explicitMode as ModeId;
    }
  }

  try {
    // Check header
    const headersList = await headers();
    const headerMode = headersList.get(HEADER_NAME);
    if (headerMode && ["growth", "engineering", "skunkworks"].includes(headerMode)) {
      return headerMode as ModeId;
    }

    // Check cookie
    const cookieStore = await cookies();
    const cookieMode = cookieStore.get(COOKIE_NAME)?.value;
    if (cookieMode && ["growth", "engineering", "skunkworks"].includes(cookieMode)) {
      return cookieMode as ModeId;
    }
  } catch {
    // Headers/cookies not available in this context
  }

  return DEFAULT_MODE_ID;
}

export { SHARED_SCHEMA };
export type { DbSchema, DbTable, ModeId };
