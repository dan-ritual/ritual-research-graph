-- ============================================================================
-- Migration 015: Tighten Mode Isolation
-- Phase: 2 (Schema Split - RLS Tightening)
-- Created: 2026-01-22
-- Purpose: Replace overly permissive policies with mode-gated versions
-- ============================================================================

-- ============================================================================
-- ENGINEERING SCHEMA - DROP EXISTING POLICIES
-- ============================================================================

-- Drop all existing policies on engineering tables that lack mode checks
-- We'll recreate them with proper mode gating

-- generation_jobs
DROP POLICY IF EXISTS "Users can create jobs" ON engineering.generation_jobs;
DROP POLICY IF EXISTS "Users can view own jobs" ON engineering.generation_jobs;
DROP POLICY IF EXISTS "Admins can view all jobs" ON engineering.generation_jobs;
DROP POLICY IF EXISTS "Mode access required for jobs" ON engineering.generation_jobs;
DROP POLICY IF EXISTS "Mode access for creating jobs" ON engineering.generation_jobs;

-- artifacts
DROP POLICY IF EXISTS "Users can view own job artifacts" ON engineering.artifacts;
DROP POLICY IF EXISTS "Admins can view all artifacts" ON engineering.artifacts;

-- microsites
DROP POLICY IF EXISTS "Authenticated users can view internal microsites" ON engineering.microsites;
DROP POLICY IF EXISTS "Anyone can view public microsites" ON engineering.microsites;
DROP POLICY IF EXISTS "Users can edit own microsites" ON engineering.microsites;
DROP POLICY IF EXISTS "Editors can edit any microsite" ON engineering.microsites;
DROP POLICY IF EXISTS "Users can create microsites" ON engineering.microsites;
DROP POLICY IF EXISTS "Admins can view deleted microsites" ON engineering.microsites;
DROP POLICY IF EXISTS "Mode access required for microsites" ON engineering.microsites;
DROP POLICY IF EXISTS "Mode access for creating microsites" ON engineering.microsites;

-- entities
DROP POLICY IF EXISTS "Authenticated users can view entities" ON engineering.entities;
DROP POLICY IF EXISTS "Editors can modify entities" ON engineering.entities;
DROP POLICY IF EXISTS "Admins can view deleted entities" ON engineering.entities;
DROP POLICY IF EXISTS "Mode access required for entities" ON engineering.entities;
DROP POLICY IF EXISTS "Mode access for creating entities" ON engineering.entities;

-- entity_appearances
DROP POLICY IF EXISTS "Authenticated users can view entity appearances" ON engineering.entity_appearances;
DROP POLICY IF EXISTS "Editors can modify entity appearances" ON engineering.entity_appearances;

-- entity_relations
DROP POLICY IF EXISTS "Authenticated users can view entity relations" ON engineering.entity_relations;
DROP POLICY IF EXISTS "Editors can modify entity relations" ON engineering.entity_relations;

-- opportunities
DROP POLICY IF EXISTS "Authenticated users can view active opportunities" ON engineering.opportunities;
DROP POLICY IF EXISTS "Authenticated users can insert opportunities" ON engineering.opportunities;
DROP POLICY IF EXISTS "Authenticated users can update opportunities" ON engineering.opportunities;
DROP POLICY IF EXISTS "Editors can modify opportunities" ON engineering.opportunities;
DROP POLICY IF EXISTS "Mode access required for opportunities" ON engineering.opportunities;
DROP POLICY IF EXISTS "Mode access for creating opportunities" ON engineering.opportunities;

-- entity_opportunities
DROP POLICY IF EXISTS "Authenticated users can view entity opportunities" ON engineering.entity_opportunities;
DROP POLICY IF EXISTS "Editors can modify entity opportunities" ON engineering.entity_opportunities;

-- pipeline_workflows
DROP POLICY IF EXISTS "Authenticated users can read workflows" ON engineering.pipeline_workflows;

-- pipeline_stages
DROP POLICY IF EXISTS "Authenticated users can read stages" ON engineering.pipeline_stages;

-- opportunity_owners
DROP POLICY IF EXISTS "Authenticated users can read opportunity owners" ON engineering.opportunity_owners;
DROP POLICY IF EXISTS "Authenticated users can manage opportunity owners" ON engineering.opportunity_owners;

-- opportunity_entities
DROP POLICY IF EXISTS "Authenticated users can read opportunity entities" ON engineering.opportunity_entities;
DROP POLICY IF EXISTS "Authenticated users can manage opportunity entities" ON engineering.opportunity_entities;

-- opportunity_activity
DROP POLICY IF EXISTS "Authenticated users can read opportunity activity" ON engineering.opportunity_activity;
DROP POLICY IF EXISTS "Users can log activity" ON engineering.opportunity_activity;

