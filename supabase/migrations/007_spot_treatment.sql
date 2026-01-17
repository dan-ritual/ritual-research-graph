-- =====================================================
-- Migration 007: Spot Treatment Editing
-- Phase 4: Enable surgical editing of generated artifacts
-- =====================================================

-- 7.1 Add sections and edit tracking to artifacts table
-- sections: JSONB array of {id, header, level, content, edited_at, original_content}
-- last_edited_at: Track when artifact was last modified

ALTER TABLE public.artifacts
  ADD COLUMN IF NOT EXISTS sections JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.artifacts
  ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMPTZ;

ALTER TABLE public.artifacts
  ADD COLUMN IF NOT EXISTS original_content TEXT;

COMMENT ON COLUMN public.artifacts.sections IS 'Parsed markdown sections for spot editing';
COMMENT ON COLUMN public.artifacts.last_edited_at IS 'Timestamp of last manual edit';
COMMENT ON COLUMN public.artifacts.original_content IS 'Original content before any edits';

-- 7.2 Entity aliases table for merge tracking
-- When entities are merged, names become aliases

CREATE TABLE IF NOT EXISTS public.entity_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  alias TEXT NOT NULL,
  source TEXT DEFAULT 'merge', -- 'merge', 'manual', 'extraction'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.entity_aliases IS 'Alternative names for entities (from merges or manual entry)';

-- Indexes for alias lookup
CREATE INDEX IF NOT EXISTS idx_entity_aliases_entity_id ON public.entity_aliases(entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_aliases_alias ON public.entity_aliases(alias);
CREATE INDEX IF NOT EXISTS idx_entity_aliases_alias_lower ON public.entity_aliases(LOWER(alias));

-- 7.3 Add review_status to track entity extraction review
-- pending: awaiting review, approved: committed to registry, rejected: discarded

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'entity_review_status') THEN
    CREATE TYPE entity_review_status AS ENUM ('pending', 'approved', 'rejected', 'merged');
  END IF;
END$$;

-- Add review columns to entities if not exists
ALTER TABLE public.entities
  ADD COLUMN IF NOT EXISTS review_status entity_review_status DEFAULT 'approved';

ALTER TABLE public.entities
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

ALTER TABLE public.entities
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id);

ALTER TABLE public.entities
  ADD COLUMN IF NOT EXISTS merged_into_id UUID REFERENCES public.entities(id);

COMMENT ON COLUMN public.entities.review_status IS 'Review state for newly extracted entities';
COMMENT ON COLUMN public.entities.merged_into_id IS 'If merged, points to the canonical entity';

-- Index for finding entities pending review
CREATE INDEX IF NOT EXISTS idx_entities_review_status ON public.entities(review_status);

-- 7.4 Add extraction_job_id to track which job extracted an entity

ALTER TABLE public.entities
  ADD COLUMN IF NOT EXISTS extraction_job_id UUID REFERENCES public.generation_jobs(id);

COMMENT ON COLUMN public.entities.extraction_job_id IS 'Job that extracted this entity (for review flow)';

-- Index for finding entities by extraction job
CREATE INDEX IF NOT EXISTS idx_entities_extraction_job ON public.entities(extraction_job_id);

-- 7.5 RLS policies for entity_aliases

ALTER TABLE public.entity_aliases ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read all aliases
CREATE POLICY "Authenticated users can read entity aliases"
  ON public.entity_aliases FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can create aliases
CREATE POLICY "Authenticated users can create entity aliases"
  ON public.entity_aliases FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can delete their aliases (via entity ownership indirectly)
CREATE POLICY "Authenticated users can delete entity aliases"
  ON public.entity_aliases FOR DELETE
  TO authenticated
  USING (true);

-- 7.6 Helper function to find potential duplicates

