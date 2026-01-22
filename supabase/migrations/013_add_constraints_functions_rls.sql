-- ============================================================================
-- Migration 013: Constraints, Functions, and RLS for Multi-Schema
-- Phase: 2 (Schema Split)
-- Created: 2026-01-22
-- ============================================================================

-- 1. Foreign keys (growth)
ALTER TABLE growth.entities
  ADD CONSTRAINT entities_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id),
  ADD CONSTRAINT entities_merged_into_id_fkey FOREIGN KEY (merged_into_id) REFERENCES growth.entities(id),
  ADD CONSTRAINT entities_extraction_job_id_fkey FOREIGN KEY (extraction_job_id) REFERENCES growth.generation_jobs(id);

ALTER TABLE growth.microsites
  ADD CONSTRAINT microsites_user_id_fkey FOREIGN KEY (user_id) REFERENCES shared.users(id),
  ADD CONSTRAINT fk_microsites_job FOREIGN KEY (job_id) REFERENCES growth.generation_jobs(id);

ALTER TABLE growth.generation_jobs
  ADD CONSTRAINT generation_jobs_user_id_fkey FOREIGN KEY (user_id) REFERENCES shared.users(id) ON DELETE CASCADE,
  ADD CONSTRAINT generation_jobs_microsite_id_fkey FOREIGN KEY (microsite_id) REFERENCES growth.microsites(id);

ALTER TABLE growth.artifacts
  ADD CONSTRAINT artifacts_job_id_fkey FOREIGN KEY (job_id) REFERENCES growth.generation_jobs(id) ON DELETE CASCADE;

ALTER TABLE growth.entity_appearances
  ADD CONSTRAINT entity_appearances_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES growth.entities(id) ON DELETE CASCADE,
  ADD CONSTRAINT entity_appearances_microsite_id_fkey FOREIGN KEY (microsite_id) REFERENCES growth.microsites(id) ON DELETE CASCADE;

ALTER TABLE growth.entity_relations
  ADD CONSTRAINT entity_relations_entity_a_id_fkey FOREIGN KEY (entity_a_id) REFERENCES growth.entities(id) ON DELETE CASCADE,
  ADD CONSTRAINT entity_relations_entity_b_id_fkey FOREIGN KEY (entity_b_id) REFERENCES growth.entities(id) ON DELETE CASCADE;

ALTER TABLE growth.entity_opportunities
  ADD CONSTRAINT entity_opportunities_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES growth.entities(id) ON DELETE CASCADE,
  ADD CONSTRAINT entity_opportunities_opportunity_id_fkey FOREIGN KEY (opportunity_id) REFERENCES growth.opportunities(id) ON DELETE CASCADE;

ALTER TABLE growth.pipeline_stages
  ADD CONSTRAINT pipeline_stages_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES growth.pipeline_workflows(id) ON DELETE CASCADE;

ALTER TABLE growth.opportunities
  ADD CONSTRAINT opportunities_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES growth.opportunities(id),
  ADD CONSTRAINT opportunities_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES growth.pipeline_workflows(id),
  ADD CONSTRAINT opportunities_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES growth.pipeline_stages(id),
  ADD CONSTRAINT opportunities_source_microsite_id_fkey FOREIGN KEY (source_microsite_id) REFERENCES growth.microsites(id),
  ADD CONSTRAINT opportunities_source_job_id_fkey FOREIGN KEY (source_job_id) REFERENCES growth.generation_jobs(id),
  ADD CONSTRAINT opportunities_archived_by_fkey FOREIGN KEY (archived_by) REFERENCES auth.users(id),
  ADD CONSTRAINT opportunities_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);

ALTER TABLE growth.opportunity_owners
  ADD CONSTRAINT opportunity_owners_opportunity_id_fkey FOREIGN KEY (opportunity_id) REFERENCES growth.opportunities(id) ON DELETE CASCADE,
  ADD CONSTRAINT opportunity_owners_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD CONSTRAINT opportunity_owners_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES auth.users(id);

ALTER TABLE growth.opportunity_entities
  ADD CONSTRAINT opportunity_entities_opportunity_id_fkey FOREIGN KEY (opportunity_id) REFERENCES growth.opportunities(id) ON DELETE CASCADE,
  ADD CONSTRAINT opportunity_entities_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES growth.entities(id) ON DELETE CASCADE;

ALTER TABLE growth.opportunity_activity
  ADD CONSTRAINT opportunity_activity_opportunity_id_fkey FOREIGN KEY (opportunity_id) REFERENCES growth.opportunities(id) ON DELETE CASCADE,
  ADD CONSTRAINT opportunity_activity_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE growth.entity_aliases
  ADD CONSTRAINT entity_aliases_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES growth.entities(id) ON DELETE CASCADE;

-- 2. Foreign keys (engineering)
ALTER TABLE engineering.entities
  ADD CONSTRAINT entities_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id),
  ADD CONSTRAINT entities_merged_into_id_fkey FOREIGN KEY (merged_into_id) REFERENCES engineering.entities(id),
  ADD CONSTRAINT entities_extraction_job_id_fkey FOREIGN KEY (extraction_job_id) REFERENCES engineering.generation_jobs(id);

ALTER TABLE engineering.microsites
  ADD CONSTRAINT microsites_user_id_fkey FOREIGN KEY (user_id) REFERENCES shared.users(id),
  ADD CONSTRAINT fk_microsites_job FOREIGN KEY (job_id) REFERENCES engineering.generation_jobs(id);

ALTER TABLE engineering.generation_jobs
  ADD CONSTRAINT generation_jobs_user_id_fkey FOREIGN KEY (user_id) REFERENCES shared.users(id) ON DELETE CASCADE,
  ADD CONSTRAINT generation_jobs_microsite_id_fkey FOREIGN KEY (microsite_id) REFERENCES engineering.microsites(id);

ALTER TABLE engineering.artifacts
  ADD CONSTRAINT artifacts_job_id_fkey FOREIGN KEY (job_id) REFERENCES engineering.generation_jobs(id) ON DELETE CASCADE;

