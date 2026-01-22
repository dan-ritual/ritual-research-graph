# SPEC_FUTURE_DB_ENTITIES: Database-Driven Entity Types

> **Status:** Future (Pending Trigger)
> **Phase:** Post-Phase 3+
> **Trigger:** When code-driven entity types become limiting
> **Dependencies:** Phase 1 Mode System complete

---

## Overview

This spec defines the migration path from code-driven entity types (TypeScript config files) to database-driven entity types (admin-configurable at runtime). This is a **scalability upgrade** to be implemented when:

- Adding new entity types becomes a frequent operation
- Non-developers need to configure entity types
- Entity type definitions need versioning/history
- Multi-tenant or external deployment is needed

---

## Current State (Phase 1)

Entity types defined in TypeScript config:

```typescript
// packages/core/src/modes/growth.config.ts
export const growthConfig: ModeConfig = {
  id: 'growth',
  entityTypes: [
    { type: 'company', displayName: 'Company', ... },
    { type: 'protocol', displayName: 'Protocol', ... },
    // ...
  ]
};
```

**Pros:** Type-safe, compile-time checks, simple deployment
**Cons:** Requires code deploy to add types, no admin UI, no versioning

---

## Target State

Entity types stored in database with admin UI:

```sql
CREATE TABLE shared.entity_type_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mode_id TEXT NOT NULL,
  type_slug TEXT NOT NULL,
  display_name TEXT NOT NULL,
  display_name_plural TEXT NOT NULL,
  icon TEXT,
  fields JSONB NOT NULL,  -- Field definitions
  searchable_fields TEXT[],
  version INT DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES shared.users(id),

  UNIQUE(mode_id, type_slug)
);

-- Field definition example in JSONB:
-- [
--   { "id": "name", "type": "string", "required": true, "label": "Name" },
--   { "id": "sector", "type": "enum", "options": ["DeFi", "Infrastructure", ...] },
--   { "id": "website", "type": "url", "required": false }
-- ]
```

---

## Migration Path

### Step 1: Dual-Read (Backward Compatible)

```typescript
async function getEntityTypes(modeId: string): Promise<EntityTypeConfig[]> {
  // Try database first
  const dbTypes = await supabase
    .from('shared.entity_type_definitions')
    .select('*')
    .eq('mode_id', modeId)
    .eq('is_active', true);

  if (dbTypes.data?.length > 0) {
    return dbTypes.data.map(toEntityTypeConfig);
  }

  // Fall back to code config
  return getModeConfig(modeId).entityTypes;
}
```

### Step 2: Migration Script

```typescript
// Migrate code configs to database
async function migrateEntityTypesToDb() {
  for (const mode of ['growth', 'engineering', 'product']) {
    const config = getModeConfig(mode);
    for (const entityType of config.entityTypes) {
      await supabase
        .from('shared.entity_type_definitions')
        .upsert({
          mode_id: mode,
          type_slug: entityType.type,
          display_name: entityType.displayName,
          // ...
        });
    }
  }
}
```

### Step 3: Admin UI

Build admin interface for:
- Viewing entity types per mode
- Adding new entity types
- Editing field definitions
- Deprecating (soft-delete) types
- Versioning and rollback

### Step 4: Remove Code Configs

Once all types are in database and admin UI is validated:
- Remove static config files
- Update all type lookups to use database
- Add caching layer for performance

---

## Validation Strategy

Entity data must be validated against dynamic schemas:

```typescript
import { z } from 'zod';

function buildZodSchema(fields: FieldDefinition[]): z.ZodObject<any> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    let fieldSchema: z.ZodTypeAny;

    switch (field.type) {
      case 'string':
        fieldSchema = z.string();
        break;
      case 'url':
        fieldSchema = z.string().url();
        break;
      case 'enum':
        fieldSchema = z.enum(field.options as [string, ...string[]]);
        break;
      // ... other types
    }

    if (!field.required) {
      fieldSchema = fieldSchema.optional();
    }

    shape[field.id] = fieldSchema;
  }

  return z.object(shape);
}
```

---

## Open Questions (For Elicitation When Triggered)

1. Should entity type changes require approval workflow?
2. How to handle existing entities when type definition changes?
3. Should we support computed/derived fields?
4. What's the versioning strategy for type definitions?
5. How to handle type deletion with existing entities?

---

## Win Conditions

- [ ] Entity types can be added via admin UI without code deploy
- [ ] Existing code-driven types migrated successfully
- [ ] Validation works with dynamic schemas
- [ ] No regression in entity CRUD operations
- [ ] Admin UI has proper access controls

---

## Effort Estimate

| Task | Duration | Dependencies |
|------|----------|--------------|
| Database schema | 2d | None |
| Dual-read layer | 2d | Schema |
| Migration script | 1d | Dual-read |
| Admin UI | 5d | Migration |
| Testing & validation | 2d | Admin UI |
| Code config removal | 1d | Testing |

**Total:** ~13 days

---

## Notes

This spec is intentionally deferred. Code-driven entity types are sufficient for Phase 1-3 and keep the system simple. Only implement this when the trigger conditions are met.
