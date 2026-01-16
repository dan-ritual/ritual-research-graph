# Specification: Database Schema

**Parent:** [`MASTER_SPEC.md`](../MASTER_SPEC.md)
**Sequence:** Child Spec #2 of 8
**Phase:** 1a (Database & Storage) — **PREREQUISITE** for Phase 1b (Pipeline)
**Status:** Draft
**Created:** 2026-01-16
**Last Updated:** 2026-01-16

> **Key Decision (2026-01-16):** Supabase setup is now Phase 1a, executed BEFORE the Processing Pipeline. The CLI will write directly to Supabase rather than using local JSON files.

---

## Overview

This specification details the Supabase database schema, Row Level Security (RLS) policies, and storage configuration for the Ritual Research Graph.

> **Implementation Order:** This spec (Phase 1a) must be completed BEFORE [`SPEC_PROCESSING_PIPELINE.md`](./SPEC_PROCESSING_PIPELINE.md) (Phase 1b). The CLI relies on Supabase for job tracking, artifact storage, and entity registry.

### Platform Choice

**Supabase** was selected for:
- Hosted Postgres with managed infrastructure
- Built-in authentication (Google OAuth)
- Realtime subscriptions for job status
- Storage API for file uploads
- Generous free tier for MVP

### Authentication Decision

**Google OAuth** with domain restriction:
- Enforced at **Supabase level** (not application code)
- Only `@ritual.net` emails can authenticate
- Configure in Supabase Dashboard → Authentication → Providers → Google

### CLI Authentication

The CLI uses **service role key** (bypasses RLS):
- Stored in `SUPABASE_SERVICE_KEY` environment variable
- Allows admin operations (create jobs, write artifacts, update entities)
- User sessions via Portal will use standard RLS policies

---

## Table of Contents

