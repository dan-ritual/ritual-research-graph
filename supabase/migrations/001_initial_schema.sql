-- ============================================================================
-- Ritual Research Graph - Initial Schema Migration
-- Phase 1a: Database & Storage
-- Created: 2026-01-16
-- ============================================================================

-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================

-- Enable pg_trgm for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================================
-- 2. ENUM TYPES
-- ============================================================================

-- Job status lifecycle
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

-- Artifact types produced by pipeline
CREATE TYPE artifact_type AS ENUM (
  'cleaned_transcript',
  'intelligence_brief',
  'strategic_questions',
  'narrative_research',
  'entity_extraction',
  'site_config'
);

-- Entity classification
CREATE TYPE entity_type AS ENUM (
  'company',
  'protocol',
  'person',
  'concept',
  'opportunity'
);

-- Microsite visibility
CREATE TYPE visibility_type AS ENUM ('internal', 'public');

-- Section where entity appears
CREATE TYPE section_type AS ENUM (
  'thesis',
  'key_findings',
  'recommendations',
  'deep_dives'
);

-- Sentiment classification
CREATE TYPE sentiment_type AS ENUM ('positive', 'neutral', 'negative');

-- ============================================================================
-- 3. TABLES (ordered by foreign key dependencies)
-- ============================================================================

-- 3.1 Users - extends Supabase auth.users
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

-- 3.2 Opportunities - hierarchical taxonomy
CREATE TABLE public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.opportunities(id),
  entity_count INTEGER DEFAULT 0,
  microsite_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.opportunities IS 'Hierarchical opportunity taxonomy';

-- 3.3 Entities - global registry
CREATE TABLE public.entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  canonical_name TEXT NOT NULL,
  aliases TEXT[] DEFAULT '{}',
  type entity_type NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  appearance_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.entities IS 'Global entity registry with metadata';
COMMENT ON COLUMN public.entities.metadata IS 'Expected keys: url, twitter, tvSymbol, category, description';

-- 3.4 Microsites - generated sites (created before generation_jobs due to circular ref)
CREATE TABLE public.microsites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID, -- FK added later due to circular dependency
  user_id UUID NOT NULL REFERENCES public.users(id),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  thesis TEXT,
  config JSONB NOT NULL DEFAULT '{}',
  visibility visibility_type NOT NULL DEFAULT 'internal',
  url TEXT,
  blob_path TEXT,
  entity_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deployed_at TIMESTAMPTZ
);

COMMENT ON TABLE public.microsites IS 'Generated microsites with deployment info';

-- 3.5 Generation Jobs - pipeline job tracking
CREATE TABLE public.generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  workflow_type TEXT NOT NULL DEFAULT 'market-landscape',
  status job_status NOT NULL DEFAULT 'pending',
  transcript_path TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  current_stage INTEGER DEFAULT 0,
  stage_progress INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  microsite_id UUID REFERENCES public.microsites(id)
);

COMMENT ON TABLE public.generation_jobs IS 'Generation job queue and status tracking';

-- Add the circular FK from microsites to generation_jobs
ALTER TABLE public.microsites
  ADD CONSTRAINT fk_microsites_job
  FOREIGN KEY (job_id) REFERENCES public.generation_jobs(id);

-- 3.6 Artifacts - generated documents
CREATE TABLE public.artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.generation_jobs(id) ON DELETE CASCADE,
  type artifact_type NOT NULL,
  content TEXT,
  file_path TEXT,
  file_size INTEGER,
  token_count INTEGER,
  generation_time_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.artifacts IS 'Generated artifacts from processing pipeline';

-- 3.7 Entity Appearances - junction: entities <-> microsites
CREATE TABLE public.entity_appearances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  microsite_id UUID NOT NULL REFERENCES public.microsites(id) ON DELETE CASCADE,
  section section_type NOT NULL,
  context TEXT,
  sentiment sentiment_type DEFAULT 'neutral',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(entity_id, microsite_id, section)
);

COMMENT ON TABLE public.entity_appearances IS 'Entity mentions across microsites';

-- 3.8 Entity Relations - co-occurrence counts
CREATE TABLE public.entity_relations (
  entity_a_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  entity_b_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  co_occurrence_count INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (entity_a_id, entity_b_id),
  CHECK (entity_a_id < entity_b_id)
);

COMMENT ON TABLE public.entity_relations IS 'Co-occurrence counts between entity pairs';
COMMENT ON CONSTRAINT entity_relations_entity_a_id_entity_b_id_check ON public.entity_relations IS 'Ensures consistent ordering: a < b';

