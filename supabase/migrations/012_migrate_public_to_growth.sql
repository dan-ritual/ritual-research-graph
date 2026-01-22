-- ============================================================================
-- Migration 012: Migrate Public Data to Growth
-- Phase: 2 (Schema Split)
-- Created: 2026-01-22
-- ============================================================================

INSERT INTO growth.pipeline_workflows SELECT * FROM public.pipeline_workflows;
INSERT INTO growth.pipeline_stages SELECT * FROM public.pipeline_stages;

INSERT INTO growth.opportunities SELECT * FROM public.opportunities;
INSERT INTO growth.entities SELECT * FROM public.entities;
INSERT INTO growth.entity_aliases SELECT * FROM public.entity_aliases;

INSERT INTO growth.microsites (
  id,
  job_id,
  user_id,
  slug,
  title,
  subtitle,
  thesis,
  config,
  visibility,
  url,
  blob_path,
  entity_count,
  view_count,
  created_at,
  updated_at,
  deployed_at,
  deleted_at
)
SELECT
  id,
  job_id,
  user_id,
  slug,
  title,
  subtitle,
  thesis,
  config,
  visibility,
  url,
  blob_path,
  entity_count,
  view_count,
  created_at,
  updated_at,
  deployed_at,
  deleted_at
FROM public.microsites;

INSERT INTO growth.generation_jobs SELECT * FROM public.generation_jobs;
INSERT INTO growth.artifacts SELECT * FROM public.artifacts;

INSERT INTO growth.entity_appearances SELECT * FROM public.entity_appearances;
INSERT INTO growth.entity_relations SELECT * FROM public.entity_relations;
INSERT INTO growth.entity_opportunities SELECT * FROM public.entity_opportunities;

INSERT INTO growth.opportunity_entities SELECT * FROM public.opportunity_entities;
INSERT INTO growth.opportunity_owners SELECT * FROM public.opportunity_owners;
INSERT INTO growth.opportunity_activity SELECT * FROM public.opportunity_activity;
