-- ============================================================================
-- Migration: Opportunity Pipeline
-- Phase: 2.5a
-- Created: 2026-01-16
--
-- Adds Kanban-style opportunity pipeline with configurable workflows and stages.
-- ============================================================================

-- ============================================================================
-- 1. PIPELINE WORKFLOWS (configurable pipeline types)
-- ============================================================================

CREATE TABLE public.pipeline_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.pipeline_workflows IS 'Configurable workflow types (BD, Product, Research)';

-- ============================================================================
-- 2. PIPELINE STAGES (columns in Kanban board)
-- ============================================================================

CREATE TABLE public.pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES public.pipeline_workflows(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL,
  color TEXT,
  UNIQUE (workflow_id, slug),
  UNIQUE (workflow_id, position)
);

COMMENT ON TABLE public.pipeline_stages IS 'Stages within each workflow (Kanban columns)';

-- ============================================================================
-- 3. EXPAND OPPORTUNITIES TABLE
-- ============================================================================

-- Add new columns to existing opportunities table
ALTER TABLE public.opportunities
  ADD COLUMN IF NOT EXISTS thesis TEXT,
  ADD COLUMN IF NOT EXISTS angle TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
  ADD COLUMN IF NOT EXISTS strategy TEXT,
  ADD COLUMN IF NOT EXISTS email_draft JSONB,
  ADD COLUMN IF NOT EXISTS workflow_id UUID REFERENCES public.pipeline_workflows(id),
  ADD COLUMN IF NOT EXISTS stage_id UUID REFERENCES public.pipeline_stages(id),
  ADD COLUMN IF NOT EXISTS source_microsite_id UUID REFERENCES public.microsites(id),
  ADD COLUMN IF NOT EXISTS source_job_id UUID REFERENCES public.generation_jobs(id),
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS archived_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

COMMENT ON COLUMN public.opportunities.thesis IS 'Core value proposition (why this matters)';
COMMENT ON COLUMN public.opportunities.angle IS 'Outreach hook or timing rationale';
COMMENT ON COLUMN public.opportunities.confidence IS 'Score 0-100 based on evidence strength';
COMMENT ON COLUMN public.opportunities.strategy IS 'AI-generated strategy document';
COMMENT ON COLUMN public.opportunities.email_draft IS 'AI-generated outreach email {subject, body}';

-- ============================================================================
-- 4. OPPORTUNITY OWNERS (many-to-many: who owns this opportunity)
-- ============================================================================

CREATE TABLE public.opportunity_owners (
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  PRIMARY KEY (opportunity_id, user_id)
);

COMMENT ON TABLE public.opportunity_owners IS 'Multiple owners per opportunity';

-- ============================================================================
-- 5. OPPORTUNITY ENTITIES (many-to-many: linked entities)
-- ============================================================================

CREATE TABLE public.opportunity_entities (
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  relationship TEXT DEFAULT 'related' CHECK (relationship IN ('primary', 'related', 'competitor')),
  PRIMARY KEY (opportunity_id, entity_id)
);

COMMENT ON TABLE public.opportunity_entities IS 'Entity links with relationship types';

-- ============================================================================
-- 6. OPPORTUNITY ACTIVITY (audit log)
-- ============================================================================

CREATE TABLE public.opportunity_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL CHECK (action IN (
    'created',
    'edited',
    'stage_changed',
    'archived',
    'restored',
    'owner_added',
    'owner_removed',
    'entity_linked',
    'entity_unlinked',
    'strategy_generated',
    'email_generated'
  )),
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.opportunity_activity IS 'Complete audit trail of opportunity changes';

-- ============================================================================
-- 7. SEED DEFAULT WORKFLOWS
-- ============================================================================

INSERT INTO public.pipeline_workflows (slug, name, description, is_default) VALUES
  ('bd', 'Business Development', 'External partnerships and BD opportunities', true),
  ('product', 'Product Development', 'Internal product and prototype opportunities', false),
  ('research', 'Research Tracking', 'Research questions and explorations', false);

-- ============================================================================
-- 8. SEED DEFAULT STAGES FOR BD WORKFLOW
-- ============================================================================

INSERT INTO public.pipeline_stages (workflow_id, slug, name, description, position, color)
SELECT
  w.id,
  s.slug,
  s.name,
  s.description,
  s.position,
  s.color
FROM public.pipeline_workflows w
CROSS JOIN (VALUES
  ('surfaced', 'Surfaced', 'AI-extracted or manually added opportunities', 1, NULL),
  ('researching', 'Researching', 'Active research and discovery phase', 2, NULL),
  ('qualified', 'Qualified', 'Worth pursuing based on fit assessment', 3, NULL),
  ('engaged', 'Engaged', 'In active contact with the entity', 4, NULL),
  ('closed', 'Closed', 'Deal completed or formally declined', 5, NULL)
) AS s(slug, name, description, position, color)
WHERE w.slug = 'bd';