-- 3.9 Entity Opportunities - junction: entities <-> opportunities
CREATE TABLE public.entity_opportunities (
  entity_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  PRIMARY KEY (entity_id, opportunity_id)
);

COMMENT ON TABLE public.entity_opportunities IS 'Entity to opportunity mappings';

-- ============================================================================
-- 4. INDEXES
-- ============================================================================

-- Users
CREATE INDEX idx_users_email ON public.users(email);

-- Generation Jobs
CREATE INDEX idx_generation_jobs_user ON public.generation_jobs(user_id);
CREATE INDEX idx_generation_jobs_status ON public.generation_jobs(status);
CREATE INDEX idx_generation_jobs_user_created ON public.generation_jobs(user_id, created_at DESC);

-- Artifacts
CREATE INDEX idx_artifacts_job ON public.artifacts(job_id);

-- Microsites
CREATE INDEX idx_microsites_slug ON public.microsites(slug);
CREATE INDEX idx_microsites_user ON public.microsites(user_id);
CREATE INDEX idx_microsites_visibility ON public.microsites(visibility);

-- Entities
CREATE INDEX idx_entities_slug ON public.entities(slug);
CREATE INDEX idx_entities_type ON public.entities(type);
CREATE INDEX idx_entities_name_trgm ON public.entities USING gin(canonical_name gin_trgm_ops);
CREATE INDEX idx_entities_aliases ON public.entities USING gin(aliases);

-- Entity Appearances
CREATE INDEX idx_entity_appearances_entity ON public.entity_appearances(entity_id);
CREATE INDEX idx_entity_appearances_microsite ON public.entity_appearances(microsite_id);
CREATE INDEX idx_entity_appearances_microsite_entity ON public.entity_appearances(microsite_id, entity_id);

-- Entity Relations
CREATE INDEX idx_entity_relations_a ON public.entity_relations(entity_a_id);
CREATE INDEX idx_entity_relations_b ON public.entity_relations(entity_b_id);
CREATE INDEX idx_entity_relations_count ON public.entity_relations(co_occurrence_count DESC);

-- Opportunities
CREATE INDEX idx_opportunities_slug ON public.opportunities(slug);
CREATE INDEX idx_opportunities_parent ON public.opportunities(parent_id);

-- Entity Opportunities
CREATE INDEX idx_entity_opportunities_entity ON public.entity_opportunities(entity_id);
CREATE INDEX idx_entity_opportunities_opportunity ON public.entity_opportunities(opportunity_id);

-- ============================================================================
-- 5. FULL-TEXT SEARCH
-- ============================================================================

-- Microsite title fuzzy search
CREATE INDEX idx_microsites_title_trgm ON public.microsites USING gin(title gin_trgm_ops);

-- Microsite thesis full-text search
ALTER TABLE public.microsites ADD COLUMN thesis_tsv tsvector
  GENERATED ALWAYS AS (to_tsvector('english', COALESCE(thesis, ''))) STORED;

CREATE INDEX idx_microsites_thesis_fts ON public.microsites USING gin(thesis_tsv);

-- ============================================================================
-- 6. FUNCTIONS & TRIGGERS
-- ============================================================================

-- 6.1 Auto-update updated_at timestamp
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

CREATE TRIGGER update_opportunities_updated_at
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 6.2 Update entity appearance count
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

-- 6.3 Update opportunity counts
CREATE OR REPLACE FUNCTION update_opportunity_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update entity count for affected opportunities
  UPDATE public.opportunities o
  SET entity_count = (
    SELECT COUNT(DISTINCT entity_id)
    FROM public.entity_opportunities
    WHERE opportunity_id = o.id
  )
  WHERE o.id IN (
    SELECT DISTINCT opportunity_id
    FROM public.entity_opportunities
  );

  -- Update microsite count
  UPDATE public.opportunities o
  SET microsite_count = (
    SELECT COUNT(DISTINCT ea.microsite_id)
    FROM public.entity_opportunities eo
    JOIN public.entity_appearances ea ON eo.entity_id = ea.entity_id
    WHERE eo.opportunity_id = o.id
  )
  WHERE o.id IN (
    SELECT DISTINCT opportunity_id
    FROM public.entity_opportunities
  );

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_opportunity_counts
  AFTER INSERT OR DELETE ON public.entity_opportunities
  FOR EACH STATEMENT EXECUTE FUNCTION update_opportunity_counts();

-- 6.4 Auto-create user profile on auth signup
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

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