ALTER TABLE engineering.entity_appearances
  ADD CONSTRAINT entity_appearances_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES engineering.entities(id) ON DELETE CASCADE,
  ADD CONSTRAINT entity_appearances_microsite_id_fkey FOREIGN KEY (microsite_id) REFERENCES engineering.microsites(id) ON DELETE CASCADE;

ALTER TABLE engineering.entity_relations
  ADD CONSTRAINT entity_relations_entity_a_id_fkey FOREIGN KEY (entity_a_id) REFERENCES engineering.entities(id) ON DELETE CASCADE,
  ADD CONSTRAINT entity_relations_entity_b_id_fkey FOREIGN KEY (entity_b_id) REFERENCES engineering.entities(id) ON DELETE CASCADE;

ALTER TABLE engineering.entity_opportunities
  ADD CONSTRAINT entity_opportunities_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES engineering.entities(id) ON DELETE CASCADE,
  ADD CONSTRAINT entity_opportunities_opportunity_id_fkey FOREIGN KEY (opportunity_id) REFERENCES engineering.opportunities(id) ON DELETE CASCADE;

ALTER TABLE engineering.pipeline_stages
  ADD CONSTRAINT pipeline_stages_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES engineering.pipeline_workflows(id) ON DELETE CASCADE;

ALTER TABLE engineering.opportunities
  ADD CONSTRAINT opportunities_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES engineering.opportunities(id),
  ADD CONSTRAINT opportunities_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES engineering.pipeline_workflows(id),
  ADD CONSTRAINT opportunities_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES engineering.pipeline_stages(id),
  ADD CONSTRAINT opportunities_source_microsite_id_fkey FOREIGN KEY (source_microsite_id) REFERENCES engineering.microsites(id),
  ADD CONSTRAINT opportunities_source_job_id_fkey FOREIGN KEY (source_job_id) REFERENCES engineering.generation_jobs(id),
  ADD CONSTRAINT opportunities_archived_by_fkey FOREIGN KEY (archived_by) REFERENCES auth.users(id),
  ADD CONSTRAINT opportunities_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);

ALTER TABLE engineering.opportunity_owners
  ADD CONSTRAINT opportunity_owners_opportunity_id_fkey FOREIGN KEY (opportunity_id) REFERENCES engineering.opportunities(id) ON DELETE CASCADE,
  ADD CONSTRAINT opportunity_owners_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD CONSTRAINT opportunity_owners_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES auth.users(id);

ALTER TABLE engineering.opportunity_entities
  ADD CONSTRAINT opportunity_entities_opportunity_id_fkey FOREIGN KEY (opportunity_id) REFERENCES engineering.opportunities(id) ON DELETE CASCADE,
  ADD CONSTRAINT opportunity_entities_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES engineering.entities(id) ON DELETE CASCADE;

ALTER TABLE engineering.opportunity_activity
  ADD CONSTRAINT opportunity_activity_opportunity_id_fkey FOREIGN KEY (opportunity_id) REFERENCES engineering.opportunities(id) ON DELETE CASCADE,
  ADD CONSTRAINT opportunity_activity_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE engineering.entity_aliases
  ADD CONSTRAINT entity_aliases_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES engineering.entities(id) ON DELETE CASCADE;

-- 3. Foreign keys (skunkworks)
ALTER TABLE skunkworks.entities
  ADD CONSTRAINT entities_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id),
  ADD CONSTRAINT entities_merged_into_id_fkey FOREIGN KEY (merged_into_id) REFERENCES skunkworks.entities(id),
  ADD CONSTRAINT entities_extraction_job_id_fkey FOREIGN KEY (extraction_job_id) REFERENCES skunkworks.generation_jobs(id);

ALTER TABLE skunkworks.microsites
  ADD CONSTRAINT microsites_user_id_fkey FOREIGN KEY (user_id) REFERENCES shared.users(id),
  ADD CONSTRAINT fk_microsites_job FOREIGN KEY (job_id) REFERENCES skunkworks.generation_jobs(id);

ALTER TABLE skunkworks.generation_jobs
  ADD CONSTRAINT generation_jobs_user_id_fkey FOREIGN KEY (user_id) REFERENCES shared.users(id) ON DELETE CASCADE,
  ADD CONSTRAINT generation_jobs_microsite_id_fkey FOREIGN KEY (microsite_id) REFERENCES skunkworks.microsites(id);

ALTER TABLE skunkworks.artifacts
  ADD CONSTRAINT artifacts_job_id_fkey FOREIGN KEY (job_id) REFERENCES skunkworks.generation_jobs(id) ON DELETE CASCADE;

ALTER TABLE skunkworks.entity_appearances
  ADD CONSTRAINT entity_appearances_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES skunkworks.entities(id) ON DELETE CASCADE,
  ADD CONSTRAINT entity_appearances_microsite_id_fkey FOREIGN KEY (microsite_id) REFERENCES skunkworks.microsites(id) ON DELETE CASCADE;

ALTER TABLE skunkworks.entity_relations
  ADD CONSTRAINT entity_relations_entity_a_id_fkey FOREIGN KEY (entity_a_id) REFERENCES skunkworks.entities(id) ON DELETE CASCADE,
  ADD CONSTRAINT entity_relations_entity_b_id_fkey FOREIGN KEY (entity_b_id) REFERENCES skunkworks.entities(id) ON DELETE CASCADE;

ALTER TABLE skunkworks.entity_opportunities
  ADD CONSTRAINT entity_opportunities_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES skunkworks.entities(id) ON DELETE CASCADE,
  ADD CONSTRAINT entity_opportunities_opportunity_id_fkey FOREIGN KEY (opportunity_id) REFERENCES skunkworks.opportunities(id) ON DELETE CASCADE;

ALTER TABLE skunkworks.pipeline_stages
  ADD CONSTRAINT pipeline_stages_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES skunkworks.pipeline_workflows(id) ON DELETE CASCADE;