-- entity_aliases
DROP POLICY IF EXISTS "Authenticated users can read entity aliases" ON engineering.entity_aliases;
DROP POLICY IF EXISTS "Authenticated users can create entity aliases" ON engineering.entity_aliases;
DROP POLICY IF EXISTS "Authenticated users can delete entity aliases" ON engineering.entity_aliases;

-- ============================================================================
-- ENGINEERING SCHEMA - RECREATE WITH MODE GATING
-- All policies now require shared.user_has_mode_access('engineering')
-- ============================================================================

-- generation_jobs
CREATE POLICY "engineering_jobs_select"
  ON engineering.generation_jobs FOR SELECT
  TO authenticated
  USING (
    shared.user_has_mode_access('engineering')
    AND (auth.uid() = user_id OR shared.is_admin())
  );

CREATE POLICY "engineering_jobs_insert"
  ON engineering.generation_jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    shared.user_has_mode_access('engineering')
    AND auth.uid() = user_id
  );

CREATE POLICY "engineering_jobs_update"
  ON engineering.generation_jobs FOR UPDATE
  TO authenticated
  USING (
    shared.user_has_mode_access('engineering')
    AND (auth.uid() = user_id OR shared.is_admin())
  );

-- artifacts
CREATE POLICY "engineering_artifacts_select"
  ON engineering.artifacts FOR SELECT
  TO authenticated
  USING (
    shared.user_has_mode_access('engineering')
    AND (
      EXISTS (
        SELECT 1 FROM engineering.generation_jobs
        WHERE id = artifacts.job_id AND user_id = auth.uid()
      )
      OR shared.is_admin()
    )
  );

CREATE POLICY "engineering_artifacts_insert"
  ON engineering.artifacts FOR INSERT
  TO authenticated
  WITH CHECK (shared.user_has_mode_access('engineering'));

CREATE POLICY "engineering_artifacts_update"
  ON engineering.artifacts FOR UPDATE
  TO authenticated
  USING (
    shared.user_has_mode_access('engineering')
    AND shared.is_editor_or_admin()
  );

CREATE POLICY "engineering_artifacts_delete"
  ON engineering.artifacts FOR DELETE
  TO authenticated
  USING (
    shared.user_has_mode_access('engineering')
    AND shared.is_admin()
  );

-- microsites
CREATE POLICY "engineering_microsites_select_internal"
  ON engineering.microsites FOR SELECT
  TO authenticated
  USING (
    shared.user_has_mode_access('engineering')
    AND visibility = 'internal'
    AND deleted_at IS NULL
  );

CREATE POLICY "engineering_microsites_select_public"
  ON engineering.microsites FOR SELECT
  USING (
    visibility = 'public'
    AND deleted_at IS NULL
  );

CREATE POLICY "engineering_microsites_select_deleted"
  ON engineering.microsites FOR SELECT
  TO authenticated
  USING (
    shared.user_has_mode_access('engineering')
    AND shared.is_admin()
  );

CREATE POLICY "engineering_microsites_insert"
  ON engineering.microsites FOR INSERT
  TO authenticated
  WITH CHECK (
    shared.user_has_mode_access('engineering')
    AND auth.uid() = user_id
  );

CREATE POLICY "engineering_microsites_update_own"
  ON engineering.microsites FOR UPDATE
  TO authenticated
  USING (
    shared.user_has_mode_access('engineering')
    AND auth.uid() = user_id
  );

CREATE POLICY "engineering_microsites_update_editor"
  ON engineering.microsites FOR UPDATE
  TO authenticated
  USING (
    shared.user_has_mode_access('engineering')
    AND shared.is_editor_or_admin()
  );

CREATE POLICY "engineering_microsites_delete"
  ON engineering.microsites FOR DELETE
  TO authenticated
  USING (
    shared.user_has_mode_access('engineering')
    AND shared.is_admin()
  );

-- entities
CREATE POLICY "engineering_entities_select"
  ON engineering.entities FOR SELECT
  TO authenticated
  USING (
    shared.user_has_mode_access('engineering')
    AND deleted_at IS NULL
  );

CREATE POLICY "engineering_entities_select_deleted"
  ON engineering.entities FOR SELECT
  TO authenticated
  USING (
    shared.user_has_mode_access('engineering')
    AND shared.is_admin()
  );

CREATE POLICY "engineering_entities_insert"
  ON engineering.entities FOR INSERT
  TO authenticated
  WITH CHECK (shared.user_has_mode_access('engineering'));

CREATE POLICY "engineering_entities_update"
  ON engineering.entities FOR UPDATE
  TO authenticated
  USING (
    shared.user_has_mode_access('engineering')
    AND shared.is_editor_or_admin()
  );