-- ============================================================================
-- 9. SEED STAGES FOR PRODUCT WORKFLOW
-- ============================================================================

INSERT INTO public.pipeline_stages (workflow_id, slug, name, description, position, color)
SELECT
  w.id,
  s.slug,
  s.name,
  s.description,
  s.position,
  s.color
FROM public.pipeline_workflows w
CROSS JOIN (VALUES
  ('ideation', 'Ideation', 'Initial concept or idea capture', 1, NULL),
  ('prototyping', 'Prototyping', 'Building proof of concept', 2, NULL),
  ('validation', 'Validation', 'Testing with users or stakeholders', 3, NULL),
  ('development', 'Development', 'Full implementation phase', 4, NULL),
  ('shipped', 'Shipped', 'Released to production', 5, NULL)
) AS s(slug, name, description, position, color)
WHERE w.slug = 'product';

-- ============================================================================
-- 10. SEED STAGES FOR RESEARCH WORKFLOW
-- ============================================================================

INSERT INTO public.pipeline_stages (workflow_id, slug, name, description, position, color)
SELECT
  w.id,
  s.slug,
  s.name,
  s.description,
  s.position,
  s.color
FROM public.pipeline_workflows w
CROSS JOIN (VALUES
  ('question', 'Question', 'Research question identified', 1, NULL),
  ('exploring', 'Exploring', 'Gathering information and context', 2, NULL),
  ('synthesizing', 'Synthesizing', 'Connecting insights and forming conclusions', 3, NULL),
  ('documented', 'Documented', 'Findings written up and shared', 4, NULL),
  ('applied', 'Applied', 'Insights put into action', 5, NULL)
) AS s(slug, name, description, position, color)
WHERE w.slug = 'research';

-- ============================================================================
-- 11. INDEXES
-- ============================================================================

-- Opportunities filtering
CREATE INDEX idx_opportunities_workflow ON public.opportunities(workflow_id);
CREATE INDEX idx_opportunities_stage ON public.opportunities(stage_id);
CREATE INDEX idx_opportunities_status ON public.opportunities(status);
CREATE INDEX idx_opportunities_created_by ON public.opportunities(created_by);
CREATE INDEX idx_opportunities_confidence ON public.opportunities(confidence DESC);

-- Stages ordering
CREATE INDEX idx_pipeline_stages_workflow_position ON public.pipeline_stages(workflow_id, position);

-- Activity timeline
CREATE INDEX idx_opportunity_activity_opp ON public.opportunity_activity(opportunity_id, created_at DESC);
CREATE INDEX idx_opportunity_activity_user ON public.opportunity_activity(user_id);

-- Opportunity owners
CREATE INDEX idx_opportunity_owners_user ON public.opportunity_owners(user_id);

-- Opportunity entities
CREATE INDEX idx_opportunity_entities_entity ON public.opportunity_entities(entity_id);

-- ============================================================================
-- 12. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.pipeline_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_activity ENABLE ROW LEVEL SECURITY;

-- Workflows: all authenticated can read
CREATE POLICY "Authenticated users can read workflows"
  ON public.pipeline_workflows FOR SELECT
  TO authenticated
  USING (true);

-- Stages: all authenticated can read
CREATE POLICY "Authenticated users can read stages"
  ON public.pipeline_stages FOR SELECT
  TO authenticated
  USING (true);

-- Opportunity owners: all authenticated can read, editors can manage
CREATE POLICY "Authenticated users can read opportunity owners"
  ON public.opportunity_owners FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage opportunity owners"
  ON public.opportunity_owners FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Opportunity entities: all authenticated can read, editors can manage
CREATE POLICY "Authenticated users can read opportunity entities"
  ON public.opportunity_entities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage opportunity entities"
  ON public.opportunity_entities FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Activity: all authenticated can read, users can log their own
CREATE POLICY "Authenticated users can read opportunity activity"
  ON public.opportunity_activity FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can log activity"
  ON public.opportunity_activity FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 13. UPDATE OPPORTUNITIES RLS (add policies for new columns)
-- ============================================================================

-- Drop old policies if they exist and recreate
DROP POLICY IF EXISTS "Authenticated users can view opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Authenticated users can manage opportunities" ON public.opportunities;

CREATE POLICY "Authenticated users can view active opportunities"
  ON public.opportunities FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Authenticated users can insert opportunities"
  ON public.opportunities FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update opportunities"
  ON public.opportunities FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 14. ENABLE REALTIME
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.opportunities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.opportunity_activity;

-- ============================================================================
-- 15. UPDATED_AT TRIGGER FOR OPPORTUNITIES
-- ============================================================================

-- The update_updated_at function already exists from 001_initial_schema.sql
DROP TRIGGER IF EXISTS opportunities_updated_at ON public.opportunities;

CREATE TRIGGER opportunities_updated_at
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
