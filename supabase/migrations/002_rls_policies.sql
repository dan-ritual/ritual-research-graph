-- ============================================================================
-- Ritual Research Graph - RLS Policies Migration
-- Phase 1a: Row Level Security
-- Created: 2026-01-16
-- ============================================================================

-- ============================================================================
-- 1. ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.microsites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_appearances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_opportunities ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. USER POLICIES
-- ============================================================================

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

-- ============================================================================
-- 3. GENERATION JOB POLICIES
-- ============================================================================

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

-- ============================================================================
-- 4. ARTIFACT POLICIES
-- ============================================================================

-- Users can view artifacts for their own jobs
CREATE POLICY "Users can view own job artifacts"
  ON public.artifacts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.generation_jobs
      WHERE id = artifacts.job_id AND user_id = auth.uid()
    )
  );

-- Admins can view all artifacts
CREATE POLICY "Admins can view all artifacts"
  ON public.artifacts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 5. MICROSITE POLICIES
-- ============================================================================

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

-- Users can create microsites
CREATE POLICY "Users can create microsites"
  ON public.microsites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 6. ENTITY POLICIES
-- ============================================================================

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

-- ============================================================================
-- 7. ENTITY APPEARANCE POLICIES
-- ============================================================================

-- All authenticated users can view entity appearances
CREATE POLICY "Authenticated users can view entity appearances"
  ON public.entity_appearances FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Editors can modify entity appearances
CREATE POLICY "Editors can modify entity appearances"
  ON public.entity_appearances FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('editor', 'admin')
    )
  );

-- ============================================================================
-- 8. ENTITY RELATION POLICIES
-- ============================================================================

-- All authenticated users can view entity relations
CREATE POLICY "Authenticated users can view entity relations"
  ON public.entity_relations FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Editors can modify entity relations
CREATE POLICY "Editors can modify entity relations"
  ON public.entity_relations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('editor', 'admin')
    )
  );

-- ============================================================================
-- 9. OPPORTUNITY POLICIES
-- ============================================================================

-- All authenticated users can view opportunities
CREATE POLICY "Authenticated users can view opportunities"
  ON public.opportunities FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Editors can modify opportunities
CREATE POLICY "Editors can modify opportunities"
  ON public.opportunities FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('editor', 'admin')
    )
  );

-- ============================================================================
-- 10. ENTITY-OPPORTUNITY JUNCTION POLICIES
-- ============================================================================

-- All authenticated users can view entity-opportunity mappings
CREATE POLICY "Authenticated users can view entity opportunities"
  ON public.entity_opportunities FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Editors can modify entity-opportunity mappings
CREATE POLICY "Editors can modify entity opportunities"
  ON public.entity_opportunities FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('editor', 'admin')
    )
  );

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