CREATE POLICY "engineering_entities_delete"
  ON engineering.entities FOR DELETE
  TO authenticated
  USING (
    shared.user_has_mode_access('engineering')
    AND shared.is_admin()
  );

-- entity_appearances
CREATE POLICY "engineering_entity_appearances_select"
  ON engineering.entity_appearances FOR SELECT
  TO authenticated
  USING (shared.user_has_mode_access('engineering'));

CREATE POLICY "engineering_entity_appearances_insert"
  ON engineering.entity_appearances FOR INSERT
  TO authenticated
  WITH CHECK (
    shared.user_has_mode_access('engineering')
    AND shared.is_editor_or_admin()
  );

CREATE POLICY "engineering_entity_appearances_update"
  ON engineering.entity_appearances FOR UPDATE
  TO authenticated
  USING (
    shared.user_has_mode_access('engineering')
    AND shared.is_editor_or_admin()
  );

CREATE POLICY "engineering_entity_appearances_delete"
  ON engineering.entity_appearances FOR DELETE
  TO authenticated
  USING (
    shared.user_has_mode_access('engineering')
    AND shared.is_editor_or_admin()
  );

-- entity_relations
CREATE POLICY "engineering_entity_relations_select"
  ON engineering.entity_relations FOR SELECT
  TO authenticated
  USING (shared.user_has_mode_access('engineering'));

CREATE POLICY "engineering_entity_relations_insert"
  ON engineering.entity_relations FOR INSERT
  TO authenticated
  WITH CHECK (
    shared.user_has_mode_access('engineering')
    AND shared.is_editor_or_admin()
  );

CREATE POLICY "engineering_entity_relations_update"
  ON engineering.entity_relations FOR UPDATE
  TO authenticated
  USING (
    shared.user_has_mode_access('engineering')
    AND shared.is_editor_or_admin()
  );

CREATE POLICY "engineering_entity_relations_delete"
  ON engineering.entity_relations FOR DELETE
  TO authenticated
  USING (
    shared.user_has_mode_access('engineering')
    AND shared.is_editor_or_admin()
  );

-- opportunities
CREATE POLICY "engineering_opportunities_select"
  ON engineering.opportunities FOR SELECT
  TO authenticated
  USING (
    shared.user_has_mode_access('engineering')
    AND status = 'active'
  );

CREATE POLICY "engineering_opportunities_select_editor"
  ON engineering.opportunities FOR SELECT
  TO authenticated
  USING (
    shared.user_has_mode_access('engineering')
    AND shared.is_editor_or_admin()
  );

CREATE POLICY "engineering_opportunities_insert"
  ON engineering.opportunities FOR INSERT
  TO authenticated
  WITH CHECK (shared.user_has_mode_access('engineering'));

CREATE POLICY "engineering_opportunities_update"
  ON engineering.opportunities FOR UPDATE
  TO authenticated
  USING (
    shared.user_has_mode_access('engineering')
    AND shared.is_editor_or_admin()
  );

CREATE POLICY "engineering_opportunities_delete"
  ON engineering.opportunities FOR DELETE
  TO authenticated
  USING (
    shared.user_has_mode_access('engineering')
    AND shared.is_admin()
  );

-- entity_opportunities
CREATE POLICY "engineering_entity_opportunities_select"
  ON engineering.entity_opportunities FOR SELECT
  TO authenticated
  USING (shared.user_has_mode_access('engineering'));

CREATE POLICY "engineering_entity_opportunities_insert"
  ON engineering.entity_opportunities FOR INSERT
  TO authenticated
  WITH CHECK (
    shared.user_has_mode_access('engineering')
    AND shared.is_editor_or_admin()
  );

CREATE POLICY "engineering_entity_opportunities_update"
  ON engineering.entity_opportunities FOR UPDATE
  TO authenticated
  USING (
    shared.user_has_mode_access('engineering')
    AND shared.is_editor_or_admin()
  );

CREATE POLICY "engineering_entity_opportunities_delete"
  ON engineering.entity_opportunities FOR DELETE
  TO authenticated
  USING (
    shared.user_has_mode_access('engineering')
    AND shared.is_editor_or_admin()
  );

-- pipeline_workflows
CREATE POLICY "engineering_pipeline_workflows_select"
  ON engineering.pipeline_workflows FOR SELECT
  TO authenticated
  USING (shared.user_has_mode_access('engineering'));

CREATE POLICY "engineering_pipeline_workflows_insert"
  ON engineering.pipeline_workflows FOR INSERT
  TO authenticated
  WITH CHECK (
    shared.user_has_mode_access('engineering')
    AND shared.is_admin()
  );