ALTER TABLE skunkworks.opportunities
  ADD CONSTRAINT opportunities_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES skunkworks.opportunities(id),
  ADD CONSTRAINT opportunities_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES skunkworks.pipeline_workflows(id),
  ADD CONSTRAINT opportunities_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES skunkworks.pipeline_stages(id),
  ADD CONSTRAINT opportunities_source_microsite_id_fkey FOREIGN KEY (source_microsite_id) REFERENCES skunkworks.microsites(id),
  ADD CONSTRAINT opportunities_source_job_id_fkey FOREIGN KEY (source_job_id) REFERENCES skunkworks.generation_jobs(id),
  ADD CONSTRAINT opportunities_archived_by_fkey FOREIGN KEY (archived_by) REFERENCES auth.users(id),
  ADD CONSTRAINT opportunities_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);

ALTER TABLE skunkworks.opportunity_owners
  ADD CONSTRAINT opportunity_owners_opportunity_id_fkey FOREIGN KEY (opportunity_id) REFERENCES skunkworks.opportunities(id) ON DELETE CASCADE,
  ADD CONSTRAINT opportunity_owners_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD CONSTRAINT opportunity_owners_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES auth.users(id);

ALTER TABLE skunkworks.opportunity_entities
  ADD CONSTRAINT opportunity_entities_opportunity_id_fkey FOREIGN KEY (opportunity_id) REFERENCES skunkworks.opportunities(id) ON DELETE CASCADE,
  ADD CONSTRAINT opportunity_entities_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES skunkworks.entities(id) ON DELETE CASCADE;

ALTER TABLE skunkworks.opportunity_activity
  ADD CONSTRAINT opportunity_activity_opportunity_id_fkey FOREIGN KEY (opportunity_id) REFERENCES skunkworks.opportunities(id) ON DELETE CASCADE,
  ADD CONSTRAINT opportunity_activity_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE skunkworks.entity_aliases
  ADD CONSTRAINT entity_aliases_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES skunkworks.entities(id) ON DELETE CASCADE;

-- 4. Shared helper functions & auth trigger
CREATE OR REPLACE FUNCTION shared.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION shared.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM shared.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION shared.is_admin() TO authenticated;