1. [Entity Relationship Diagram](#1-entity-relationship-diagram)
2. [Table Schemas](#2-table-schemas)
3. [Row Level Security](#3-row-level-security)
4. [Indexes](#4-indexes)
5. [Functions & Triggers](#5-functions--triggers)
6. [Storage Buckets](#6-storage-buckets)
7. [Migration Strategy](#7-migration-strategy)
8. [Implementation Tasks](#8-implementation-tasks)

---

## 1. Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATABASE SCHEMA                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐                                                       │
│  │    users     │                                                       │
│  │──────────────│                                                       │
│  │ id (PK)      │                                                       │
│  │ email        │                                                       │
│  │ name         │                                                       │
│  │ role         │                                                       │
│  │ avatar_url   │                                                       │
│  │ created_at   │                                                       │
│  └──────┬───────┘                                                       │
│         │                                                                │
│         │ 1:N                                                            │
│         ▼                                                                │
│  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐    │
│  │generation_jobs│────────►│  artifacts   │         │  microsites  │    │
│  │──────────────│  1:N    │──────────────│         │──────────────│    │
│  │ id (PK)      │         │ id (PK)      │         │ id (PK)      │    │
│  │ user_id (FK) │         │ job_id (FK)  │         │ job_id (FK)  │    │
│  │ workflow     │         │ type         │         │ slug         │    │
│  │ status       │         │ content      │         │ title        │    │
│  │ transcript   │         │ file_path    │         │ thesis       │    │
│  │ config       │         │ created_at   │         │ config       │    │
│  │ created_at   │         └──────────────┘         │ url          │    │
│  │ completed_at │                                  │ visibility   │    │
│  └──────┬───────┘                                  │ created_at   │    │
│         │                                          └──────┬───────┘    │
│         │ 1:1                                             │             │
│         ▼                                                 │ N:M         │
│  ┌──────────────┐                                        ▼             │
│  │  microsites  │◄───────────────────────────────────────┘             │
│  └──────────────┘                                                       │
│                                                                          │
│  ┌──────────────┐         ┌──────────────────────┐                     │
│  │   entities   │◄────────│ entity_appearances   │                     │
│  │──────────────│   1:N   │──────────────────────│                     │
│  │ id (PK)      │         │ id (PK)              │                     │
│  │ slug         │         │ entity_id (FK)       │                     │
│  │ name         │         │ microsite_id (FK)    │                     │
│  │ type         │         │ section              │                     │
│  │ aliases      │         │ context              │                     │
│  │ metadata     │         │ sentiment            │                     │
│  │ created_at   │         └──────────────────────┘                     │
│  │ updated_at   │                                                       │
│  └──────┬───────┘                                                       │
│         │                                                                │
│         │ N:M (self-referential)                                        │
│         ▼                                                                │
│  ┌──────────────────────┐                                               │
│  │  entity_relations    │                                               │
│  │──────────────────────│                                               │
│  │ entity_a_id (FK)     │                                               │
│  │ entity_b_id (FK)     │                                               │
│  │ co_occurrence_count  │                                               │
│  └──────────────────────┘                                               │
│                                                                          │
│  ┌──────────────┐         ┌──────────────────────┐                     │
│  │ opportunities│◄────────│ entity_opportunities │                     │
│  │──────────────│   N:M   │──────────────────────│                     │
│  │ id (PK)      │         │ entity_id (FK)       │                     │
│  │ slug         │         │ opportunity_id (FK)  │                     │
│  │ name         │         └──────────────────────┘                     │
│  │ description  │                                                       │
│  │ parent_id    │                                                       │
│  └──────────────┘                                                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Table Schemas

### 2.1 users

Extends Supabase auth.users with profile data.

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'contributor' CHECK (role IN ('contributor', 'editor', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.users IS 'User profiles extending Supabase auth';
COMMENT ON COLUMN public.users.role IS 'contributor: generate/view, editor: edit any, admin: manage users';
```

### 2.2 generation_jobs

Tracks generation job status and configuration.

```sql
CREATE TYPE job_status AS ENUM (
  'pending',
  'generating_artifacts',
  'extracting_entities',
  'awaiting_entity_review',
  'generating_site_config',
  'building',
  'deploying',
  'completed',
  'failed'
);

CREATE TABLE public.generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  workflow_type TEXT NOT NULL DEFAULT 'market-landscape',
  status job_status NOT NULL DEFAULT 'pending',

  -- Input
  transcript_path TEXT NOT NULL,  -- Path in storage bucket
  config JSONB NOT NULL DEFAULT '{}',  -- User-provided config (title, accent, etc.)

  -- Progress tracking
  current_stage INTEGER DEFAULT 0,
  stage_progress INTEGER DEFAULT 0,
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Result
  microsite_id UUID REFERENCES public.microsites(id)
);

CREATE INDEX idx_generation_jobs_user ON public.generation_jobs(user_id);
CREATE INDEX idx_generation_jobs_status ON public.generation_jobs(status);

COMMENT ON TABLE public.generation_jobs IS 'Generation job queue and status tracking';
```

### 2.3 artifacts

Stores generated artifacts for each job.

```sql
CREATE TYPE artifact_type AS ENUM (
  'cleaned_transcript',
  'intelligence_brief',
  'strategic_questions',
  'narrative_research',
  'entity_extraction',
  'site_config'
);

CREATE TABLE public.artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.generation_jobs(id) ON DELETE CASCADE,
  type artifact_type NOT NULL,

  -- Content (stored directly for smaller artifacts)
  content TEXT,

  -- File reference (for larger artifacts)
  file_path TEXT,
  file_size INTEGER,

  -- Metadata
  token_count INTEGER,
  generation_time_ms INTEGER,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_artifacts_job ON public.artifacts(job_id);

COMMENT ON TABLE public.artifacts IS 'Generated artifacts from processing pipeline';
```

### 2.4 microsites

Stores microsite metadata and configuration.

```sql
CREATE TYPE visibility_type AS ENUM ('internal', 'public');

CREATE TABLE public.microsites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.generation_jobs(id),
  user_id UUID NOT NULL REFERENCES public.users(id),

  -- Identity
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  thesis TEXT,

  -- Configuration
  config JSONB NOT NULL,  -- Full SITE_CONFIG
  visibility visibility_type NOT NULL DEFAULT 'internal',

  -- Deployment
  url TEXT,
  blob_path TEXT,  -- Path in Vercel Blob

  -- Statistics
  entity_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deployed_at TIMESTAMPTZ
);

CREATE INDEX idx_microsites_slug ON public.microsites(slug);
CREATE INDEX idx_microsites_user ON public.microsites(user_id);
CREATE INDEX idx_microsites_visibility ON public.microsites(visibility);

COMMENT ON TABLE public.microsites IS 'Generated microsites with deployment info';
```

### 2.5 entities

Global entity registry.

```sql
CREATE TYPE entity_type AS ENUM (
  'company',
  'protocol',
  'person',
  'concept',
  'opportunity'
);

CREATE TABLE public.entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  canonical_name TEXT NOT NULL,
  aliases TEXT[] DEFAULT '{}',
  type entity_type NOT NULL,

  -- Metadata (flexible JSON)
  metadata JSONB NOT NULL DEFAULT '{}',
  -- Expected keys: url, twitter, tvSymbol, category, description

  -- Statistics
  appearance_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_entities_slug ON public.entities(slug);
CREATE INDEX idx_entities_type ON public.entities(type);
CREATE INDEX idx_entities_name ON public.entities USING gin(canonical_name gin_trgm_ops);
CREATE INDEX idx_entities_aliases ON public.entities USING gin(aliases);

COMMENT ON TABLE public.entities IS 'Global entity registry with metadata';
```

### 2.6 entity_appearances

Junction table: which entities appear in which microsites.

```sql
CREATE TYPE section_type AS ENUM (
  'thesis',
  'key_findings',
  'recommendations',
  'deep_dives'
);

CREATE TYPE sentiment_type AS ENUM ('positive', 'neutral', 'negative');

CREATE TABLE public.entity_appearances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  microsite_id UUID NOT NULL REFERENCES public.microsites(id) ON DELETE CASCADE,

  section section_type NOT NULL,
  context TEXT,  -- Excerpt where entity appears
  sentiment sentiment_type DEFAULT 'neutral',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(entity_id, microsite_id, section)
);

CREATE INDEX idx_entity_appearances_entity ON public.entity_appearances(entity_id);
CREATE INDEX idx_entity_appearances_microsite ON public.entity_appearances(microsite_id);

COMMENT ON TABLE public.entity_appearances IS 'Entity mentions across microsites';
```

### 2.7 entity_relations

Co-occurrence relationships between entities.

```sql
CREATE TABLE public.entity_relations (
  entity_a_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  entity_b_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  co_occurrence_count INTEGER NOT NULL DEFAULT 1,

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (entity_a_id, entity_b_id),
  CHECK (entity_a_id < entity_b_id)  -- Ensure consistent ordering
);

CREATE INDEX idx_entity_relations_a ON public.entity_relations(entity_a_id);
CREATE INDEX idx_entity_relations_b ON public.entity_relations(entity_b_id);

COMMENT ON TABLE public.entity_relations IS 'Co-occurrence counts between entity pairs';
```

### 2.8 opportunities

Opportunity taxonomy.

```sql
CREATE TABLE public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,

  -- Hierarchy
  parent_id UUID REFERENCES public.opportunities(id),

  -- Statistics
  entity_count INTEGER DEFAULT 0,
  microsite_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_opportunities_slug ON public.opportunities(slug);
CREATE INDEX idx_opportunities_parent ON public.opportunities(parent_id);

COMMENT ON TABLE public.opportunities IS 'Hierarchical opportunity taxonomy';
```

### 2.9 entity_opportunities

Junction table: entities to opportunities.

```sql
CREATE TABLE public.entity_opportunities (
  entity_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,

  PRIMARY KEY (entity_id, opportunity_id)
);

CREATE INDEX idx_entity_opportunities_entity ON public.entity_opportunities(entity_id);
CREATE INDEX idx_entity_opportunities_opportunity ON public.entity_opportunities(opportunity_id);

COMMENT ON TABLE public.entity_opportunities IS 'Entity to opportunity mappings';
```

---

## 3. Row Level Security

### 3.1 Enable RLS on All Tables

```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.microsites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_appearances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_opportunities ENABLE ROW LEVEL SECURITY;
```

### 3.2 User Policies

```sql
-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Admins can read all users
CREATE POLICY "Admins can read all users"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### 3.3 Generation Job Policies

```sql
-- Users can create jobs
CREATE POLICY "Users can create jobs"
  ON public.generation_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own jobs
CREATE POLICY "Users can view own jobs"
  ON public.generation_jobs FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all jobs
CREATE POLICY "Admins can view all jobs"
  ON public.generation_jobs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### 3.4 Microsite Policies

```sql
-- All authenticated users can view internal microsites
CREATE POLICY "Authenticated users can view internal microsites"
  ON public.microsites FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND visibility = 'internal'
  );

-- Anyone can view public microsites
CREATE POLICY "Anyone can view public microsites"
  ON public.microsites FOR SELECT
  USING (visibility = 'public');

-- Users can edit their own microsites
CREATE POLICY "Users can edit own microsites"
  ON public.microsites FOR UPDATE
  USING (auth.uid() = user_id);

-- Editors can edit any microsite
CREATE POLICY "Editors can edit any microsite"
  ON public.microsites FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('editor', 'admin')
    )
  );
```

### 3.5 Entity Policies

```sql
-- All authenticated users can view entities
CREATE POLICY "Authenticated users can view entities"
  ON public.entities FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Editors can modify entities
CREATE POLICY "Editors can modify entities"
  ON public.entities FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('editor', 'admin')
    )
  );
```

---

## 4. Indexes

### Full-Text Search

```sql
-- Enable pg_trgm for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Entity name search
CREATE INDEX idx_entities_name_trgm
  ON public.entities
  USING gin(canonical_name gin_trgm_ops);

-- Microsite title search
CREATE INDEX idx_microsites_title_trgm
  ON public.microsites
  USING gin(title gin_trgm_ops);

-- Full-text search on thesis
ALTER TABLE public.microsites ADD COLUMN thesis_tsv tsvector
  GENERATED ALWAYS AS (to_tsvector('english', COALESCE(thesis, ''))) STORED;

CREATE INDEX idx_microsites_thesis_fts
  ON public.microsites
  USING gin(thesis_tsv);
```

### Query Optimization

```sql
-- Common query: entities by microsite
CREATE INDEX idx_entity_appearances_microsite_entity
  ON public.entity_appearances(microsite_id, entity_id);

-- Common query: recent jobs by user
CREATE INDEX idx_generation_jobs_user_created
  ON public.generation_jobs(user_id, created_at DESC);

-- Common query: top co-occurring entities
CREATE INDEX idx_entity_relations_count
  ON public.entity_relations(co_occurrence_count DESC);
```

---

## 5. Functions & Triggers

### 5.1 Auto-Update Timestamps

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_microsites_updated_at
  BEFORE UPDATE ON public.microsites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_entities_updated_at
  BEFORE UPDATE ON public.entities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 5.2 Update Entity Appearance Count

```sql
CREATE OR REPLACE FUNCTION update_entity_appearance_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.entities
    SET appearance_count = appearance_count + 1
    WHERE id = NEW.entity_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.entities
    SET appearance_count = appearance_count - 1
    WHERE id = OLD.entity_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_entity_appearance_count
  AFTER INSERT OR DELETE ON public.entity_appearances
  FOR EACH ROW EXECUTE FUNCTION update_entity_appearance_count();
```

### 5.3 Update Opportunity Counts

```sql
CREATE OR REPLACE FUNCTION update_opportunity_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update entity count
  UPDATE public.opportunities o
  SET entity_count = (
    SELECT COUNT(DISTINCT entity_id)
    FROM public.entity_opportunities
    WHERE opportunity_id = o.id
  );

  -- Update microsite count (entities in that opportunity that appear in microsites)
  UPDATE public.opportunities o
  SET microsite_count = (
    SELECT COUNT(DISTINCT ea.microsite_id)
    FROM public.entity_opportunities eo
    JOIN public.entity_appearances ea ON eo.entity_id = ea.entity_id
    WHERE eo.opportunity_id = o.id
  );

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_opportunity_counts
  AFTER INSERT OR DELETE ON public.entity_opportunities
  FOR EACH STATEMENT EXECUTE FUNCTION update_opportunity_counts();
```

### 5.4 Auto-Create User Profile

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## 6. Storage Buckets

### 6.1 Bucket Configuration

```sql
-- Create buckets via Supabase dashboard or SQL
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('transcripts', 'transcripts', false),
  ('artifacts', 'artifacts', false),
  ('microsites', 'microsites', true);
```

### 6.2 Storage Policies

```sql
-- Transcripts: users can upload their own
CREATE POLICY "Users can upload transcripts"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'transcripts'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Transcripts: users can read their own
CREATE POLICY "Users can read own transcripts"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'transcripts'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Artifacts: system can write (via service role)
-- Users can read artifacts from their jobs

-- Microsites: public read access
CREATE POLICY "Public can read microsites"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'microsites');
```

### 6.3 File Path Conventions

```
transcripts/
└── {user_id}/
    └── {job_id}.md

artifacts/
└── {job_id}/
    ├── cleaned_transcript.md
    ├── intelligence_brief.md
    ├── strategic_questions.md
    ├── narrative_research.md
    └── site_config.js

outputs/microsites/
└── {slug}/
    ├── index.html
    ├── assets/
    └── *.md (source artifacts)
```

---

## 7. Migration Strategy

### 7.1 From JSON to Postgres

The current project uses JSON files (`data/entities.json`, `data/index.json`). Migration path:

```typescript
// scripts/migrate-to-supabase.ts

async function migrateEntities() {
  const json = JSON.parse(fs.readFileSync('data/entities.json', 'utf-8'));

  for (const [slug, entity] of Object.entries(json.entities)) {
    await supabase.from('entities').upsert({
      slug,
      canonical_name: entity.canonicalName,
      aliases: entity.aliases,
      type: entity.type,
      metadata: entity.metadata,
    });

    // Migrate appearances
    for (const appearance of entity.appearances) {
      await supabase.from('entity_appearances').upsert({
        entity_id: entityId,
        microsite_id: micrositeId,
        section: appearance.section,
        context: appearance.context,
      });
    }
  }
}
```

### 7.2 Migration Order

1. Create tables (run SQL migrations)
2. Migrate opportunities
3. Migrate entities
4. Migrate microsites
5. Migrate entity_appearances
6. Calculate entity_relations
7. Verify counts

---

## 8. Implementation Tasks

| # | Task | Priority | Status |
|---|------|----------|--------|
| 1 | Create Supabase project | P0 | ⬚ |
| 2 | Run table creation migrations | P0 | ⬚ |
| 3 | Configure Google OAuth in Supabase | P0 | ⬚ |
| 4 | Set up RLS policies | P0 | ⬚ |
| 5 | Create storage buckets | P0 | ⬚ |
| 6 | Write migration script from JSON | P1 | ⬚ |
| 7 | Run migration for existing data | P1 | ⬚ |
| 8 | Create TypeScript client types | P1 | ⬚ |
| 9 | Add indexes for common queries | P2 | ⬚ |
| 10 | Add full-text search | P2 | ⬚ |

---

## Related Specifications

| Spec | Relationship |
|------|--------------|
| [`MASTER_SPEC.md`](../MASTER_SPEC.md) | Parent specification |
| [`SPEC_PROCESSING_PIPELINE.md`](./SPEC_PROCESSING_PIPELINE.md) | **Depends on this** — Phase 1b requires Phase 1a |
| [`SPEC_MULTI_AI_RESEARCH.md`](./SPEC_MULTI_AI_RESEARCH.md) | Uses Supabase for caching research results |
| `SPEC_PORTAL_UI.md` | Uses all tables, standard RLS policies |

---

*Specification created as part of Ritual Research Graph project.*
*See [`MASTER_SPEC.md`](../MASTER_SPEC.md) for full project context.*