CREATE POLICY "engineering_pipeline_workflows_update"
  ON engineering.pipeline_workflows FOR UPDATE
  TO authenticated
  USING (
    shared.user_has_mode_access('engineering')
    AND shared.is_admin()
  );

CREATE POLICY "engineering_pipeline_workflows_delete"
  ON engineering.pipeline_workflows FOR DELETE
  TO authenticated
  USING (
    shared.user_has_mode_access('engineering')
    AND shared.is_admin()
  );

-- pipeline_stages
CREATE POLICY "engineering_pipeline_stages_select"
  ON engineering.pipeline_stages FOR SELECT
  TO authenticated
  USING (shared.user_has_mode_access('engineering'));

CREATE POLICY "engineering_pipeline_stages_insert"
  ON engineering.pipeline_stages FOR INSERT
  TO authenticated
  WITH CHECK (
    shared.user_has_mode_access('engineering')
    AND shared.is_admin()
  );

CREATE POLICY "engineering_pipeline_stages_update"
  ON engineering.pipeline_stages FOR UPDATE
  TO authenticated
  USING (
    shared.user_has_mode_access('engineering')
    AND shared.is_admin()
  );

CREATE POLICY "engineering_pipeline_stages_delete"
  ON engineering.pipeline_stages FOR DELETE
  TO authenticated
  USING (
    shared.user_has_mode_access('engineering')
    AND shared.is_admin()
  );

-- opportunity_owners
CREATE POLICY "engineering_opportunity_owners_select"
  ON engineering.opportunity_owners FOR SELECT
  TO authenticated
  USING (shared.user_has_mode_access('engineering'));

CREATE POLICY "engineering_opportunity_owners_insert"
  ON engineering.opportunity_owners FOR INSERT
  TO authenticated
  WITH CHECK (shared.user_has_mode_access('engineering'));

CREATE POLICY "engineering_opportunity_owners_update"
  ON engineering.opportunity_owners FOR UPDATE
  TO authenticated
  USING (shared.user_has_mode_access('engineering'));

CREATE POLICY "engineering_opportunity_owners_delete"
  ON engineering.opportunity_owners FOR DELETE
  TO authenticated
  USING (shared.user_has_mode_access('engineering'));

-- opportunity_entities
CREATE POLICY "engineering_opportunity_entities_select"
  ON engineering.opportunity_entities FOR SELECT
  TO authenticated
  USING (shared.user_has_mode_access('engineering'));

CREATE POLICY "engineering_opportunity_entities_insert"
  ON engineering.opportunity_entities FOR INSERT
  TO authenticated
  WITH CHECK (shared.user_has_mode_access('engineering'));

CREATE POLICY "engineering_opportunity_entities_update"
  ON engineering.opportunity_entities FOR UPDATE
  TO authenticated
  USING (shared.user_has_mode_access('engineering'));

CREATE POLICY "engineering_opportunity_entities_delete"
  ON engineering.opportunity_entities FOR DELETE
  TO authenticated
  USING (shared.user_has_mode_access('engineering'));

-- opportunity_activity
CREATE POLICY "engineering_opportunity_activity_select"
  ON engineering.opportunity_activity FOR SELECT
  TO authenticated
  USING (shared.user_has_mode_access('engineering'));

CREATE POLICY "engineering_opportunity_activity_insert"
  ON engineering.opportunity_activity FOR INSERT
  TO authenticated
  WITH CHECK (
    shared.user_has_mode_access('engineering')
    AND auth.uid() = user_id
  );

-- entity_aliases
CREATE POLICY "engineering_entity_aliases_select"
  ON engineering.entity_aliases FOR SELECT
  TO authenticated
  USING (shared.user_has_mode_access('engineering'));

CREATE POLICY "engineering_entity_aliases_insert"
  ON engineering.entity_aliases FOR INSERT
  TO authenticated
  WITH CHECK (shared.user_has_mode_access('engineering'));

CREATE POLICY "engineering_entity_aliases_delete"
  ON engineering.entity_aliases FOR DELETE
  TO authenticated
  USING (shared.user_has_mode_access('engineering'));

-- ============================================================================
-- SKUNKWORKS SCHEMA - DROP EXISTING POLICIES
-- ============================================================================

-- generation_jobs
DROP POLICY IF EXISTS "Users can create jobs" ON skunkworks.generation_jobs;
DROP POLICY IF EXISTS "Users can view own jobs" ON skunkworks.generation_jobs;
DROP POLICY IF EXISTS "Admins can view all jobs" ON skunkworks.generation_jobs;
DROP POLICY IF EXISTS "Mode access required for jobs" ON skunkworks.generation_jobs;
DROP POLICY IF EXISTS "Mode access for creating jobs" ON skunkworks.generation_jobs;