CREATE OR REPLACE FUNCTION shared.is_editor_or_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM shared.users
    WHERE id = auth.uid() AND role IN ('editor', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION shared.is_editor_or_admin() TO authenticated;

CREATE OR REPLACE FUNCTION shared.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO shared.users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION shared.handle_new_user();

DROP TRIGGER IF EXISTS update_users_updated_at ON shared.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON shared.users
  FOR EACH ROW EXECUTE FUNCTION shared.update_updated_at();

DROP TRIGGER IF EXISTS update_mode_config_updated_at ON shared.mode_config;
CREATE TRIGGER update_mode_config_updated_at
  BEFORE UPDATE ON shared.mode_config
  FOR EACH ROW EXECUTE FUNCTION shared.update_updated_at();

-- 5. Updated_at triggers (mode schemas)
DROP TRIGGER IF EXISTS update_microsites_updated_at ON growth.microsites;
CREATE TRIGGER update_microsites_updated_at
  BEFORE UPDATE ON growth.microsites
  FOR EACH ROW EXECUTE FUNCTION shared.update_updated_at();

DROP TRIGGER IF EXISTS update_entities_updated_at ON growth.entities;
CREATE TRIGGER update_entities_updated_at
  BEFORE UPDATE ON growth.entities
  FOR EACH ROW EXECUTE FUNCTION shared.update_updated_at();

DROP TRIGGER IF EXISTS opportunities_updated_at ON growth.opportunities;
CREATE TRIGGER opportunities_updated_at
  BEFORE UPDATE ON growth.opportunities
  FOR EACH ROW EXECUTE FUNCTION shared.update_updated_at();

DROP TRIGGER IF EXISTS update_microsites_updated_at ON engineering.microsites;
CREATE TRIGGER update_microsites_updated_at
  BEFORE UPDATE ON engineering.microsites
  FOR EACH ROW EXECUTE FUNCTION shared.update_updated_at();

DROP TRIGGER IF EXISTS update_entities_updated_at ON engineering.entities;
CREATE TRIGGER update_entities_updated_at
  BEFORE UPDATE ON engineering.entities
  FOR EACH ROW EXECUTE FUNCTION shared.update_updated_at();

DROP TRIGGER IF EXISTS opportunities_updated_at ON engineering.opportunities;
CREATE TRIGGER opportunities_updated_at
  BEFORE UPDATE ON engineering.opportunities
  FOR EACH ROW EXECUTE FUNCTION shared.update_updated_at();

DROP TRIGGER IF EXISTS update_microsites_updated_at ON skunkworks.microsites;
CREATE TRIGGER update_microsites_updated_at
  BEFORE UPDATE ON skunkworks.microsites
  FOR EACH ROW EXECUTE FUNCTION shared.update_updated_at();

DROP TRIGGER IF EXISTS update_entities_updated_at ON skunkworks.entities;
CREATE TRIGGER update_entities_updated_at
  BEFORE UPDATE ON skunkworks.entities
  FOR EACH ROW EXECUTE FUNCTION shared.update_updated_at();

DROP TRIGGER IF EXISTS opportunities_updated_at ON skunkworks.opportunities;
CREATE TRIGGER opportunities_updated_at
  BEFORE UPDATE ON skunkworks.opportunities
  FOR EACH ROW EXECUTE FUNCTION shared.update_updated_at();

-- 6. Entity appearance count triggers (mode schemas)
CREATE OR REPLACE FUNCTION growth.update_entity_appearance_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE growth.entities
    SET appearance_count = appearance_count + 1
    WHERE id = NEW.entity_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE growth.entities
    SET appearance_count = appearance_count - 1
    WHERE id = OLD.entity_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_entity_appearance_count ON growth.entity_appearances;
CREATE TRIGGER trigger_entity_appearance_count
  AFTER INSERT OR DELETE ON growth.entity_appearances
  FOR EACH ROW EXECUTE FUNCTION growth.update_entity_appearance_count();

CREATE OR REPLACE FUNCTION engineering.update_entity_appearance_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE engineering.entities
    SET appearance_count = appearance_count + 1
    WHERE id = NEW.entity_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE engineering.entities
    SET appearance_count = appearance_count - 1
    WHERE id = OLD.entity_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_entity_appearance_count ON engineering.entity_appearances;
CREATE TRIGGER trigger_entity_appearance_count
  AFTER INSERT OR DELETE ON engineering.entity_appearances
  FOR EACH ROW EXECUTE FUNCTION engineering.update_entity_appearance_count();

CREATE OR REPLACE FUNCTION skunkworks.update_entity_appearance_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE skunkworks.entities
    SET appearance_count = appearance_count + 1
    WHERE id = NEW.entity_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE skunkworks.entities
    SET appearance_count = appearance_count - 1
    WHERE id = OLD.entity_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_entity_appearance_count ON skunkworks.entity_appearances;
CREATE TRIGGER trigger_entity_appearance_count
  AFTER INSERT OR DELETE ON skunkworks.entity_appearances
  FOR EACH ROW EXECUTE FUNCTION skunkworks.update_entity_appearance_count();

-- 7. Opportunity counts triggers (mode schemas)
CREATE OR REPLACE FUNCTION growth.update_opportunity_counts()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE growth.opportunities o
  SET entity_count = (
    SELECT COUNT(DISTINCT entity_id)
    FROM growth.entity_opportunities
    WHERE opportunity_id = o.id
  )
  WHERE o.id IN (
    SELECT DISTINCT opportunity_id
    FROM growth.entity_opportunities
  );

  UPDATE growth.opportunities o
  SET microsite_count = (
    SELECT COUNT(DISTINCT ea.microsite_id)
    FROM growth.entity_opportunities eo
    JOIN growth.entity_appearances ea ON eo.entity_id = ea.entity_id
    WHERE eo.opportunity_id = o.id
  )
  WHERE o.id IN (
    SELECT DISTINCT opportunity_id
    FROM growth.entity_opportunities
  );

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_opportunity_counts ON growth.entity_opportunities;
CREATE TRIGGER trigger_opportunity_counts
  AFTER INSERT OR DELETE ON growth.entity_opportunities
  FOR EACH STATEMENT EXECUTE FUNCTION growth.update_opportunity_counts();

CREATE OR REPLACE FUNCTION engineering.update_opportunity_counts()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE engineering.opportunities o
  SET entity_count = (
    SELECT COUNT(DISTINCT entity_id)
    FROM engineering.entity_opportunities
    WHERE opportunity_id = o.id
  )
  WHERE o.id IN (
    SELECT DISTINCT opportunity_id
    FROM engineering.entity_opportunities
  );

  UPDATE engineering.opportunities o
  SET microsite_count = (
    SELECT COUNT(DISTINCT ea.microsite_id)
    FROM engineering.entity_opportunities eo
    JOIN engineering.entity_appearances ea ON eo.entity_id = ea.entity_id
    WHERE eo.opportunity_id = o.id
  )
  WHERE o.id IN (
    SELECT DISTINCT opportunity_id
    FROM engineering.entity_opportunities
  );

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_opportunity_counts ON engineering.entity_opportunities;
CREATE TRIGGER trigger_opportunity_counts
  AFTER INSERT OR DELETE ON engineering.entity_opportunities
  FOR EACH STATEMENT EXECUTE FUNCTION engineering.update_opportunity_counts();

CREATE OR REPLACE FUNCTION skunkworks.update_opportunity_counts()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE skunkworks.opportunities o
  SET entity_count = (
    SELECT COUNT(DISTINCT entity_id)
    FROM skunkworks.entity_opportunities
    WHERE opportunity_id = o.id
  )
  WHERE o.id IN (
    SELECT DISTINCT opportunity_id
    FROM skunkworks.entity_opportunities
  );

  UPDATE skunkworks.opportunities o
  SET microsite_count = (
    SELECT COUNT(DISTINCT ea.microsite_id)
    FROM skunkworks.entity_opportunities eo
    JOIN skunkworks.entity_appearances ea ON eo.entity_id = ea.entity_id
    WHERE eo.opportunity_id = o.id
  )
  WHERE o.id IN (
    SELECT DISTINCT opportunity_id
    FROM skunkworks.entity_opportunities
  );

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_opportunity_counts ON skunkworks.entity_opportunities;
CREATE TRIGGER trigger_opportunity_counts
  AFTER INSERT OR DELETE ON skunkworks.entity_opportunities
  FOR EACH STATEMENT EXECUTE FUNCTION skunkworks.update_opportunity_counts();

-- 8. Soft delete helpers (growth only)
CREATE OR REPLACE FUNCTION growth.soft_delete_microsite(microsite_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE growth.microsites
  SET deleted_at = NOW()
  WHERE id = microsite_id
  AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION growth.soft_delete_entity(entity_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE growth.entities
  SET deleted_at = NOW()
  WHERE id = entity_id
  AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION growth.restore_microsite(microsite_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE growth.microsites
  SET deleted_at = NULL
  WHERE id = microsite_id
  AND deleted_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION growth.restore_entity(entity_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE growth.entities
  SET deleted_at = NULL
  WHERE id = entity_id
  AND deleted_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Duplicate detection & merge helpers (mode schemas)
CREATE OR REPLACE FUNCTION growth.find_potential_duplicates(
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
    SELECT
      e.id,
      e.canonical_name,
      e.type,
      1.0::FLOAT AS sim,
      'exact'::TEXT AS match
    FROM growth.entities e
    WHERE LOWER(e.canonical_name) = LOWER(p_name)
      AND (p_type IS NULL OR e.type = p_type)
      AND e.deleted_at IS NULL
      AND e.review_status != 'rejected'

    UNION ALL

    SELECT
      e.id,
      e.canonical_name,
      e.type,
      0.95::FLOAT AS sim,
      'alias'::TEXT AS match
    FROM growth.entities e
    JOIN growth.entity_aliases a ON a.entity_id = e.id
    WHERE LOWER(a.alias) = LOWER(p_name)
      AND (p_type IS NULL OR e.type = p_type)
      AND e.deleted_at IS NULL
      AND e.review_status != 'rejected'

    UNION ALL

    SELECT
      e.id,
      e.canonical_name,
      e.type,
      similarity(LOWER(e.canonical_name), LOWER(p_name))::FLOAT AS sim,
      'similar'::TEXT AS match
    FROM growth.entities e
    WHERE similarity(LOWER(e.canonical_name), LOWER(p_name)) > p_threshold
      AND (p_type IS NULL OR e.type = p_type)
      AND e.deleted_at IS NULL
      AND e.review_status != 'rejected'
      AND LOWER(e.canonical_name) != LOWER(p_name)
  )
  SELECT DISTINCT ON (c.id)
    c.id AS entity_id,
    c.canonical_name,
    c.type AS entity_type,
    c.sim AS similarity,
    c.match AS match_type
  FROM candidates c
  ORDER BY c.id, c.sim DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION growth.find_potential_duplicates TO authenticated;

CREATE OR REPLACE FUNCTION growth.merge_entities(
  p_source_id UUID,
  p_target_id UUID,
  p_user_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_source_name TEXT;
  v_target_name TEXT;
BEGIN
  SELECT canonical_name INTO v_source_name FROM growth.entities WHERE id = p_source_id;
  SELECT canonical_name INTO v_target_name FROM growth.entities WHERE id = p_target_id;

  IF v_source_name IS NULL OR v_target_name IS NULL THEN
    RAISE EXCEPTION 'One or both entities not found';
  END IF;

  INSERT INTO growth.entity_aliases (entity_id, alias, source)
  VALUES (p_target_id, v_source_name, 'merge')
  ON CONFLICT DO NOTHING;

  INSERT INTO growth.entity_aliases (entity_id, alias, source)
  SELECT p_target_id, a.alias, 'merge'
  FROM growth.entity_aliases a
  WHERE a.entity_id = p_source_id
  ON CONFLICT DO NOTHING;

  UPDATE growth.entity_appearances
  SET entity_id = p_target_id
  WHERE entity_id = p_source_id;

  UPDATE growth.entity_relations
  SET entity_a_id = p_target_id
  WHERE entity_a_id = p_source_id
    AND entity_b_id != p_target_id;

  UPDATE growth.entity_relations
  SET entity_b_id = p_target_id
  WHERE entity_b_id = p_source_id
    AND entity_a_id != p_target_id;

  DELETE FROM growth.entity_relations
  WHERE entity_a_id = p_target_id AND entity_b_id = p_target_id;

  UPDATE growth.opportunity_entities
  SET entity_id = p_target_id
  WHERE entity_id = p_source_id;

  UPDATE growth.entities
  SET review_status = 'merged',
      merged_into_id = p_target_id,
      reviewed_at = NOW(),
      reviewed_by = p_user_id
  WHERE id = p_source_id;

  RETURN p_target_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION growth.merge_entities TO authenticated;

CREATE OR REPLACE FUNCTION engineering.find_potential_duplicates(
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
    SELECT
      e.id,
      e.canonical_name,
      e.type,
      1.0::FLOAT AS sim,
      'exact'::TEXT AS match
    FROM engineering.entities e
    WHERE LOWER(e.canonical_name) = LOWER(p_name)
      AND (p_type IS NULL OR e.type = p_type)
      AND e.deleted_at IS NULL
      AND e.review_status != 'rejected'

    UNION ALL

    SELECT
      e.id,
      e.canonical_name,
      e.type,
      0.95::FLOAT AS sim,
      'alias'::TEXT AS match
    FROM engineering.entities e
    JOIN engineering.entity_aliases a ON a.entity_id = e.id
    WHERE LOWER(a.alias) = LOWER(p_name)
      AND (p_type IS NULL OR e.type = p_type)
      AND e.deleted_at IS NULL
      AND e.review_status != 'rejected'

    UNION ALL

    SELECT
      e.id,
      e.canonical_name,
      e.type,
      similarity(LOWER(e.canonical_name), LOWER(p_name))::FLOAT AS sim,
      'similar'::TEXT AS match
    FROM engineering.entities e
    WHERE similarity(LOWER(e.canonical_name), LOWER(p_name)) > p_threshold
      AND (p_type IS NULL OR e.type = p_type)
      AND e.deleted_at IS NULL
      AND e.review_status != 'rejected'
      AND LOWER(e.canonical_name) != LOWER(p_name)
  )
  SELECT DISTINCT ON (c.id)
    c.id AS entity_id,
    c.canonical_name,
    c.type AS entity_type,
    c.sim AS similarity,
    c.match AS match_type
  FROM candidates c
  ORDER BY c.id, c.sim DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION engineering.find_potential_duplicates TO authenticated;

CREATE OR REPLACE FUNCTION engineering.merge_entities(
  p_source_id UUID,
  p_target_id UUID,
  p_user_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_source_name TEXT;
  v_target_name TEXT;
BEGIN
  SELECT canonical_name INTO v_source_name FROM engineering.entities WHERE id = p_source_id;
  SELECT canonical_name INTO v_target_name FROM engineering.entities WHERE id = p_target_id;

  IF v_source_name IS NULL OR v_target_name IS NULL THEN
    RAISE EXCEPTION 'One or both entities not found';
  END IF;

  INSERT INTO engineering.entity_aliases (entity_id, alias, source)
  VALUES (p_target_id, v_source_name, 'merge')
  ON CONFLICT DO NOTHING;

  INSERT INTO engineering.entity_aliases (entity_id, alias, source)
  SELECT p_target_id, a.alias, 'merge'
  FROM engineering.entity_aliases a
  WHERE a.entity_id = p_source_id
  ON CONFLICT DO NOTHING;

  UPDATE engineering.entity_appearances
  SET entity_id = p_target_id
  WHERE entity_id = p_source_id;

  UPDATE engineering.entity_relations
  SET entity_a_id = p_target_id
  WHERE entity_a_id = p_source_id
    AND entity_b_id != p_target_id;

  UPDATE engineering.entity_relations
  SET entity_b_id = p_target_id
  WHERE entity_b_id = p_source_id
    AND entity_a_id != p_target_id;

  DELETE FROM engineering.entity_relations
  WHERE entity_a_id = p_target_id AND entity_b_id = p_target_id;

  UPDATE engineering.opportunity_entities
  SET entity_id = p_target_id
  WHERE entity_id = p_source_id;

  UPDATE engineering.entities
  SET review_status = 'merged',
      merged_into_id = p_target_id,
      reviewed_at = NOW(),
      reviewed_by = p_user_id
  WHERE id = p_source_id;

  RETURN p_target_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION engineering.merge_entities TO authenticated;

CREATE OR REPLACE FUNCTION skunkworks.find_potential_duplicates(
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
    SELECT
      e.id,
      e.canonical_name,
      e.type,
      1.0::FLOAT AS sim,
      'exact'::TEXT AS match
    FROM skunkworks.entities e
    WHERE LOWER(e.canonical_name) = LOWER(p_name)
      AND (p_type IS NULL OR e.type = p_type)
      AND e.deleted_at IS NULL
      AND e.review_status != 'rejected'

    UNION ALL

    SELECT
      e.id,
      e.canonical_name,
      e.type,
      0.95::FLOAT AS sim,
      'alias'::TEXT AS match
    FROM skunkworks.entities e
    JOIN skunkworks.entity_aliases a ON a.entity_id = e.id
    WHERE LOWER(a.alias) = LOWER(p_name)
      AND (p_type IS NULL OR e.type = p_type)
      AND e.deleted_at IS NULL
      AND e.review_status != 'rejected'

    UNION ALL

    SELECT
      e.id,
      e.canonical_name,
      e.type,
      similarity(LOWER(e.canonical_name), LOWER(p_name))::FLOAT AS sim,
      'similar'::TEXT AS match
    FROM skunkworks.entities e
    WHERE similarity(LOWER(e.canonical_name), LOWER(p_name)) > p_threshold
      AND (p_type IS NULL OR e.type = p_type)
      AND e.deleted_at IS NULL
      AND e.review_status != 'rejected'
      AND LOWER(e.canonical_name) != LOWER(p_name)
  )
  SELECT DISTINCT ON (c.id)
    c.id AS entity_id,
    c.canonical_name,
    c.type AS entity_type,
    c.sim AS similarity,
    c.match AS match_type
  FROM candidates c
  ORDER BY c.id, c.sim DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION skunkworks.find_potential_duplicates TO authenticated;

CREATE OR REPLACE FUNCTION skunkworks.merge_entities(
  p_source_id UUID,
  p_target_id UUID,
  p_user_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_source_name TEXT;
  v_target_name TEXT;
BEGIN
  SELECT canonical_name INTO v_source_name FROM skunkworks.entities WHERE id = p_source_id;
  SELECT canonical_name INTO v_target_name FROM skunkworks.entities WHERE id = p_target_id;

  IF v_source_name IS NULL OR v_target_name IS NULL THEN
    RAISE EXCEPTION 'One or both entities not found';
  END IF;

  INSERT INTO skunkworks.entity_aliases (entity_id, alias, source)
  VALUES (p_target_id, v_source_name, 'merge')
  ON CONFLICT DO NOTHING;

  INSERT INTO skunkworks.entity_aliases (entity_id, alias, source)
  SELECT p_target_id, a.alias, 'merge'
  FROM skunkworks.entity_aliases a
  WHERE a.entity_id = p_source_id
  ON CONFLICT DO NOTHING;

  UPDATE skunkworks.entity_appearances
  SET entity_id = p_target_id
  WHERE entity_id = p_source_id;

  UPDATE skunkworks.entity_relations
  SET entity_a_id = p_target_id
  WHERE entity_a_id = p_source_id
    AND entity_b_id != p_target_id;

  UPDATE skunkworks.entity_relations
  SET entity_b_id = p_target_id
  WHERE entity_b_id = p_source_id
    AND entity_a_id != p_target_id;

  DELETE FROM skunkworks.entity_relations
  WHERE entity_a_id = p_target_id AND entity_b_id = p_target_id;

  UPDATE skunkworks.opportunity_entities
  SET entity_id = p_target_id
  WHERE entity_id = p_source_id;

  UPDATE skunkworks.entities
  SET review_status = 'merged',
      merged_into_id = p_target_id,
      reviewed_at = NOW(),
      reviewed_by = p_user_id
  WHERE id = p_source_id;

  RETURN p_target_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION skunkworks.merge_entities TO authenticated;

-- 10. RLS policies (shared)
ALTER TABLE shared.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared.cross_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared.mode_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON shared.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON shared.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all users"
  ON shared.users FOR SELECT
  USING (shared.is_admin());

CREATE POLICY "Users can read cross_links"
  ON shared.cross_links FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create cross_links"
  ON shared.cross_links FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can read mode config"
  ON shared.mode_config FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage mode config"
  ON shared.mode_config FOR ALL
  TO authenticated
  USING (shared.is_admin())
  WITH CHECK (shared.is_admin());

-- 11. RLS policies (growth)
ALTER TABLE growth.generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth.artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth.microsites ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth.entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth.entity_appearances ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth.entity_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth.entity_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth.pipeline_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth.pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth.opportunity_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth.opportunity_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth.opportunity_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth.entity_aliases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create jobs"
  ON growth.generation_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own jobs"
  ON growth.generation_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all jobs"
  ON growth.generation_jobs FOR SELECT
  USING (shared.is_admin());

CREATE POLICY "Users can view own job artifacts"
  ON growth.artifacts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM growth.generation_jobs
      WHERE id = artifacts.job_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all artifacts"
  ON growth.artifacts FOR SELECT
  USING (shared.is_admin());

CREATE POLICY "Authenticated users can view internal microsites"
  ON growth.microsites FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND visibility = 'internal'
    AND deleted_at IS NULL
  );

CREATE POLICY "Anyone can view public microsites"
  ON growth.microsites FOR SELECT
  USING (
    visibility = 'public'
    AND deleted_at IS NULL
  );

CREATE POLICY "Users can edit own microsites"
  ON growth.microsites FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Editors can edit any microsite"
  ON growth.microsites FOR UPDATE
  USING (shared.is_editor_or_admin());

CREATE POLICY "Users can create microsites"
  ON growth.microsites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view deleted microsites"
  ON growth.microsites FOR SELECT
  USING (shared.is_admin());

CREATE POLICY "Authenticated users can view entities"
  ON growth.entities FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND deleted_at IS NULL
  );

CREATE POLICY "Editors can modify entities"
  ON growth.entities FOR ALL
  USING (shared.is_editor_or_admin());

CREATE POLICY "Admins can view deleted entities"
  ON growth.entities FOR SELECT
  USING (shared.is_admin());

CREATE POLICY "Authenticated users can view entity appearances"
  ON growth.entity_appearances FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Editors can modify entity appearances"
  ON growth.entity_appearances FOR ALL
  USING (shared.is_editor_or_admin());

CREATE POLICY "Authenticated users can view entity relations"
  ON growth.entity_relations FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Editors can modify entity relations"
  ON growth.entity_relations FOR ALL
  USING (shared.is_editor_or_admin());

CREATE POLICY "Authenticated users can view active opportunities"
  ON growth.opportunities FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Authenticated users can insert opportunities"
  ON growth.opportunities FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update opportunities"
  ON growth.opportunities FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Editors can modify opportunities"
  ON growth.opportunities FOR ALL
  USING (shared.is_editor_or_admin());

CREATE POLICY "Authenticated users can view entity opportunities"
  ON growth.entity_opportunities FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Editors can modify entity opportunities"
  ON growth.entity_opportunities FOR ALL
  USING (shared.is_editor_or_admin());

CREATE POLICY "Authenticated users can read workflows"
  ON growth.pipeline_workflows FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read stages"
  ON growth.pipeline_stages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read opportunity owners"
  ON growth.opportunity_owners FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage opportunity owners"
  ON growth.opportunity_owners FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read opportunity entities"
  ON growth.opportunity_entities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage opportunity entities"
  ON growth.opportunity_entities FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read opportunity activity"
  ON growth.opportunity_activity FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can log activity"
  ON growth.opportunity_activity FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can read entity aliases"
  ON growth.entity_aliases FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create entity aliases"
  ON growth.entity_aliases FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete entity aliases"
  ON growth.entity_aliases FOR DELETE
  TO authenticated
  USING (true);

-- 12. RLS policies (engineering)
ALTER TABLE engineering.generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering.artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering.microsites ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering.entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering.entity_appearances ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering.entity_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering.entity_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering.pipeline_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering.pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering.opportunity_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering.opportunity_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering.opportunity_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering.entity_aliases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create jobs"
  ON engineering.generation_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own jobs"
  ON engineering.generation_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all jobs"
  ON engineering.generation_jobs FOR SELECT
  USING (shared.is_admin());

CREATE POLICY "Users can view own job artifacts"
  ON engineering.artifacts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM engineering.generation_jobs
      WHERE id = artifacts.job_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all artifacts"
  ON engineering.artifacts FOR SELECT
  USING (shared.is_admin());

CREATE POLICY "Authenticated users can view internal microsites"
  ON engineering.microsites FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND visibility = 'internal'
    AND deleted_at IS NULL
  );

CREATE POLICY "Anyone can view public microsites"
  ON engineering.microsites FOR SELECT
  USING (
    visibility = 'public'
    AND deleted_at IS NULL
  );

CREATE POLICY "Users can edit own microsites"
  ON engineering.microsites FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Editors can edit any microsite"
  ON engineering.microsites FOR UPDATE
  USING (shared.is_editor_or_admin());

CREATE POLICY "Users can create microsites"
  ON engineering.microsites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view deleted microsites"
  ON engineering.microsites FOR SELECT
  USING (shared.is_admin());

CREATE POLICY "Authenticated users can view entities"
  ON engineering.entities FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND deleted_at IS NULL
  );

CREATE POLICY "Editors can modify entities"
  ON engineering.entities FOR ALL
  USING (shared.is_editor_or_admin());

CREATE POLICY "Admins can view deleted entities"
  ON engineering.entities FOR SELECT
  USING (shared.is_admin());

CREATE POLICY "Authenticated users can view entity appearances"
  ON engineering.entity_appearances FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Editors can modify entity appearances"
  ON engineering.entity_appearances FOR ALL
  USING (shared.is_editor_or_admin());

CREATE POLICY "Authenticated users can view entity relations"
  ON engineering.entity_relations FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Editors can modify entity relations"
  ON engineering.entity_relations FOR ALL
  USING (shared.is_editor_or_admin());

CREATE POLICY "Authenticated users can view active opportunities"
  ON engineering.opportunities FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Authenticated users can insert opportunities"
  ON engineering.opportunities FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update opportunities"
  ON engineering.opportunities FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Editors can modify opportunities"
  ON engineering.opportunities FOR ALL
  USING (shared.is_editor_or_admin());

CREATE POLICY "Authenticated users can view entity opportunities"
  ON engineering.entity_opportunities FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Editors can modify entity opportunities"
  ON engineering.entity_opportunities FOR ALL
  USING (shared.is_editor_or_admin());

CREATE POLICY "Authenticated users can read workflows"
  ON engineering.pipeline_workflows FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read stages"
  ON engineering.pipeline_stages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read opportunity owners"
  ON engineering.opportunity_owners FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage opportunity owners"
  ON engineering.opportunity_owners FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read opportunity entities"
  ON engineering.opportunity_entities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage opportunity entities"
  ON engineering.opportunity_entities FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read opportunity activity"
  ON engineering.opportunity_activity FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can log activity"
  ON engineering.opportunity_activity FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can read entity aliases"
  ON engineering.entity_aliases FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create entity aliases"
  ON engineering.entity_aliases FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete entity aliases"
  ON engineering.entity_aliases FOR DELETE
  TO authenticated
  USING (true);

-- 13. RLS policies (skunkworks)
ALTER TABLE skunkworks.generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE skunkworks.artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE skunkworks.microsites ENABLE ROW LEVEL SECURITY;
ALTER TABLE skunkworks.entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE skunkworks.entity_appearances ENABLE ROW LEVEL SECURITY;
ALTER TABLE skunkworks.entity_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE skunkworks.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE skunkworks.entity_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE skunkworks.pipeline_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE skunkworks.pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE skunkworks.opportunity_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE skunkworks.opportunity_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE skunkworks.opportunity_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE skunkworks.entity_aliases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create jobs"
  ON skunkworks.generation_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own jobs"
  ON skunkworks.generation_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all jobs"
  ON skunkworks.generation_jobs FOR SELECT
  USING (shared.is_admin());

CREATE POLICY "Users can view own job artifacts"
  ON skunkworks.artifacts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM skunkworks.generation_jobs
      WHERE id = artifacts.job_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all artifacts"
  ON skunkworks.artifacts FOR SELECT
  USING (shared.is_admin());

CREATE POLICY "Authenticated users can view internal microsites"
  ON skunkworks.microsites FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND visibility = 'internal'
    AND deleted_at IS NULL
  );

CREATE POLICY "Anyone can view public microsites"
  ON skunkworks.microsites FOR SELECT
  USING (
    visibility = 'public'
    AND deleted_at IS NULL
  );

CREATE POLICY "Users can edit own microsites"
  ON skunkworks.microsites FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Editors can edit any microsite"
  ON skunkworks.microsites FOR UPDATE
  USING (shared.is_editor_or_admin());

CREATE POLICY "Users can create microsites"
  ON skunkworks.microsites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view deleted microsites"
  ON skunkworks.microsites FOR SELECT
  USING (shared.is_admin());

CREATE POLICY "Authenticated users can view entities"
  ON skunkworks.entities FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND deleted_at IS NULL
  );

CREATE POLICY "Editors can modify entities"
  ON skunkworks.entities FOR ALL
  USING (shared.is_editor_or_admin());

CREATE POLICY "Admins can view deleted entities"
  ON skunkworks.entities FOR SELECT
  USING (shared.is_admin());

CREATE POLICY "Authenticated users can view entity appearances"
  ON skunkworks.entity_appearances FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Editors can modify entity appearances"
  ON skunkworks.entity_appearances FOR ALL
  USING (shared.is_editor_or_admin());

CREATE POLICY "Authenticated users can view entity relations"
  ON skunkworks.entity_relations FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Editors can modify entity relations"
  ON skunkworks.entity_relations FOR ALL
  USING (shared.is_editor_or_admin());

CREATE POLICY "Authenticated users can view active opportunities"
  ON skunkworks.opportunities FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Authenticated users can insert opportunities"
  ON skunkworks.opportunities FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update opportunities"
  ON skunkworks.opportunities FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Editors can modify opportunities"
  ON skunkworks.opportunities FOR ALL
  USING (shared.is_editor_or_admin());

CREATE POLICY "Authenticated users can view entity opportunities"
  ON skunkworks.entity_opportunities FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Editors can modify entity opportunities"
  ON skunkworks.entity_opportunities FOR ALL
  USING (shared.is_editor_or_admin());

CREATE POLICY "Authenticated users can read workflows"
  ON skunkworks.pipeline_workflows FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read stages"
  ON skunkworks.pipeline_stages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read opportunity owners"
  ON skunkworks.opportunity_owners FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage opportunity owners"
  ON skunkworks.opportunity_owners FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read opportunity entities"
  ON skunkworks.opportunity_entities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage opportunity entities"
  ON skunkworks.opportunity_entities FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read opportunity activity"
  ON skunkworks.opportunity_activity FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can log activity"
  ON skunkworks.opportunity_activity FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can read entity aliases"
  ON skunkworks.entity_aliases FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create entity aliases"
  ON skunkworks.entity_aliases FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete entity aliases"
  ON skunkworks.entity_aliases FOR DELETE
  TO authenticated
  USING (true);

-- 14. Realtime publications
ALTER PUBLICATION supabase_realtime ADD TABLE growth.generation_jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE engineering.generation_jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE skunkworks.generation_jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE growth.opportunities;
ALTER PUBLICATION supabase_realtime ADD TABLE growth.opportunity_activity;

-- 15. Grants (tables, sequences, functions)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA growth TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA engineering TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA skunkworks TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA shared TO anon, authenticated;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA growth TO service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA engineering TO service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA skunkworks TO service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA shared TO service_role;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA growth TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA engineering TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA skunkworks TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA shared TO anon, authenticated;

GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA growth TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA engineering TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA skunkworks TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA shared TO service_role;

GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA growth TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA engineering TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA skunkworks TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA shared TO anon, authenticated;

GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA growth TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA engineering TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA skunkworks TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA shared TO service_role;

-- 16. Default privileges (future tables/sequences/functions)
ALTER DEFAULT PRIVILEGES IN SCHEMA growth
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA engineering
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA skunkworks
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA shared
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA growth
  GRANT ALL PRIVILEGES ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA engineering
  GRANT ALL PRIVILEGES ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA skunkworks
  GRANT ALL PRIVILEGES ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA shared
  GRANT ALL PRIVILEGES ON TABLES TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA growth
  GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA engineering
  GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA skunkworks
  GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA shared
  GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA growth
  GRANT ALL PRIVILEGES ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA engineering
  GRANT ALL PRIVILEGES ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA skunkworks
  GRANT ALL PRIVILEGES ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA shared
  GRANT ALL PRIVILEGES ON SEQUENCES TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA growth
  GRANT EXECUTE ON FUNCTIONS TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA engineering
  GRANT EXECUTE ON FUNCTIONS TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA skunkworks
  GRANT EXECUTE ON FUNCTIONS TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA shared
  GRANT EXECUTE ON FUNCTIONS TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA growth
  GRANT EXECUTE ON FUNCTIONS TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA engineering
  GRANT EXECUTE ON FUNCTIONS TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA skunkworks
  GRANT EXECUTE ON FUNCTIONS TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA shared
  GRANT EXECUTE ON FUNCTIONS TO service_role;