CREATE OR REPLACE FUNCTION public.find_potential_duplicates(
  p_name TEXT,
  p_type TEXT DEFAULT NULL,
  p_threshold FLOAT DEFAULT 0.3
)
RETURNS TABLE (
  entity_id UUID,
  canonical_name TEXT,
  entity_type TEXT,
  similarity FLOAT,
  match_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH candidates AS (
    -- Exact match on canonical name (case insensitive)
    SELECT
      e.id,
      e.canonical_name,
      e.type,
      1.0::FLOAT AS sim,
      'exact'::TEXT AS match
    FROM public.entities e
    WHERE LOWER(e.canonical_name) = LOWER(p_name)
      AND (p_type IS NULL OR e.type = p_type)
      AND e.deleted_at IS NULL
      AND e.review_status != 'rejected'

    UNION ALL

    -- Exact match on alias (case insensitive)
    SELECT
      e.id,
      e.canonical_name,
      e.type,
      0.95::FLOAT AS sim,
      'alias'::TEXT AS match
    FROM public.entities e
    JOIN public.entity_aliases a ON a.entity_id = e.id
    WHERE LOWER(a.alias) = LOWER(p_name)
      AND (p_type IS NULL OR e.type = p_type)
      AND e.deleted_at IS NULL
      AND e.review_status != 'rejected'

    UNION ALL

    -- Trigram similarity on canonical name
    SELECT
      e.id,
      e.canonical_name,
      e.type,
      similarity(LOWER(e.canonical_name), LOWER(p_name))::FLOAT AS sim,
      'similar'::TEXT AS match
    FROM public.entities e
    WHERE similarity(LOWER(e.canonical_name), LOWER(p_name)) > p_threshold
      AND (p_type IS NULL OR e.type = p_type)
      AND e.deleted_at IS NULL
      AND e.review_status != 'rejected'
      AND LOWER(e.canonical_name) != LOWER(p_name)
  )
  SELECT DISTINCT ON (c.id)
    c.id AS entity_id,
    c.canonical_name,
    c.entity_type,
    c.sim AS similarity,
    c.match AS match_type
  FROM candidates c
  ORDER BY c.id, c.sim DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.find_potential_duplicates IS 'Find entities that might be duplicates of a given name';

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.find_potential_duplicates TO authenticated;

-- 7.7 Helper function to merge entities

CREATE OR REPLACE FUNCTION public.merge_entities(
  p_source_id UUID,
  p_target_id UUID,
  p_user_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_source_name TEXT;
  v_target_name TEXT;
BEGIN
  -- Get names for alias creation
  SELECT canonical_name INTO v_source_name FROM public.entities WHERE id = p_source_id;
  SELECT canonical_name INTO v_target_name FROM public.entities WHERE id = p_target_id;

  IF v_source_name IS NULL OR v_target_name IS NULL THEN
    RAISE EXCEPTION 'One or both entities not found';
  END IF;

  -- Add source name as alias on target
  INSERT INTO public.entity_aliases (entity_id, alias, source)
  VALUES (p_target_id, v_source_name, 'merge')
  ON CONFLICT DO NOTHING;

  -- Copy all aliases from source to target
  INSERT INTO public.entity_aliases (entity_id, alias, source)
  SELECT p_target_id, a.alias, 'merge'
  FROM public.entity_aliases a
  WHERE a.entity_id = p_source_id
  ON CONFLICT DO NOTHING;

  -- Update all appearances to point to target
  UPDATE public.entity_appearances
  SET entity_id = p_target_id
  WHERE entity_id = p_source_id;

  -- Update entity relations where source is entity_a
  UPDATE public.entity_relations
  SET entity_a_id = p_target_id
  WHERE entity_a_id = p_source_id
    AND entity_b_id != p_target_id;

  -- Update entity relations where source is entity_b
  UPDATE public.entity_relations
  SET entity_b_id = p_target_id
  WHERE entity_b_id = p_source_id
    AND entity_a_id != p_target_id;

  -- Delete self-referential relations that might have been created
  DELETE FROM public.entity_relations
  WHERE entity_a_id = p_target_id AND entity_b_id = p_target_id;

  -- Update opportunity_entities
  UPDATE public.opportunity_entities
  SET entity_id = p_target_id
  WHERE entity_id = p_source_id;

  -- Mark source as merged
  UPDATE public.entities
  SET review_status = 'merged',
      merged_into_id = p_target_id,
      reviewed_at = NOW(),
      reviewed_by = p_user_id
  WHERE id = p_source_id;

  RETURN p_target_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.merge_entities IS 'Merge source entity into target, preserving all references';

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.merge_entities TO authenticated;