-- artifacts
DROP POLICY IF EXISTS "Users can view own job artifacts" ON skunkworks.artifacts;
DROP POLICY IF EXISTS "Admins can view all artifacts" ON skunkworks.artifacts;

-- microsites
DROP POLICY IF EXISTS "Authenticated users can view internal microsites" ON skunkworks.microsites;
DROP POLICY IF EXISTS "Anyone can view public microsites" ON skunkworks.microsites;
DROP POLICY IF EXISTS "Users can edit own microsites" ON skunkworks.microsites;
DROP POLICY IF EXISTS "Editors can edit any microsite" ON skunkworks.microsites;
DROP POLICY IF EXISTS "Users can create microsites" ON skunkworks.microsites;
DROP POLICY IF EXISTS "Admins can view deleted microsites" ON skunkworks.microsites;
DROP POLICY IF EXISTS "Mode access required for microsites" ON skunkworks.microsites;
DROP POLICY IF EXISTS "Mode access for creating microsites" ON skunkworks.microsites;

-- entities
DROP POLICY IF EXISTS "Authenticated users can view entities" ON skunkworks.entities;
DROP POLICY IF EXISTS "Editors can modify entities" ON skunkworks.entities;
DROP POLICY IF EXISTS "Admins can view deleted entities" ON skunkworks.entities;
DROP POLICY IF EXISTS "Mode access required for entities" ON skunkworks.entities;
DROP POLICY IF EXISTS "Mode access for creating entities" ON skunkworks.entities;

-- entity_appearances
DROP POLICY IF EXISTS "Authenticated users can view entity appearances" ON skunkworks.entity_appearances;
DROP POLICY IF EXISTS "Editors can modify entity appearances" ON skunkworks.entity_appearances;

-- entity_relations
DROP POLICY IF EXISTS "Authenticated users can view entity relations" ON skunkworks.entity_relations;
DROP POLICY IF EXISTS "Editors can modify entity relations" ON skunkworks.entity_relations;

-- opportunities
DROP POLICY IF EXISTS "Authenticated users can view active opportunities" ON skunkworks.opportunities;
DROP POLICY IF EXISTS "Authenticated users can insert opportunities" ON skunkworks.opportunities;
DROP POLICY IF EXISTS "Authenticated users can update opportunities" ON skunkworks.opportunities;
DROP POLICY IF EXISTS "Editors can modify opportunities" ON skunkworks.opportunities;
DROP POLICY IF EXISTS "Mode access required for opportunities" ON skunkworks.opportunities;
DROP POLICY IF EXISTS "Mode access for creating opportunities" ON skunkworks.opportunities;

-- entity_opportunities
DROP POLICY IF EXISTS "Authenticated users can view entity opportunities" ON skunkworks.entity_opportunities;
DROP POLICY IF EXISTS "Editors can modify entity opportunities" ON skunkworks.entity_opportunities;

-- pipeline_workflows
DROP POLICY IF EXISTS "Authenticated users can read workflows" ON skunkworks.pipeline_workflows;

-- pipeline_stages
DROP POLICY IF EXISTS "Authenticated users can read stages" ON skunkworks.pipeline_stages;

-- opportunity_owners
DROP POLICY IF EXISTS "Authenticated users can read opportunity owners" ON skunkworks.opportunity_owners;
DROP POLICY IF EXISTS "Authenticated users can manage opportunity owners" ON skunkworks.opportunity_owners;

-- opportunity_entities
DROP POLICY IF EXISTS "Authenticated users can read opportunity entities" ON skunkworks.opportunity_entities;
DROP POLICY IF EXISTS "Authenticated users can manage opportunity entities" ON skunkworks.opportunity_entities;

-- opportunity_activity
DROP POLICY IF EXISTS "Authenticated users can read opportunity activity" ON skunkworks.opportunity_activity;
DROP POLICY IF EXISTS "Users can log activity" ON skunkworks.opportunity_activity;

-- entity_aliases
DROP POLICY IF EXISTS "Authenticated users can read entity aliases" ON skunkworks.entity_aliases;
DROP POLICY IF EXISTS "Authenticated users can create entity aliases" ON skunkworks.entity_aliases;
DROP POLICY IF EXISTS "Authenticated users can delete entity aliases" ON skunkworks.entity_aliases;

-- ============================================================================
-- SKUNKWORKS SCHEMA - RECREATE WITH MODE GATING
-- All policies now require shared.user_has_mode_access('skunkworks')
-- ============================================================================

