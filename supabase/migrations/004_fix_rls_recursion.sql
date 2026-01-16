-- ============================================================================
-- Ritual Research Graph - RLS Recursion Fix
-- Phase 1a: Fix infinite recursion in users table policies
-- Created: 2026-01-16
-- ============================================================================
--
-- Problem: The "Admins can read all users" policy queries the users table
-- while being a policy ON the users table, causing infinite recursion.
--
-- Solution: Create a SECURITY DEFINER function to check admin status without
-- triggering RLS, then use that function in policies.
-- ============================================================================

-- 1. Create helper function to check if current user is admin
-- SECURITY DEFINER runs with the function creator's privileges, bypassing RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 2. Create helper function to check if user is editor or admin
CREATE OR REPLACE FUNCTION public.is_editor_or_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role IN ('editor', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION public.is_editor_or_admin() TO authenticated;

-- 3. Drop and recreate problematic policies on users table
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;

CREATE POLICY "Admins can read all users"
  ON public.users FOR SELECT
  USING (public.is_admin());

-- 4. Update other policies to use helper functions (optional but consistent)

-- Generation Jobs
DROP POLICY IF EXISTS "Admins can view all jobs" ON public.generation_jobs;
CREATE POLICY "Admins can view all jobs"
  ON public.generation_jobs FOR SELECT
  USING (public.is_admin());

-- Artifacts
DROP POLICY IF EXISTS "Admins can view all artifacts" ON public.artifacts;
CREATE POLICY "Admins can view all artifacts"
  ON public.artifacts FOR SELECT
  USING (public.is_admin());

-- Microsites
DROP POLICY IF EXISTS "Editors can edit any microsite" ON public.microsites;
CREATE POLICY "Editors can edit any microsite"
  ON public.microsites FOR UPDATE
  USING (public.is_editor_or_admin());

-- Entities
DROP POLICY IF EXISTS "Editors can modify entities" ON public.entities;
CREATE POLICY "Editors can modify entities"
  ON public.entities FOR ALL
  USING (public.is_editor_or_admin());

-- Entity Appearances
DROP POLICY IF EXISTS "Editors can modify entity appearances" ON public.entity_appearances;
CREATE POLICY "Editors can modify entity appearances"
  ON public.entity_appearances FOR ALL
  USING (public.is_editor_or_admin());

-- Entity Relations
DROP POLICY IF EXISTS "Editors can modify entity relations" ON public.entity_relations;
CREATE POLICY "Editors can modify entity relations"
  ON public.entity_relations FOR ALL
  USING (public.is_editor_or_admin());

-- Opportunities
DROP POLICY IF EXISTS "Editors can modify opportunities" ON public.opportunities;
CREATE POLICY "Editors can modify opportunities"
  ON public.opportunities FOR ALL
  USING (public.is_editor_or_admin());

-- Entity Opportunities
DROP POLICY IF EXISTS "Editors can modify entity opportunities" ON public.entity_opportunities;
CREATE POLICY "Editors can modify entity opportunities"
  ON public.entity_opportunities FOR ALL
  USING (public.is_editor_or_admin());

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
