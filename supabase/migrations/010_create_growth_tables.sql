-- ============================================================================
-- Migration 010: Create Growth Tables (Structure Only)
-- Phase: 2 (Schema Split)
-- Created: 2026-01-22
-- ============================================================================

CREATE TABLE IF NOT EXISTS growth.opportunities (LIKE public.opportunities INCLUDING ALL);
CREATE TABLE IF NOT EXISTS growth.entities (LIKE public.entities INCLUDING ALL);
CREATE TABLE IF NOT EXISTS growth.microsites (LIKE public.microsites INCLUDING ALL);
CREATE TABLE IF NOT EXISTS growth.generation_jobs (LIKE public.generation_jobs INCLUDING ALL);
CREATE TABLE IF NOT EXISTS growth.artifacts (LIKE public.artifacts INCLUDING ALL);
CREATE TABLE IF NOT EXISTS growth.entity_appearances (LIKE public.entity_appearances INCLUDING ALL);
CREATE TABLE IF NOT EXISTS growth.entity_relations (LIKE public.entity_relations INCLUDING ALL);
CREATE TABLE IF NOT EXISTS growth.entity_opportunities (LIKE public.entity_opportunities INCLUDING ALL);
CREATE TABLE IF NOT EXISTS growth.pipeline_workflows (LIKE public.pipeline_workflows INCLUDING ALL);
CREATE TABLE IF NOT EXISTS growth.pipeline_stages (LIKE public.pipeline_stages INCLUDING ALL);
CREATE TABLE IF NOT EXISTS growth.opportunity_owners (LIKE public.opportunity_owners INCLUDING ALL);
CREATE TABLE IF NOT EXISTS growth.opportunity_entities (LIKE public.opportunity_entities INCLUDING ALL);
CREATE TABLE IF NOT EXISTS growth.opportunity_activity (LIKE public.opportunity_activity INCLUDING ALL);
CREATE TABLE IF NOT EXISTS growth.entity_aliases (LIKE public.entity_aliases INCLUDING ALL);

-- Drop foreign keys so we can re-bind to new schemas post-migration
ALTER TABLE growth.entities
  DROP CONSTRAINT IF EXISTS entities_reviewed_by_fkey,
  DROP CONSTRAINT IF EXISTS entities_merged_into_id_fkey,
  DROP CONSTRAINT IF EXISTS entities_extraction_job_id_fkey;

ALTER TABLE growth.microsites
  DROP CONSTRAINT IF EXISTS microsites_user_id_fkey,
  DROP CONSTRAINT IF EXISTS fk_microsites_job;

ALTER TABLE growth.generation_jobs
  DROP CONSTRAINT IF EXISTS generation_jobs_user_id_fkey,
  DROP CONSTRAINT IF EXISTS generation_jobs_microsite_id_fkey;

ALTER TABLE growth.artifacts
  DROP CONSTRAINT IF EXISTS artifacts_job_id_fkey;

ALTER TABLE growth.entity_appearances
  DROP CONSTRAINT IF EXISTS entity_appearances_entity_id_fkey,
  DROP CONSTRAINT IF EXISTS entity_appearances_microsite_id_fkey;

ALTER TABLE growth.entity_relations
  DROP CONSTRAINT IF EXISTS entity_relations_entity_a_id_fkey,
  DROP CONSTRAINT IF EXISTS entity_relations_entity_b_id_fkey;

ALTER TABLE growth.entity_opportunities
  DROP CONSTRAINT IF EXISTS entity_opportunities_entity_id_fkey,
  DROP CONSTRAINT IF EXISTS entity_opportunities_opportunity_id_fkey;

ALTER TABLE growth.pipeline_stages
  DROP CONSTRAINT IF EXISTS pipeline_stages_workflow_id_fkey;

ALTER TABLE growth.opportunities
  DROP CONSTRAINT IF EXISTS opportunities_parent_id_fkey,
  DROP CONSTRAINT IF EXISTS opportunities_workflow_id_fkey,
  DROP CONSTRAINT IF EXISTS opportunities_stage_id_fkey,
  DROP CONSTRAINT IF EXISTS opportunities_source_microsite_id_fkey,
  DROP CONSTRAINT IF EXISTS opportunities_source_job_id_fkey,
  DROP CONSTRAINT IF EXISTS opportunities_archived_by_fkey,
  DROP CONSTRAINT IF EXISTS opportunities_created_by_fkey;

ALTER TABLE growth.opportunity_owners
  DROP CONSTRAINT IF EXISTS opportunity_owners_opportunity_id_fkey,
  DROP CONSTRAINT IF EXISTS opportunity_owners_user_id_fkey,
  DROP CONSTRAINT IF EXISTS opportunity_owners_assigned_by_fkey;

ALTER TABLE growth.opportunity_entities
  DROP CONSTRAINT IF EXISTS opportunity_entities_opportunity_id_fkey,
  DROP CONSTRAINT IF EXISTS opportunity_entities_entity_id_fkey;

ALTER TABLE growth.opportunity_activity
  DROP CONSTRAINT IF EXISTS opportunity_activity_opportunity_id_fkey,
  DROP CONSTRAINT IF EXISTS opportunity_activity_user_id_fkey;

ALTER TABLE growth.entity_aliases
  DROP CONSTRAINT IF EXISTS entity_aliases_entity_id_fkey;