-- generation_jobs
CREATE POLICY "skunkworks_jobs_select"
  ON skunkworks.generation_jobs FOR SELECT
  TO authenticated
  USING (
    shared.user_has_mode_access('skunkworks')
    AND (auth.uid() = user_id OR shared.is_admin())
  );

CREATE POLICY "skunkworks_jobs_insert"
  ON skunkworks.generation_jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    shared.user_has_mode_access('skunkworks')
    AND auth.uid() = user_id
  );

CREATE POLICY "skunkworks_jobs_update"
  ON skunkworks.generation_jobs FOR UPDATE
  TO authenticated
  USING (
    shared.user_has_mode_access('skunkworks')
    AND (auth.uid() = user_id OR shared.is_admin())
  );

-- artifacts
CREATE POLICY "skunkworks_artifacts_select"
  ON skunkworks.artifacts FOR SELECT
  TO authenticated
  USING (
    shared.user_has_mode_access('skunkworks')
    AND (
      EXISTS (
        SELECT 1 FROM skunkworks.generation_jobs
        WHERE id = artifacts.job_id AND user_id = auth.uid()
      )
      OR shared.is_admin()
    )
  );

CREATE POLICY "skunkworks_artifacts_insert"
  ON skunkworks.artifacts FOR INSERT
  TO authenticated
  WITH CHECK (shared.user_has_mode_access('skunkworks'));

CREATE POLICY "skunkworks_artifacts_update"
  ON skunkworks.artifacts FOR UPDATE
  TO authenticated
  USING (
    shared.user_has_mode_access('skunkworks')
    AND shared.is_editor_or_admin()
  );

CREATE POLICY "skunkworks_artifacts_delete"
  ON skunkworks.artifacts FOR DELETE
  TO authenticated
  USING (
    shared.user_has_mode_access('skunkworks')
    AND shared.is_admin()
  );

-- microsites
CREATE POLICY "skunkworks_microsites_select_internal"
  ON skunkworks.microsites FOR SELECT
  TO authenticated
  USING (
    shared.user_has_mode_access('skunkworks')
    AND visibility = 'internal'
    AND deleted_at IS NULL
  );

CREATE POLICY "skunkworks_microsites_select_public"
  ON skunkworks.microsites FOR SELECT
  USING (
    visibility = 'public'
    AND deleted_at IS NULL
  );

CREATE POLICY "skunkworks_microsites_select_deleted"
  ON skunkworks.microsites FOR SELECT
  TO authenticated
  USING (
    shared.user_has_mode_access('skunkworks')
    AND shared.is_admin()
  );

CREATE POLICY "skunkworks_microsites_insert"
  ON skunkworks.microsites FOR INSERT
  TO authenticated
  WITH CHECK (
    shared.user_has_mode_access('skunkworks')
    AND auth.uid() = user_id
  );

CREATE POLICY "skunkworks_microsites_update_own"
  ON skunkworks.microsites FOR UPDATE
  TO authenticated
  USING (
    shared.user_has_mode_access('skunkworks')
    AND auth.uid() = user_id
  );

CREATE POLICY "skunkworks_microsites_update_editor"
  ON skunkworks.microsites FOR UPDATE
  TO authenticated
  USING (
    shared.user_has_mode_access('skunkworks')
    AND shared.is_editor_or_admin()
  );

CREATE POLICY "skunkworks_microsites_delete"
  ON skunkworks.microsites FOR DELETE
  TO authenticated
  USING (
    shared.user_has_mode_access('skunkworks')
    AND shared.is_admin()
  );

-- entities
CREATE POLICY "skunkworks_entities_select"
  ON skunkworks.entities FOR SELECT
  TO authenticated
  USING (
    shared.user_has_mode_access('skunkworks')
    AND deleted_at IS NULL
  );

CREATE POLICY "skunkworks_entities_select_deleted"
  ON skunkworks.entities FOR SELECT
  TO authenticated
  USING (
    shared.user_has_mode_access('skunkworks')
    AND shared.is_admin()
  );

CREATE POLICY "skunkworks_entities_insert"
  ON skunkworks.entities FOR INSERT
  TO authenticated
  WITH CHECK (shared.user_has_mode_access('skunkworks'));

CREATE POLICY "skunkworks_entities_update"
  ON skunkworks.entities FOR UPDATE
  TO authenticated
  USING (
    shared.user_has_mode_access('skunkworks')
    AND shared.is_editor_or_admin()
  );

CREATE POLICY "skunkworks_entities_delete"
  ON skunkworks.entities FOR DELETE
  TO authenticated
  USING (
    shared.user_has_mode_access('skunkworks')
    AND shared.is_admin()
  );

-- entity_appearances
CREATE POLICY "skunkworks_entity_appearances_select"
  ON skunkworks.entity_appearances FOR SELECT
  TO authenticated
  USING (shared.user_has_mode_access('skunkworks'));

CREATE POLICY "skunkworks_entity_appearances_insert"
  ON skunkworks.entity_appearances FOR INSERT
  TO authenticated
  WITH CHECK (
    shared.user_has_mode_access('skunkworks')
    AND shared.is_editor_or_admin()
  );

CREATE POLICY "skunkworks_entity_appearances_update"
  ON skunkworks.entity_appearances FOR UPDATE
  TO authenticated
  USING (
    shared.user_has_mode_access('skunkworks')
    AND shared.is_editor_or_admin()
  );

CREATE POLICY "skunkworks_entity_appearances_delete"
  ON skunkworks.entity_appearances FOR DELETE
  TO authenticated
  USING (
    shared.user_has_mode_access('skunkworks')
    AND shared.is_editor_or_admin()
  );

-- entity_relations
CREATE POLICY "skunkworks_entity_relations_select"
  ON skunkworks.entity_relations FOR SELECT
  TO authenticated
  USING (shared.user_has_mode_access('skunkworks'));

CREATE POLICY "skunkworks_entity_relations_insert"
  ON skunkworks.entity_relations FOR INSERT
  TO authenticated
  WITH CHECK (
    shared.user_has_mode_access('skunkworks')
    AND shared.is_editor_or_admin()
  );

CREATE POLICY "skunkworks_entity_relations_update"
  ON skunkworks.entity_relations FOR UPDATE
  TO authenticated
  USING (
    shared.user_has_mode_access('skunkworks')
    AND shared.is_editor_or_admin()
  );

CREATE POLICY "skunkworks_entity_relations_delete"
  ON skunkworks.entity_relations FOR DELETE
  TO authenticated
  USING (
    shared.user_has_mode_access('skunkworks')
    AND shared.is_editor_or_admin()
  );

-- opportunities
CREATE POLICY "skunkworks_opportunities_select"
  ON skunkworks.opportunities FOR SELECT
  TO authenticated
  USING (
    shared.user_has_mode_access('skunkworks')
    AND status = 'active'
  );

CREATE POLICY "skunkworks_opportunities_select_editor"
  ON skunkworks.opportunities FOR SELECT
  TO authenticated
  USING (
    shared.user_has_mode_access('skunkworks')
    AND shared.is_editor_or_admin()
  );

CREATE POLICY "skunkworks_opportunities_insert"
  ON skunkworks.opportunities FOR INSERT
  TO authenticated
  WITH CHECK (shared.user_has_mode_access('skunkworks'));

CREATE POLICY "skunkworks_opportunities_update"
  ON skunkworks.opportunities FOR UPDATE
  TO authenticated
  USING (
    shared.user_has_mode_access('skunkworks')
    AND shared.is_editor_or_admin()
  );

CREATE POLICY "skunkworks_opportunities_delete"
  ON skunkworks.opportunities FOR DELETE
  TO authenticated
  USING (
    shared.user_has_mode_access('skunkworks')
    AND shared.is_admin()
  );

-- entity_opportunities
CREATE POLICY "skunkworks_entity_opportunities_select"
  ON skunkworks.entity_opportunities FOR SELECT
  TO authenticated
  USING (shared.user_has_mode_access('skunkworks'));

CREATE POLICY "skunkworks_entity_opportunities_insert"
  ON skunkworks.entity_opportunities FOR INSERT
  TO authenticated
  WITH CHECK (
    shared.user_has_mode_access('skunkworks')
    AND shared.is_editor_or_admin()
  );

CREATE POLICY "skunkworks_entity_opportunities_update"
  ON skunkworks.entity_opportunities FOR UPDATE
  TO authenticated
  USING (
    shared.user_has_mode_access('skunkworks')
    AND shared.is_editor_or_admin()
  );

CREATE POLICY "skunkworks_entity_opportunities_delete"
  ON skunkworks.entity_opportunities FOR DELETE
  TO authenticated
  USING (
    shared.user_has_mode_access('skunkworks')
    AND shared.is_editor_or_admin()
  );

-- pipeline_workflows
CREATE POLICY "skunkworks_pipeline_workflows_select"
  ON skunkworks.pipeline_workflows FOR SELECT
  TO authenticated
  USING (shared.user_has_mode_access('skunkworks'));

CREATE POLICY "skunkworks_pipeline_workflows_insert"
  ON skunkworks.pipeline_workflows FOR INSERT
  TO authenticated
  WITH CHECK (
    shared.user_has_mode_access('skunkworks')
    AND shared.is_admin()
  );

CREATE POLICY "skunkworks_pipeline_workflows_update"
  ON skunkworks.pipeline_workflows FOR UPDATE
  TO authenticated
  USING (
    shared.user_has_mode_access('skunkworks')
    AND shared.is_admin()
  );

CREATE POLICY "skunkworks_pipeline_workflows_delete"
  ON skunkworks.pipeline_workflows FOR DELETE
  TO authenticated
  USING (
    shared.user_has_mode_access('skunkworks')
    AND shared.is_admin()
  );

-- pipeline_stages
CREATE POLICY "skunkworks_pipeline_stages_select"
  ON skunkworks.pipeline_stages FOR SELECT
  TO authenticated
  USING (shared.user_has_mode_access('skunkworks'));

CREATE POLICY "skunkworks_pipeline_stages_insert"
  ON skunkworks.pipeline_stages FOR INSERT
  TO authenticated
  WITH CHECK (
    shared.user_has_mode_access('skunkworks')
    AND shared.is_admin()
  );

CREATE POLICY "skunkworks_pipeline_stages_update"
  ON skunkworks.pipeline_stages FOR UPDATE
  TO authenticated
  USING (
    shared.user_has_mode_access('skunkworks')
    AND shared.is_admin()
  );

CREATE POLICY "skunkworks_pipeline_stages_delete"
  ON skunkworks.pipeline_stages FOR DELETE
  TO authenticated
  USING (
    shared.user_has_mode_access('skunkworks')
    AND shared.is_admin()
  );

-- opportunity_owners
CREATE POLICY "skunkworks_opportunity_owners_select"
  ON skunkworks.opportunity_owners FOR SELECT
  TO authenticated
  USING (shared.user_has_mode_access('skunkworks'));

CREATE POLICY "skunkworks_opportunity_owners_insert"
  ON skunkworks.opportunity_owners FOR INSERT
  TO authenticated
  WITH CHECK (shared.user_has_mode_access('skunkworks'));

CREATE POLICY "skunkworks_opportunity_owners_update"
  ON skunkworks.opportunity_owners FOR UPDATE
  TO authenticated
  USING (shared.user_has_mode_access('skunkworks'));

CREATE POLICY "skunkworks_opportunity_owners_delete"
  ON skunkworks.opportunity_owners FOR DELETE
  TO authenticated
  USING (shared.user_has_mode_access('skunkworks'));

-- opportunity_entities
CREATE POLICY "skunkworks_opportunity_entities_select"
  ON skunkworks.opportunity_entities FOR SELECT
  TO authenticated
  USING (shared.user_has_mode_access('skunkworks'));

CREATE POLICY "skunkworks_opportunity_entities_insert"
  ON skunkworks.opportunity_entities FOR INSERT
  TO authenticated
  WITH CHECK (shared.user_has_mode_access('skunkworks'));

CREATE POLICY "skunkworks_opportunity_entities_update"
  ON skunkworks.opportunity_entities FOR UPDATE
  TO authenticated
  USING (shared.user_has_mode_access('skunkworks'));

CREATE POLICY "skunkworks_opportunity_entities_delete"
  ON skunkworks.opportunity_entities FOR DELETE
  TO authenticated
  USING (shared.user_has_mode_access('skunkworks'));

-- opportunity_activity
CREATE POLICY "skunkworks_opportunity_activity_select"
  ON skunkworks.opportunity_activity FOR SELECT
  TO authenticated
  USING (shared.user_has_mode_access('skunkworks'));

CREATE POLICY "skunkworks_opportunity_activity_insert"
  ON skunkworks.opportunity_activity FOR INSERT
  TO authenticated
  WITH CHECK (
    shared.user_has_mode_access('skunkworks')
    AND auth.uid() = user_id
  );

-- entity_aliases
CREATE POLICY "skunkworks_entity_aliases_select"
  ON skunkworks.entity_aliases FOR SELECT
  TO authenticated
  USING (shared.user_has_mode_access('skunkworks'));

CREATE POLICY "skunkworks_entity_aliases_insert"
  ON skunkworks.entity_aliases FOR INSERT
  TO authenticated
  WITH CHECK (shared.user_has_mode_access('skunkworks'));

CREATE POLICY "skunkworks_entity_aliases_delete"
  ON skunkworks.entity_aliases FOR DELETE
  TO authenticated
  USING (shared.user_has_mode_access('skunkworks'));

-- ============================================================================
-- GROWTH SCHEMA - VERIFY OPEN ACCESS (NO CHANGES NEEDED)
-- Growth policies from 013 do NOT require mode checks - all authenticated
-- users have access by default. No changes needed here.
-- ============================================================================

-- Growth remains open: shared.user_has_mode_access('growth') returns true for
-- all authenticated users per the function in migration 014.
